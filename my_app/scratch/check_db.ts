import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
  console.log("Checking posts table...");
  const { data, error } = await supabase.from('posts').select('*').limit(1);
  if (error) {
    console.error("Error fetching posts:", error);
  } else {
    console.log("Post data sample:", data);
  }

  console.log("Checking profiles table...");
  const { data: profiles, error: pError } = await supabase.from('profiles').select('*').limit(1);
  if (pError) {
    console.error("Error fetching profiles:", pError);
  } else {
    console.log("Profile data sample:", profiles);
  }
}

checkSchema();
