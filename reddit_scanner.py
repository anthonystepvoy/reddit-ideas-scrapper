# reddit_scanner.py
import os
import praw
from dotenv import load_dotenv
from datetime import datetime
import requests
import logging

load_dotenv()

# Ensure logs directory exists
os.makedirs('logs', exist_ok=True)

logging.basicConfig(
    filename='logs/reddit_scraper.log',
    level=logging.INFO,
    format='%(asctime)s %(levelname)s: %(message)s'
)

# --- Configuration ---
CLIENT_ID = os.getenv("REDDIT_CLIENT_ID")
CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET")
USER_AGENT = os.getenv("REDDIT_USER_AGENT")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# List of subreddits where professionals gather and discuss problems
TARGET_SUBREDDITS = [
    # Business & Entrepreneurship
    'smallbusiness', 'Entrepreneur', 'startups', 'sidehustle', 'indiehackers', 'solopreneur', 'microsaas', 'saas', 'agency', 'consulting', 'freelance', 'B2B',
    # Niche Professional & B2B
    'sysadmin', 'marketing', 'sales', 'ecommerce', 'accounting', 'bookkeeping', 'humanresources', 'recruiting', 'projectmanagement', 'productmanagement', 'CustomerSuccess', 'paralegal',
    # Development & Tech
    'webdev', 'programming', 'nocode', 'shopify', 'salesforce', 'aws', 'devops', 'UXDesign',
    # General Productivity & Ideas
    'productivity', 'SomebodyMakeThis', 'AppIdeas', 'Business_Ideas'
]

# Keywords that indicate a user is looking for a solution or experiencing pain
SEARCH_QUERIES = [
    '"is there a tool for"',
    '"how do you solve"',
    '"i hate doing this"',
    '"manual process for"',
    '"looking for a solution"',
    '"frustrated with"',
    '"wish there was a way"',
    '"tired of manually"',
    '"automate this process"',
    '"pain point"',
    '"workflow problem"',
    '"inefficient process"'
]

# Map subreddits to broad subject categories
SUBREDDIT_TO_SUBJECT = {
    # Dev
    'webdev': 'Dev',
    'programming': 'Dev',
    'devops': 'Dev',
    'aws': 'Dev',
    'UXDesign': 'Dev',
    'nocode': 'Dev',
    'shopify': 'Dev',
    'sysadmin': 'Dev',
    # Finance
    'finance': 'Finance',
    'accounting': 'Finance',
    'bookkeeping': 'Finance',
    # Marketing
    'marketing': 'Marketing',
    'sales': 'Marketing',
    # HR
    'humanresources': 'HR',
    'recruiting': 'HR',
    'projectmanagement': 'HR',
    'CustomerSuccess': 'HR',
    # Legal
    'paralegal': 'Legal',
    # Business
    'smallbusiness': 'Business',
    'Entrepreneur': 'Business',
    'startups': 'Business',
    'sidehustle': 'Business',
    'indiehackers': 'Business',
    'solopreneur': 'Business',
    'agency': 'Business',
    # SaaS
    'saas': 'SaaS',
    'microsaas': 'SaaS',
    # Productivity
    'productivity': 'Productivity',
    # Ideas
    'SomebodyMakeThis': 'Ideas',
    'AppIdeas': 'Ideas',
    'Business_Ideas': 'Ideas',
    # B2B
    'B2B': 'B2B',
    # Ecommerce
    'ecommerce': 'Ecommerce',
    # Consulting
    'consulting': 'Consulting',
    # Freelance
    'freelance': 'Freelance',
}

def assign_subject_ai(idea):
    """
    Stub for future AI-based subject assignment.
    Given idea dict, return a subject string using LLM.
    """
    # Example: call OpenAI or other LLM here
    # return ai_assign_subject(idea['title'], idea['problem_hint'], idea['subreddit'])
    return None

def insert_idea_to_supabase(idea):
    logging.info(f"Inserting idea: {idea}")
    url = f"{SUPABASE_URL}/rest/v1/ideas"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    # Determine subject from subreddit (use AI stub if needed)
    subject = SUBREDDIT_TO_SUBJECT.get(idea.get('subreddit', '').lower(), idea.get('subreddit', '').capitalize())
    # ai_subject = assign_subject_ai(idea) or subject
    data = {
        "title": idea["title"],
        "problem_statement": idea["problem_hint"],
        "data_source": "Reddit",
        "status": "Backlog",
        "subject": subject
    }
    response = requests.post(url, json=data, headers=headers)
    logging.info(f"Supabase response: {response.status_code} {response.text}")
    if response.status_code == 201:
        logging.info(f"✅ Inserted idea into Supabase: {idea['title']}")
    else:
        logging.error(f"❌ Failed to insert idea: {response.text}")

def scan_reddit():
    """Scans Reddit for posts indicating unsolved problems."""
    try:
        reddit = praw.Reddit(
            client_id=CLIENT_ID,
            client_secret=CLIENT_SECRET,
            user_agent=USER_AGENT,
        )
        logging.info("✅ Successfully connected to Reddit API.")
        
        all_potential_ideas = []
        
        for sub_name in TARGET_SUBREDDITS:
            try:
                subreddit = reddit.subreddit(sub_name)
                logging.info(f"🔍 Scanning r/{sub_name}...")
                
                for query in SEARCH_QUERIES:
                    try:
                        for submission in subreddit.search(query, sort='new', time_filter='month', limit=3):
                            # Skip if post is too old or has no content
                            if submission.created_utc < (datetime.now().timestamp() - 30 * 24 * 3600):
                                continue
                            
                            idea_data = {
                                'title': submission.title,
                                'problem_hint': submission.selftext[:300] if submission.selftext else "No description",
                                'url': submission.url,
                                'subreddit': sub_name,
                                'score': submission.score,
                                'comments': submission.num_comments,
                                'created': datetime.fromtimestamp(submission.created_utc).strftime('%Y-%m-%d')
                            }
                            all_potential_ideas.append(idea_data)
                            # Insert into Supabase
                            insert_idea_to_supabase(idea_data)
                            
                    except Exception as e:
                        logging.error(f"⚠️  Error searching query '{query}' in r/{sub_name}: {e}", exc_info=True)
                        continue
                        
            except Exception as e:
                logging.error(f"⚠️  Error accessing r/{sub_name}: {e}", exc_info=True)
                continue
        
        # Sort ideas by engagement (score + comments)
        all_potential_ideas.sort(key=lambda x: x['score'] + x['comments'], reverse=True)
        
        # Display results
        if all_potential_ideas:
            logging.info(f"🎯 Found {len(all_potential_ideas)} potential ideas!")
            for i, idea in enumerate(all_potential_ideas[:10], 1):  # Show top 10
                logging.info(f"{i}. 📝 {idea['title']} | r/{idea['subreddit']} | Score: {idea['score']} | Comments: {idea['comments']} | Posted: {idea['created']} | URL: {idea['url']} | Problem hint: {idea['problem_hint']}...")
        else:
            logging.info("📝 No potential ideas found in this scan.")
            
    except Exception as e:
        logging.error(f"❌ Error connecting to or scanning Reddit: {e}", exc_info=True)

def scan_specific_subreddit(subreddit_name, limit=10):
    """Scans a specific subreddit for recent posts that might indicate problems."""
    try:
        reddit = praw.Reddit(
            client_id=CLIENT_ID,
            client_secret=CLIENT_SECRET,
            user_agent=USER_AGENT,
        )
        
        subreddit = reddit.subreddit(subreddit_name)
        logging.info(f"🔍 Scanning recent posts in r/{subreddit_name}...")
        
        ideas_found = []
        
        for submission in subreddit.new(limit=limit):
            # Look for problem indicators in the title
            problem_indicators = ['help', 'problem', 'issue', 'frustrated', 'hate', 'tired', 'manual', 'automate']
            title_lower = submission.title.lower()
            
            if any(indicator in title_lower for indicator in problem_indicators):
                idea_data = {
                    'title': submission.title,
                    'problem_hint': submission.selftext[:300] if submission.selftext else "No description",
                    'url': submission.url,
                    'subreddit': subreddit_name,
                    'score': submission.score,
                    'comments': submission.num_comments,
                    'created': datetime.fromtimestamp(submission.created_utc).strftime('%Y-%m-%d')
                }
                ideas_found.append(idea_data)
        
        if ideas_found:
            logging.info(f"🎯 Found {len(ideas_found)} potential ideas in r/{subreddit_name}!")
            for idea in ideas_found:
                logging.info(f"📝 {idea['title']} | Score: {idea['score']} | Comments: {idea['comments']} | URL: {idea['url']}")
        else:
            logging.info(f"📝 No obvious problem indicators found in recent r/{subreddit_name} posts.")
            
    except Exception as e:
        logging.error(f"❌ Error scanning r/{subreddit_name}: {e}", exc_info=True)

if __name__ == '__main__':
    logging.info("--- My Idea Engine - Reddit Scanner ---")
    print("--- My Idea Engine - Reddit Scanner ---")
    print("1. Full scan (all subreddits and queries)")
    print("2. Scan specific subreddit")
    print("3. Exit")
    
    choice = input("\nSelect an option (1-3): ")
    
    if choice == '1':
        scan_reddit()
    elif choice == '2':
        subreddit = input("Enter subreddit name (without r/): ")
        if subreddit:
            scan_specific_subreddit(subreddit)
        else:
            print("❌ Please enter a valid subreddit name.")
    elif choice == '3':
        print("👋 Goodbye!")
    else:
        print("❌ Invalid option selected.") 