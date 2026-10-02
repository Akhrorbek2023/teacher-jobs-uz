import { Router } from "express";
import { supabase } from "../supabase.js";
const router = Router();

router.get("/:id", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("companies").select("*, vacancies(*)").eq("id", req.params.id).maybeSingle();
    if (error || !data) return res.status(404).json({ error: "Company not found" });
    res.json({ data });
  } catch (e) { next(e); }
});
export default router;
