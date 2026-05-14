import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getAUser() {
  const { data, error } = await supabase.from('profiles').select('id').limit(1);
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Existing User ID:", data?.[0]?.id);
  }
}

getAUser();
