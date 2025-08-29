import { createClient } from "@supabase/supabase-js";

/**
 * Use SEMPRE a SERVICE ROLE KEY no backend (Railway).
 * Ela ignora RLS e tem permissão de upload no Storage.
 * NUNCA expor esta key no frontend.
 */
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  throw new Error("SUPABASE_URL não definida no backend (Railway).");
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY não definida no backend (Railway).");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
