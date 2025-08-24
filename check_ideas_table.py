import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

def check_ideas_table():
    """Check the structure of the ideas table."""
    
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }
    
    # Try to get a sample idea to see the structure
    try:
        response = requests.get(f"{SUPABASE_URL}/rest/v1/ideas?limit=1", headers=headers)
        print(f"Response status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            if data:
                idea = data[0]
                print("Sample idea structure:")
                for key, value in idea.items():
                    print(f"  {key}: {type(value).__name__} = {value}")
            else:
                print("No ideas found in the table")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_ideas_table() 