import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createDemoProfile() {
  const demoId = "00000000-0000-0000-0000-000000000000";
  console.log("Creating demo profile...");
  
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: demoId,
      display_name: "Demo User",
      avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop",
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error("Error creating profile:", error.message);
    console.log("Note: If this fails, you may need to disable RLS temporarily or log in once to create a real profile.");
  } else {
    console.log("Success! Demo profile created with ID:", demoId);
    console.log("You can now post to the community tab.");
  }
}

createDemoProfile();
