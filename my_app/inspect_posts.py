import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(url, key)

try:
    res = supabase.table('posts').select('*').limit(1).execute()
    print("--- Table posts ---")
    if res.data:
        print(res.data[0].keys())
    else:
        print("Empty but schema exists.")
except Exception as e:
    print(f"Error reading posts: {e}")
