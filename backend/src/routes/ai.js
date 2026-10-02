import { Router } from "express";
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

// Heuristic matching fallback when OpenAI is not configured
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

router.post("/match", async (req, res, next) => {
  try {
    const input = schema.parse(req.body);

    if (!process.env.OPENAI_API_KEY) {
      // Return smart heuristic match if OpenAI API is not configured
      const fallbackResult = calculateHeuristicMatches(input.teacher, input.vacancies);
      return res.json(fallbackResult);
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    try {
      const response = await client.responses.create({
        model: process.env.OPENAI_MODEL || "gpt-5-mini",
        input: [
          {
            role: "system",
            content: `You are a neutral job matching assistant for Uzbek teachers.
Return ONLY valid JSON with shape:
{"matches":[{"vacancy_id":"string","score":0,"reasons":["string"],"gaps":["string"]}],"summary":"string"}
Score is 0-100 and must reflect explicit profile/vacancy compatibility, not personality or protected traits.
Do not invent requirements. Write reasons and gaps in Uzbek.`
          },
          { role: "user", content: JSON.stringify(input) }
        ]
      });

      const raw = (response.output_text || "").trim();
      const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      const result = JSON.parse(cleaned);
      return res.json(result);
    } catch (openaiErr) {
      console.warn("OpenAI API call failed, falling back to heuristic matching:", openaiErr.message);
      const fallbackResult = calculateHeuristicMatches(input.teacher, input.vacancies);
      return res.json(fallbackResult);
    }
  } catch (e) {
    next(e);
  }
});

export default router;
