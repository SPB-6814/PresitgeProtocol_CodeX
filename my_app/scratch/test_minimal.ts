import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testMinimalInsert() {
  console.log("Testing minimal insert into posts...");
  const { data, error } = await supabase
    .from('posts')
    .insert([
      {
        caption: "Minimal post",
        image_url: "https://example.com/image.png"
      }
    ])
    .select();
    
  if (error) {
    console.error("MINIMAL INSERT ERROR:", error);
  } else {
    console.log("MINIMAL INSERT SUCCESS:", data);
  }
}

testMinimalInsert();
