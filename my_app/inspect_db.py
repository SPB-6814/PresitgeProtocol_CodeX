import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(url, key)

tables = ['community_posts', 'my_pets']
for t in tables:
    try:
        res = supabase.table(t).select('*').limit(1).execute()
        print(f"--- Table {t} ---")
        if res.data:
            print(res.data[0].keys())
        else:
            print("Empty")
    except Exception as e:
        print(f"Error reading {t}: {e}")
