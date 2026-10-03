import { Router } from "express";
import { z } from "zod";
import { supabase } from "../supabase.js";
import { mockVacancies } from "../data/mockVacancies.js";
import { broadcastVacancy } from "../bot.js";

const router = Router();

// In-memory array for newly created vacancies when DB is unavailable
const memoryVacancies = [...mockVacancies];

router.get("/", async (req, res, next) => {
  try {
    const { q, city, district, subject, minSalary, limit = "30" } = req.query;

    // Try Supabase first
    try {
      let query = supabase
        .from("vacancies")
        .select("*, companies(id,name,logo_url,verified)")
        .eq("status", "published")
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(Math.min(Number(limit) || 30, 100));

      if (q) {
        const safeQ = String(q).replace(/[,()]/g, " ").trim();
        if (safeQ) {
          query = query.or(`title.ilike.%${safeQ}%,description.ilike.%${safeQ}%,subject.ilike.%${safeQ}%`);
        }
      }
      if (city) query = query.eq("city", city);
      if (district) query = query.eq("district", district);
      if (subject) query = query.ilike("subject", `%${subject}%`);
      if (minSalary) {
        const numSalary = Number(minSalary);
        if (!isNaN(numSalary) && numSalary > 0) {
          query = query.gte("salary_max", numSalary);
        }
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return res.json({ data });
      }
    } catch {
      // Supabase failed or table does not exist, fall back to mock data
    }

    // Filter memory/mock vacancies
    let filtered = [...memoryVacancies];

    if (q) {
      const term = String(q).toLowerCase();
      filtered = filtered.filter(v =>
        (v.title || "").toLowerCase().includes(term) ||
        (v.description || "").toLowerCase().includes(term) ||
        (v.subject || "").toLowerCase().includes(term)
      );
    }
    if (city) {
      filtered = filtered.filter(v => v.city === city);
    }
    if (district) {
      filtered = filtered.filter(v => v.district === district);
    }
    if (subject) {
      const s = String(subject).toLowerCase();
      filtered = filtered.filter(v => (v.subject || "").toLowerCase().includes(s));
    }
    if (minSalary) {
      const num = Number(minSalary);
      if (!isNaN(num)) {
        filtered = filtered.filter(v => (v.salary_max || v.salary_min || 0) >= num);
      }
    }

    res.json({ data: filtered.slice(0, Number(limit) || 30) });
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    try {
      const { data, error } = await supabase
        .from("vacancies")
        .select("*, companies(*)")
        .eq("id", req.params.id)
        .maybeSingle();

      if (!error && data) {
        return res.json({ data });
      }
    } catch {
      // DB error
    }

    // Check memory/mock vacancies
    const found = memoryVacancies.find(v => v.id === req.params.id);
    if (found) {
      return res.json({ data: found });
    }

    res.status(404).json({ error: "Vacancy not found" });
  } catch (e) {
    next(e);
  }
});

const vacancySchema = z.object({
  title: z.string().min(3),
  subject: z.string().optional().nullable(),
  description: z.string().min(10),
  requirements: z.string().optional().nullable(),
  responsibilities: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  salary_min: z.number().nonnegative().optional().nullable(),
  salary_max: z.number().nonnegative().optional().nullable(),
  salary_text: z.string().optional().nullable(),
  employment_type: z.string().optional().nullable(),
  company_id: z.string().uuid().optional().nullable()
});

router.post("/", async (req, res, next) => {
  try {
    const parsed = vacancySchema.parse(req.body);
    const now = new Date().toISOString();
    let saved = null;

    try {
      const { data, error } = await supabase.from("vacancies").insert({
        ...parsed,
        status: "published",
        published_at: now,
        source_type: "manual"
      }).select().single();

      if (!error && data) {
        saved = data;
      }
    } catch {
      // DB insert failed
    }

    if (!saved) {
      saved = {
        id: "v-" + Math.random().toString(36).substring(2, 9),
        ...parsed,
        status: "published",
        published_at: now,
        source_type: "manual",
        verified: false
      };
      memoryVacancies.unshift(saved);
    }

    // Trigger Telegram Broadcast asynchronously
    broadcastVacancy(saved).catch(err => console.error("Broadcast error:", err.message));

    res.status(201).json({ data: saved });
  } catch (e) {
    next(e);
  }
});

export default router;
