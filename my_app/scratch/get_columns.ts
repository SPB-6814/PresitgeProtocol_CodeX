import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getColumns() {
  // We can use a RPC or query the PostgREST endpoint for schema info if possible
  // But a simple trick is to query one row and see keys
  const { data, error } = await supabase.from('posts').select('*').limit(1);
  if (error) {
    console.error("Error:", error);
  } else {
    // If table is empty, data is [], so we can't see keys this way.
    // Try to insert a row with NO columns and see the error? No.
    // Use the /rest/v1/?apikey=... endpoint?
    console.log("Data:", data);
  }
}

getColumns();
