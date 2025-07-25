import 'dotenv/config'; // Isso carrega o arquivo .env automaticamente
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export { supabase };