import os
import requests
from dotenv import load_dotenv
import logging

load_dotenv()

# Logging setup
os.makedirs('logs', exist_ok=True)
logging.basicConfig(
    filename='logs/update_idea_subjects.log',
    level=logging.INFO,
    format='%(asctime)s %(levelname)s: %(message)s'
)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Map subreddits to broad subject categories (same as in reddit_scanner.py)
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

def get_subject(subreddit, title=None, problem_statement=None):
    # 1. Try subreddit mapping
    if subreddit:
        mapped = SUBREDDIT_TO_SUBJECT.get(subreddit.lower())
        if mapped:
            return mapped
        return subreddit.capitalize()
    # 2. Keyword matching on title/problem_statement
    text = f"{title or ''} {problem_statement or ''}".lower()
    keyword_map = [
        (['devops', 'developer', 'webdev', 'programming', 'code', 'software', 'engineer', 'ux', 'design', 'sysadmin', 'cloud', 'aws', 'shopify', 'nocode'], 'Dev'),
        (['finance', 'accounting', 'bookkeeping', 'invoice', 'payment', 'payroll', 'tax'], 'Finance'),
        (['marketing', 'sales', 'advertising', 'campaign', 'leadgen'], 'Marketing'),
        (['hr', 'recruit', 'human resource', 'project management', 'customer success'], 'HR'),
        (['legal', 'paralegal', 'law', 'contract'], 'Legal'),
        (['business', 'startup', 'entrepreneur', 'sidehustle', 'agency', 'solopreneur', 'indiehackers', 'smallbusiness'], 'Business'),
        (['saas', 'microsaas'], 'SaaS'),
        (['productivity', 'workflow', 'efficiency'], 'Productivity'),
        (['idea', 'SomebodyMakeThis', 'AppIdeas', 'Business_Ideas'], 'Ideas'),
        (['b2b'], 'B2B'),
        (['ecommerce', 'shopify'], 'Ecommerce'),
        (['consulting', 'consultant'], 'Consulting'),
        (['freelance', 'freelancer'], 'Freelance'),
    ]
    for keywords, subject in keyword_map:
        if any(kw in text for kw in keywords):
            return subject
    return None

def main():
    url = f"{SUPABASE_URL}/rest/v1/ideas"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }
    # Fetch all ideas
    params = {"select": "id,subreddit,subject,title,problem_statement"}
    resp = requests.get(url, headers=headers, params=params)
    if resp.status_code != 200:
        logging.error(f"Failed to fetch ideas: {resp.status_code} {resp.text}")
        print(f"Failed to fetch ideas: {resp.status_code} {resp.text}")
        return
    ideas = resp.json()
    updated = 0
    for idea in ideas:
        if idea.get('subject'):
            continue  # Skip if already has subject
        subject = get_subject(idea.get('subreddit'), idea.get('title'), idea.get('problem_statement'))
        if not subject:
            continue
        patch_url = f"{url}?id=eq.{idea['id']}"
        patch_data = {"subject": subject}
        patch_headers = headers.copy()
        patch_headers["Prefer"] = "return=minimal"
        patch_resp = requests.patch(patch_url, headers=patch_headers, json=patch_data)
        if patch_resp.status_code in (200, 204):
            logging.info(f"Updated idea {idea['id']} with subject '{subject}'")
            updated += 1
        else:
            logging.error(f"Failed to update idea {idea['id']}: {patch_resp.status_code} {patch_resp.text}")
    print(f"Updated {updated} ideas with subject.")

if __name__ == "__main__":
    main() 