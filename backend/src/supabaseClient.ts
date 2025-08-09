import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // recomendado
const SUPABASE_ANON_OR_SERVICE_IN_KEY = process.env.SUPABASE_KEY;        // fallback

if (!SUPABASE_URL) {
  console.error("Config error: SUPABASE_URL is not set");
}
if (!SUPABASE_SERVICE_ROLE_KEY && !SUPABASE_ANON_OR_SERVICE_IN_KEY) {
  console.error("Config error: SUPABASE_SERVICE_ROLE_KEY or SUPABASE_KEY must be set");
}

const USING = SUPABASE_SERVICE_ROLE_KEY ? "service_role (SUPABASE_SERVICE_ROLE_KEY)" : "fallback (SUPABASE_KEY)";
console.log(`[supabase] Using ${USING}`);
console.log(`[supabase] URL set: ${!!SUPABASE_URL}`);

export const supabase = createClient(
  SUPABASE_URL ?? "",
  (SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_OR_SERVICE_IN_KEY || "")
);