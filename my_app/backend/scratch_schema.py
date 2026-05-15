import os
from supabase import create_client

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(url, key)
try:
    res = supabase.rpc('execute_sql', {'sql_query': 'ALTER TABLE my_pets ADD COLUMN IF NOT EXISTS monthly_schedule JSONB;'}).execute()
    print("Success via RPC:", res)
except Exception as e:
    print("RPC failed, trying raw insert to see schema:", e)
