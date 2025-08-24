import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

def setup_comments_table():
    """Set up the comments table and related functions in Supabase."""
    
    # SQL commands to execute
    sql_commands = [
        """
        CREATE TABLE IF NOT EXISTS comments (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
            parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
            user_id TEXT NOT NULL,
            content TEXT NOT NULL,
            likes INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_comments_idea_id ON comments(idea_id);
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
        """,
        """
        CREATE OR REPLACE FUNCTION increment_comment_likes(comment_id UUID)
        RETURNS void AS $$
        BEGIN
            UPDATE comments
            SET likes = likes + 1
            WHERE id = comment_id;
        END;
        $$ LANGUAGE plpgsql;
        """
    ]
    
    print("Setting up comments table...")
    
    for i, command in enumerate(sql_commands, 1):
        print(f"Executing command {i}...")
        
        # Use the SQL editor endpoint
        url = f"{SUPABASE_URL}/rest/v1/"
        headers = {
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/json"
        }
        
        # For now, let's just test the connection
        try:
            response = requests.get(f"{SUPABASE_URL}/rest/v1/ideas?select=count", headers=headers)
            print(f"Connection test: {response.status_code}")
            if response.status_code == 200:
                print("✅ Connected to Supabase successfully!")
            else:
                print(f"❌ Connection failed: {response.text}")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print("\n📋 To complete the setup, please:")
    print("1. Go to your Supabase project dashboard")
    print("2. Open the SQL Editor")
    print("3. Copy and paste the following SQL commands:")
    print("\n" + "="*50)
    print("""
-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_idea_id ON comments(idea_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- Create function to increment comment likes
CREATE OR REPLACE FUNCTION increment_comment_likes(comment_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE comments
    SET likes = likes + 1
    WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql;
    """)
    print("="*50)

if __name__ == "__main__":
    setup_comments_table() 