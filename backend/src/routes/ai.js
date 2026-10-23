import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { z } from "zod";

const router = Router();

const schema = z.object({
  teacher: z.object({
    full_name: z.string().nullable().optional(),
    subjects: z.array(z.string()).default([]),
    experience_years: z.number().default(0),
    city: z.string().nullable().optional(),
    district: z.string().nullable().optional(),
    min_salary: z.number().nullable().optional(),
    languages: z.array(z.string()).default([]),
    certificates: z.array(z.string()).default([]),
    bio: z.string().nullable().optional()
  }),
  vacancies: z.array(z.object({
    id: z.string(),
    title: z.string(),
    subject: z.string().nullable().optional(),
    description: z.string(),
    requirements: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    district: z.string().nullable().optional(),
    salary_min: z.number().nullable().optional(),
    salary_max: z.number().nullable().optional()
  })).max(50)
});

// Heuristic matching fallback when AI API is not configured or fails
function calculateHeuristicMatches(teacher, vacancies) {
  const teacherSubjects = (teacher.subjects || []).map(s => s.toLowerCase().trim()).filter(Boolean);
  const teacherCity = (teacher.city || "").toLowerCase().trim();

  const matches = vacancies.map(v => {
    let score = 20; // base score
    const reasons = [];
    const gaps = [];

    const vacSubject = (v.subject || "").toLowerCase();
    const vacTitle = (v.title || "").toLowerCase();
    const vacCity = (v.city || "").toLowerCase().trim();

    // Subject matching
    const subjectMatched = teacherSubjects.some(s =>
      vacSubject.includes(s) || vacTitle.includes(s) || s.includes(vacSubject)
    );

    if (subjectMatched) {
      score += 45;
      reasons.push(`Fan bo‘yicha moslik: ${v.subject || v.title}`);
    } else if (teacherSubjects.length > 0) {
      gaps.push(`Vakansiya fani (${v.subject || v.title}) profilingizdagi fanlarga to‘liq mos kelmasligi mumkin`);
    }

    // Location matching
    if (teacherCity && vacCity) {
      if (teacherCity === vacCity || vacCity.includes(teacherCity) || teacherCity.includes(vacCity)) {
        score += 20;
        reasons.push(`Hudud bo‘yicha moslik (${v.city})`);
      } else {
        gaps.push(`Hudud farqi (siz: ${teacher.city}, vakansiya: ${v.city})`);
      }
    }

    // Salary matching
    if (teacher.min_salary && v.salary_max) {
      if (v.salary_max >= teacher.min_salary) {
        score += 15;
        reasons.push("Maosh talablaringizga to‘g‘ri keladi");
      } else {
        gaps.push(`Taklif etilayotgan maosh kutilganidan kamroq (${Number(v.salary_max).toLocaleString()} so‘m)`);
      }
    }

    // Experience bonus
    if (teacher.experience_years && teacher.experience_years >= 2) {
      score += 5;
      reasons.push(`${teacher.experience_years} yillik pedagogik tajriba`);
    }

    score = Math.min(100, Math.max(10, score));

    return {
      vacancy_id: v.id,
      score,
      reasons: reasons.length ? reasons : ["Umumiy pedagogik profil asosida tahlil qilindi"],
      gaps: gaps.length ? gaps : ["Qo‘shimcha talablar ko‘rsatilmagan"]
    };
  });

  matches.sort((a, b) => b.score - a.score);

  return {
    matches,
    summary: `Jami ${vacancies.length} ta vakansiya tahlil qilindi. Eng yuqori moslik: ${matches[0]?.score || 0}%.`
  };
}

// Google Gemini AI matching logic
async function matchWithGemini(apiKey, input) {
  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";

  const prompt = `You are a neutral, highly accurate job matching assistant for Uzbek teachers and schools.
Analyze this teacher profile and the list of vacancies.
Return ONLY valid JSON matching this exact JSON shape:
{
  "matches": [
    {
      "vacancy_id": "string",
      "score": 0,
      "reasons": ["string in Uzbek explaining why this is a good match"],
      "gaps": ["string in Uzbek explaining potential mismatch or requirements"]
    }
  ],
  "summary": "string in Uzbek summarizing overall recommendations"
}

Rules:
1. Score is an integer from 0 to 100 based strictly on subject, location, salary expectations, certificates, and experience.
2. All reasons, gaps, and summary must be written in natural, polite Uzbek (O'zbek tili).
3. Do not include markdown code block markers or extra conversational text. Return ONLY the raw JSON object.

Input Data:
${JSON.stringify(input, null, 2)}`;

  let raw = "";
  try {
    const res = await ai.interactions.create({
      model,
      input: prompt,
      response_format: { type: "json" }
    });
    raw = res.output_text || "";
  } catch (interactionErr) {
    console.log("Interactions API fallback to generateContent:", interactionErr.message);
    const res = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    raw = res.text || "";
  }

  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(cleaned);
}

// OpenAI matching logic (as alternative)
async function matchWithOpenAI(apiKey, input) {
  const client = new OpenAI({ apiKey });
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5-mini",
    input: [
      {
        role: "system",
        content: `You are a neutral job matching assistant for Uzbek teachers.
Return ONLY valid JSON with shape:
{"matches":[{"vacancy_id":"string","score":0,"reasons":["string"],"gaps":["string"]}],"summary":"string"}
Score is 0-100. Write reasons and gaps in Uzbek.`
      },
      { role: "user", content: JSON.stringify(input) }
    ]
  });

  const raw = (response.output_text || "").trim();
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(cleaned);
}

router.post("/match", async (req, res, next) => {
  try {
    const input = schema.parse(req.body);

    // 1. Try Google Gemini first if GEMINI_API_KEY is configured
    if (process.env.GEMINI_API_KEY) {
      try {
        const result = await matchWithGemini(process.env.GEMINI_API_KEY, input);
        return res.json(result);
      } catch (geminiErr) {
        console.warn("Google Gemini API call failed, falling back:", geminiErr.message);
      }
    }

    // 2. Try OpenAI if OPENAI_API_KEY is configured
    if (process.env.OPENAI_API_KEY) {
      try {
        const result = await matchWithOpenAI(process.env.OPENAI_API_KEY, input);
        return res.json(result);
      } catch (openaiErr) {
        console.warn("OpenAI API call failed, falling back:", openaiErr.message);
      }
    }

    // 3. Smart heuristic fallback if no AI API key is configured or API calls failed
    const fallbackResult = calculateHeuristicMatches(input.teacher, input.vacancies);
    return res.json(fallbackResult);
  } catch (e) {
    next(e);
  }
});

export default router;
