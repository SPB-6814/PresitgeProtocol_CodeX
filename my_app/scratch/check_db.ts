
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDb() {
  console.log('Checking posts table...');
  const { data: posts, error: postsError } = await supabase.from('posts').select('*').limit(5);
  if (postsError) {
    console.error('Error fetching posts:', postsError);
  } else {
    console.log('Posts found:', posts?.length);
    if (posts && posts.length > 0) {
      console.log('Sample post columns:', Object.keys(posts[0]));
      console.log('Sample post data:', posts[0]);
    }
  }

  console.log('\nChecking comments table...');
  const { data: comments, error: commentsError } = await supabase.from('comments').select('*').limit(5);
  if (commentsError) {
    console.error('Error fetching comments:', commentsError);
  } else {
    console.log('Comments found:', comments?.length);
  }
}

checkDb();
