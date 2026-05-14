import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  console.log("Testing insert into posts...");
  const { data, error } = await supabase
    .from('posts')
    .insert([
      {
        caption: "Test post",
        image_url: "https://example.com/image.png",
        location: "Test Location",
        likes: 0,
        mood: "Happy"
      }
    ])
    .select();
    
  if (error) {
    console.error("INSERT ERROR:", error);
  } else {
    console.log("INSERT SUCCESS:", data);
  }
}

testInsert();
