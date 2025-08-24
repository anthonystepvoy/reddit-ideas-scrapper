import os
import requests
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

data = {
    "title": "Test Idea",
    "problem_statement": "This is a test insert from Python.",
    "data_source": "Manual",
    "status": "Backlog"
}

url = f"{SUPABASE_URL}/rest/v1/ideas"
headers = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

response = requests.post(url, json=data, headers=headers)
print(response.status_code, response.text) 