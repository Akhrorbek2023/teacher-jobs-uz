import { Router } from "express";
import { z } from "zod";
import { supabase } from "../supabase.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { q, city, district, subject, minSalary, limit = "30" } = req.query;
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
    if (error) throw error;
    res.json({ data: data || [] });
  } catch (e) { next(e); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("vacancies")
      .select("*, companies(*)")
      .eq("id", req.params.id)
      .maybeSingle();
    if (error) return res.status(404).json({ error: "Vacancy not found" });
    if (!data) return res.status(404).json({ error: "Vacancy not found" });
    res.json({ data });
  } catch (e) { next(e); }
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
    const { data, error } = await supabase.from("vacancies").insert({
      ...parsed,
      status: "published",
      published_at: now,
      source_type: "manual"
    }).select().single();
    if (error) throw error;
    res.status(201).json({ data });
  } catch (e) { next(e); }
});

export default router;
