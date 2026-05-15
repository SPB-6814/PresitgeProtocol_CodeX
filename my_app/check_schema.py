import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(url, key)
try:
    res = supabase.table('my_pets').select('monthly_schedule').limit(1).execute()
    print("Column exists!")
except Exception as e:
    print("Error:", e)
