import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // recomendado no backend
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY; // fallback

if (!SUPABASE_URL) {
  console.error("Config error: SUPABASE_URL is not set");
}
if (!SUPABASE_SERVICE_ROLE_KEY && !SUPABASE_ANON_KEY) {
  console.error("Config error: SUPABASE_SERVICE_ROLE_KEY or SUPABASE_KEY must be set");
}

export const supabase = createClient(
  SUPABASE_URL ?? "",
  (SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY || "")
);