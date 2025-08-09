import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL) {
  console.error("Config error: SUPABASE_URL is not set");
}
if (!SUPABASE_KEY) {
  console.error("Config error: SUPABASE_KEY is not set");
}

export const supabase = createClient(
  SUPABASE_URL ?? "",
  SUPABASE_KEY ?? ""
);