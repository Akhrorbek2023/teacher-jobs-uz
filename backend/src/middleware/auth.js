import { supabase } from "../supabase.js";

export async function optionalAuth(req, _res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return next();
  const { data } = await supabase.auth.getUser(token);
  req.user = data?.user ?? null;
  next();
}

export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Authorization required" });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return res.status(401).json({ error: "Invalid session" });
  req.user = data.user;
  next();
}
