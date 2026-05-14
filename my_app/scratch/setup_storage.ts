
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function setupStorage() {
  console.log('Checking storage buckets...');
  const { data: buckets, error } = await supabase.storage.listBuckets();
  
  if (error) {
    console.error('Error listing buckets:', error);
    return;
  }

  const exists = buckets.find(b => b.name === 'post-images');
  if (!exists) {
    console.log('Creating post-images bucket...');
    // This usually fails with anon key, but let's try.
    const { data, error: createError } = await supabase.storage.createBucket('post-images', {
      public: true
    });
    if (createError) {
      console.error('Failed to create bucket (likely permission denied):', createError.message);
      console.log('IMPORTANT: Please manually create a public bucket named "post-images" in your Supabase dashboard.');
    } else {
      console.log('Bucket created successfully!');
    }
  } else {
    console.log('Bucket "post-images" already exists.');
  }
}

setupStorage();
