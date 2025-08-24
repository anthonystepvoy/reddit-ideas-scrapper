import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

def setup_comments_table():
    """Set up the comments table and related functions in Supabase."""
    
    # Read the SQL file
    with open('setup_comments_table.sql', 'r') as f:
        sql_commands = f.read()
    
    # Split into individual commands
    commands = [cmd.strip() for cmd in sql_commands.split(';') if cmd.strip()]
    
    url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }
    
    print("Setting up comments table...")
    
    for i, command in enumerate(commands, 1):
        if not command:
            continue
            
        data = {"query": command}
        
        try:
            response = requests.post(url, json=data, headers=headers)
            print(f"Command {i}: {response.status_code}")
            if response.status_code != 200:
                print(f"Error: {response.text}")
        except Exception as e:
            print(f"Error executing command {i}: {e}")
    
    print("Comments table setup complete!")

if __name__ == "__main__":
    setup_comments_table() 