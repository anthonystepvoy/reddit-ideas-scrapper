#!/usr/bin/env python3
"""
Airtable Manager for Reddit Ideas Scrapper

A Python module for managing startup ideas in Airtable database.
Provides functions for adding, updating, and retrieving idea records.

Author: Anthony Stepvoy
License: MIT
"""

import os
from typing import Dict, List, Optional, Any
from airtable import Airtable
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s: %(message)s'
)
logger = logging.getLogger(__name__)


class AirtableIdeaManager:
    """Manages startup ideas in Airtable database."""
    
    def __init__(self):
        """Initialize the Airtable manager with configuration."""
        self.api_key = os.getenv("AIRTABLE_API_KEY")
        self.base_id = os.getenv("AIRTABLE_BASE_ID")
        self.table_name = os.getenv("AIRTABLE_TABLE_NAME")
        
        if not all([self.api_key, self.base_id, self.table_name]):
            raise ValueError("Missing Airtable configuration in environment variables")
        
        self.airtable = Airtable(self.base_id, self.table_name, api_key=self.api_key)
        logger.info("Airtable manager initialized successfully")
    
    def add_idea(self, title: str, problem: str, source: str, 
                 subreddit: Optional[str] = None, url: Optional[str] = None) -> Optional[str]:
        """
        Add a new raw idea to the Airtable database.
        
        Args:
            title: The idea title
            problem: Problem statement
            source: Data source (e.g., "Reddit", "Manual")
            subreddit: Optional subreddit name if from Reddit
            url: Optional URL to the original post
            
        Returns:
            Record ID if successful, None otherwise
        """
        try:
            record = {
                'IdeaTitle': title,
                'ProblemStatement': problem,
                'DataSource': source,
                'Status': 'Backlog'
            }
            
            if subreddit:
                record['Subreddit'] = subreddit
            if url:
                record['SourceURL'] = url
            
            result = self.airtable.insert(record)
            record_id = result['id']
            
            logger.info(f"Successfully added idea: '{title}' with ID: {record_id}")
            return record_id
            
        except Exception as e:
            logger.error(f"Error adding idea: {e}")
            return None
    
    def update_idea_status(self, idea_id: str, new_status: str) -> bool:
        """
        Update the status of an existing idea.
        
        Args:
            idea_id: The Airtable record ID
            new_status: New status value
            
        Returns:
            True if successful, False otherwise
        """
        try:
            self.airtable.update(idea_id, {'Status': new_status})
            logger.info(f"Successfully updated idea {idea_id} status to: {new_status}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating idea status: {e}")
            return False
    
    def get_ideas_by_status(self, status: str) -> List[Dict[str, Any]]:
        """
        Retrieve all ideas with a specific status.
        
        Args:
            status: Status to filter by
            
        Returns:
            List of idea records
        """
        try:
            formula = f"{{Status}}='{status}'"
            records = self.airtable.get_all(formula=formula)
            logger.info(f"Retrieved {len(records)} ideas with status: {status}")
            return records
            
        except Exception as e:
            logger.error(f"Error retrieving ideas: {e}")
            return []
    
    def enrich_idea(self, idea_id: str, solution_overview: str, 
                   opportunity_analysis: str, feasibility_score: int,
                   market_insights: str, customer_persona: str,
                   distribution_strategy: str, pricing_strategy: str) -> bool:
        """
        Enrich an existing idea with detailed analysis.
        
        Args:
            idea_id: The Airtable record ID
            solution_overview: Proposed solution
            opportunity_analysis: Market opportunity analysis
            feasibility_score: Feasibility rating (1-5)
            market_insights: Market research insights
            customer_persona: Target customer description
            distribution_strategy: Go-to-market strategy
            pricing_strategy: Pricing approach
            
        Returns:
            True if successful, False otherwise
        """
        try:
            if not 1 <= feasibility_score <= 5:
                raise ValueError("Feasibility score must be between 1 and 5")
            
            update_data = {
                'SolutionOverview': solution_overview,
                'OpportunityAnalysis': opportunity_analysis,
                'FeasibilityScore': feasibility_score,
                'MarketInsights': market_insights,
                'CustomerPersona': customer_persona,
                'DistributionStrategy': distribution_strategy,
                'PricingStrategy': pricing_strategy,
                'Status': 'Researching'
            }
            
            self.airtable.update(idea_id, update_data)
            logger.info(f"Successfully enriched idea {idea_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error enriching idea: {e}")
            return False
    
    def list_backlog_ideas(self) -> None:
        """Display all ideas in the backlog for easy review."""
        try:
            backlog_ideas = self.get_ideas_by_status('Backlog')
            
            if not backlog_ideas:
                print("📝 No ideas in backlog")
                return
            
            print(f"\n📋 Backlog Ideas ({len(backlog_ideas)} total):")
            print("-" * 60)
            
            for idea in backlog_ideas:
                fields = idea['fields']
                print(f"ID: {idea['id']}")
                print(f"Title: {fields.get('IdeaTitle', 'N/A')}")
                print(f"Problem: {fields.get('ProblemStatement', 'N/A')[:100]}...")
                print(f"Source: {fields.get('DataSource', 'N/A')}")
                if fields.get('Subreddit'):
                    print(f"Subreddit: r/{fields.get('Subreddit')}")
                print("-" * 60)
                
        except Exception as e:
            logger.error(f"Error listing backlog ideas: {e}")
            print(f"❌ Error: {e}")
    
    def get_idea_by_id(self, idea_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a specific idea by ID.
        
        Args:
            idea_id: The Airtable record ID
            
        Returns:
            Idea record if found, None otherwise
        """
        try:
            record = self.airtable.get(idea_id)
            return record
            
        except Exception as e:
            logger.error(f"Error retrieving idea {idea_id}: {e}")
            return None
    
    def delete_idea(self, idea_id: str) -> bool:
        """
        Delete an idea from the database.
        
        Args:
            idea_id: The Airtable record ID
            
        Returns:
            True if successful, False otherwise
        """
        try:
            self.airtable.delete(idea_id)
            logger.info(f"Successfully deleted idea {idea_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting idea {idea_id}: {e}")
            return False


def main():
    """Interactive command-line interface for the Airtable manager."""
    try:
        print("--- Reddit Ideas Scrapper - Airtable Manager ---")
        
        manager = AirtableIdeaManager()
        
        while True:
            print("\nOptions:")
            print("1. Add new idea")
            print("2. List backlog ideas")
            print("3. Update idea status")
            print("4. View idea details")
            print("5. Exit")
            
            choice = input("\nSelect an option (1-5): ").strip()
            
            if choice == '1':
                print("\n--- Add a New Idea ---")
                idea_title = input("Enter the Idea Title: ").strip()
                problem_statement = input("Enter the core Problem Statement: ").strip()
                data_source = input("Enter the Data Source (e.g., Reddit, Manual): ").strip()
                subreddit = input("Enter Subreddit (optional, press Enter to skip): ").strip() or None
                url = input("Enter Source URL (optional, press Enter to skip): ").strip() or None
                
                if idea_title and problem_statement and data_source:
                    record_id = manager.add_idea(idea_title, problem_statement, data_source, subreddit, url)
                    if record_id:
                        print(f"✅ Idea added successfully with ID: {record_id}")
                    else:
                        print("❌ Failed to add idea")
                else:
                    print("❌ Title, problem statement, and data source are required")
            
            elif choice == '2':
                manager.list_backlog_ideas()
            
            elif choice == '3':
                print("\n--- Update Idea Status ---")
                idea_id = input("Enter the Idea ID: ").strip()
                new_status = input("Enter new status: ").strip()
                
                if idea_id and new_status:
                    if manager.update_idea_status(idea_id, new_status):
                        print("✅ Status updated successfully")
                    else:
                        print("❌ Failed to update status")
                else:
                    print("❌ Both ID and status are required")
            
            elif choice == '4':
                print("\n--- View Idea Details ---")
                idea_id = input("Enter the Idea ID: ").strip()
                
                if idea_id:
                    idea = manager.get_idea_by_id(idea_id)
                    if idea:
                        print(f"\n📋 Idea Details:")
                        print("-" * 40)
                        for field, value in idea['fields'].items():
                            print(f"{field}: {value}")
                    else:
                        print("❌ Idea not found")
                else:
                    print("❌ Idea ID is required")
            
            elif choice == '5':
                print("👋 Goodbye!")
                break
            
            else:
                print("❌ Invalid option selected")
                
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!")
    except Exception as e:
        logger.error(f"Main execution failed: {e}")
        print(f"❌ Error: {e}")


if __name__ == '__main__':
    main() 