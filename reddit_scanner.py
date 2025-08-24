#!/usr/bin/env python3
"""
Reddit Ideas Scrapper

A Python script for systematically mining Reddit to discover startup ideas and business opportunities.
Scans target subreddits for posts indicating pain points and problems that could be solved with software.

Author: Anthony Stepvoy
License: MIT
"""

import os
import praw
from dotenv import load_dotenv
from datetime import datetime
import requests
import logging
from typing import List, Dict, Optional
import json

# Load environment variables
load_dotenv()

# Ensure logs directory exists
os.makedirs('logs', exist_ok=True)

# Configure logging
logging.basicConfig(
    filename='logs/reddit_scraper.log',
    level=logging.INFO,
    format='%(asctime)s %(levelname)s: %(message)s'
)

logger = logging.getLogger(__name__)


class RedditIdeaScraper:
    """Main class for scraping Reddit to find startup ideas."""
    
    def __init__(self):
        """Initialize the Reddit scraper with configuration."""
        self.client_id = os.getenv("REDDIT_CLIENT_ID")
        self.client_secret = os.getenv("REDDIT_CLIENT_SECRET")
        self.user_agent = os.getenv("REDDIT_USER_AGENT")
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        # Target subreddits for idea mining
        self.target_subreddits = [
            # Business & Entrepreneurship
            'smallbusiness', 'Entrepreneur', 'startups', 'sidehustle', 
            'indiehackers', 'solopreneur', 'microsaas', 'saas', 'agency', 
            'consulting', 'freelance', 'B2B',
            # Niche Professional & B2B
            'sysadmin', 'marketing', 'sales', 'ecommerce', 'accounting', 
            'bookkeeping', 'humanresources', 'recruiting', 'projectmanagement', 
            'productmanagement', 'CustomerSuccess', 'paralegal',
            # Development & Tech
            'webdev', 'programming', 'nocode', 'shopify', 'salesforce', 
            'aws', 'devops', 'UXDesign',
            # General Productivity & Ideas
            'productivity', 'SomebodyMakeThis', 'AppIdeas', 'Business_Ideas'
        ]
        
        # Keywords indicating pain points or problems
        self.search_queries = [
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
        
        # Map subreddits to subject categories
        self.subreddit_to_subject = {
            # Development
            'webdev': 'Development',
            'programming': 'Development',
            'devops': 'Development',
            'aws': 'Development',
            'UXDesign': 'Development',
            'nocode': 'Development',
            'shopify': 'Development',
            'sysadmin': 'Development',
            # Finance
            'finance': 'Finance',
            'accounting': 'Finance',
            'bookkeeping': 'Finance',
            # Marketing
            'marketing': 'Marketing',
            'sales': 'Marketing',
            # HR
            'humanresources': 'Human Resources',
            'recruiting': 'Human Resources',
            'projectmanagement': 'Human Resources',
            'CustomerSuccess': 'Human Resources',
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
        }
        
        self.reddit = None
        self._initialize_reddit()
    
    def _initialize_reddit(self) -> None:
        """Initialize Reddit API client."""
        try:
            if not all([self.client_id, self.client_secret, self.user_agent]):
                raise ValueError("Missing Reddit API credentials in environment variables")
            
            self.reddit = praw.Reddit(
                client_id=self.client_id,
                client_secret=self.client_secret,
                user_agent=self.user_agent
            )
            logger.info("Reddit API client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Reddit client: {e}")
            raise
    
    def scan_subreddit(self, subreddit_name: str, limit: int = 100) -> List[Dict]:
        """
        Scan a specific subreddit for potential ideas.
        
        Args:
            subreddit_name: Name of the subreddit to scan
            limit: Maximum number of posts to analyze
            
        Returns:
            List of dictionaries containing post data
        """
        try:
            subreddit = self.reddit.subreddit(subreddit_name)
            posts = []
            
            for post in subreddit.hot(limit=limit):
                post_data = {
                    'id': post.id,
                    'title': post.title,
                    'url': f"https://reddit.com{post.permalink}",
                    'score': post.score,
                    'num_comments': post.num_comments,
                    'created_utc': post.created_utc,
                    'subreddit': subreddit_name,
                    'subject': self.subreddit_to_subject.get(subreddit_name, 'Other'),
                    'selftext': post.selftext[:500] if post.selftext else '',
                    'is_idea_candidate': self._is_idea_candidate(post.title, post.selftext)
                }
                posts.append(post_data)
            
            logger.info(f"Scanned {subreddit_name}: found {len(posts)} posts")
            return posts
            
        except Exception as e:
            logger.error(f"Error scanning subreddit {subreddit_name}: {e}")
            return []
    
    def _is_idea_candidate(self, title: str, content: str) -> bool:
        """
        Determine if a post is a good candidate for idea generation.
        
        Args:
            title: Post title
            content: Post content
            
        Returns:
            True if post indicates a potential business opportunity
        """
        text = f"{title} {content}".lower()
        
        # Check for pain point indicators
        pain_indicators = [
            'problem', 'issue', 'pain', 'frustrated', 'hate', 'difficult',
            'manual', 'time-consuming', 'inefficient', 'tedious', 'boring',
            'looking for', 'need help', 'solution', 'tool', 'app', 'software'
        ]
        
        return any(indicator in text for indicator in pain_indicators)
    
    def scan_all_subreddits(self, posts_per_subreddit: int = 50) -> List[Dict]:
        """
        Scan all target subreddits for ideas.
        
        Args:
            posts_per_subreddit: Number of posts to analyze per subreddit
            
        Returns:
            List of all discovered posts
        """
        all_posts = []
        
        for subreddit in self.target_subreddits:
            try:
                posts = self.scan_subreddit(subreddit, posts_per_subreddit)
                all_posts.extend(posts)
                logger.info(f"Completed scan of r/{subreddit}")
            except Exception as e:
                logger.error(f"Failed to scan r/{subreddit}: {e}")
                continue
        
        return all_posts
    
    def save_results(self, posts: List[Dict], filename: str = None) -> None:
        """
        Save scanning results to a JSON file.
        
        Args:
            posts: List of post data to save
            filename: Optional custom filename
        """
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"reddit_scan_results_{timestamp}.json"
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(posts, f, indent=2, ensure_ascii=False)
            logger.info(f"Results saved to {filename}")
        except Exception as e:
            logger.error(f"Failed to save results: {e}")
    
    def get_idea_candidates(self, posts: List[Dict]) -> List[Dict]:
        """
        Filter posts to only include strong idea candidates.
        
        Args:
            posts: List of all scanned posts
            
        Returns:
            List of posts that are strong idea candidates
        """
        return [post for post in posts if post['is_idea_candidate']]


def main():
    """Main execution function."""
    try:
        print("🚀 Starting Reddit Ideas Scraper...")
        
        scraper = RedditIdeaScraper()
        
        print(f"📊 Scanning {len(scraper.target_subreddits)} subreddits...")
        all_posts = scraper.scan_all_subreddits(posts_per_subreddit=30)
        
        print(f"✅ Found {len(all_posts)} total posts")
        
        idea_candidates = scraper.get_idea_candidates(all_posts)
        print(f"💡 Identified {len(idea_candidates)} potential idea candidates")
        
        # Save results
        scraper.save_results(all_posts)
        scraper.save_results(idea_candidates, "idea_candidates.json")
        
        print("\n🎯 Top Idea Candidates:")
        print("-" * 50)
        for i, post in enumerate(idea_candidates[:10], 1):
            print(f"{i}. {post['title'][:80]}...")
            print(f"   Subreddit: r/{post['subreddit']}")
            print(f"   Score: {post['score']} | Comments: {post['num_comments']}")
            print(f"   URL: {post['url']}")
            print("-" * 50)
        
        print(f"\n📁 Results saved to:")
        print(f"   - reddit_scan_results_*.json (all posts)")
        print(f"   - idea_candidates.json (filtered candidates)")
        
    except Exception as e:
        logger.error(f"Main execution failed: {e}")
        print(f"❌ Error: {e}")
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main()) 