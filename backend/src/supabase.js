import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

export const isSupabaseConfigured = Boolean(
  process.env.SUPABASE_URL &&
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  !process.env.SUPABASE_URL.includes("placeholder")
);

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

