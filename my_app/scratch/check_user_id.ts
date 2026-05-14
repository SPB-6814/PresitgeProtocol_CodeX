import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkColumns() {
  console.log("Checking columns by trying to insert and reading error...");
  // Try to insert a column that definitely doesn't exist to see if it lists others? No.
  // Just try user_id
  const { error } = await supabase.from('posts').insert([{ user_id: '00000000-0000-0000-0000-000000000000' }]);
  console.log("Error with user_id:", error?.message);
}

checkColumns();
