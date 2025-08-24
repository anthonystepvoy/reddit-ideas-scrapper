# airtable_manager.py
import os
from airtable import Airtable
from dotenv import load_dotenv

load_dotenv()

# --- Configuration ---
API_KEY = os.getenv("AIRTABLE_API_KEY")
BASE_ID = os.getenv("AIRTABLE_BASE_ID")
TABLE_NAME = os.getenv("AIRTABLE_TABLE_NAME")

airtable = Airtable(BASE_ID, TABLE_NAME, api_key=API_KEY)

def add_idea(title, problem, source):
    """Adds a new raw idea to the Airtable database."""
    try:
        record = {
            'IdeaTitle': title,
            'ProblemStatement': problem,
            'DataSource': source,
            'Status': 'Backlog'
        }
        airtable.insert(record)
        print(f"✅ Successfully added idea: '{title}'")
    except Exception as e:
        print(f"❌ Error adding idea: {e}")

def update_idea_status(idea_id, new_status):
    """Updates the status of an existing idea."""
    try:
        airtable.update(idea_id, {'Status': new_status})
        print(f"✅ Successfully updated idea {idea_id} status to: {new_status}")
    except Exception as e:
        print(f"❌ Error updating idea status: {e}")

def get_ideas_by_status(status):
    """Retrieves all ideas with a specific status."""
    try:
        formula = f"{{Status}}='{status}'"
        records = airtable.get_all(formula=formula)
        return records
    except Exception as e:
        print(f"❌ Error retrieving ideas: {e}")
        return []

def enrich_idea(idea_id, solution_overview, opportunity_analysis, 
                feasibility_score, market_insights, customer_persona, 
                distribution_strategy, pricing_strategy):
    """Enriches an existing idea with detailed analysis."""
    try:
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
        airtable.update(idea_id, update_data)
        print(f"✅ Successfully enriched idea {idea_id}")
    except Exception as e:
        print(f"❌ Error enriching idea: {e}")

def list_backlog_ideas():
    """Lists all ideas in the backlog for easy review."""
    try:
        backlog_ideas = get_ideas_by_status('Backlog')
        if not backlog_ideas:
            print("📝 No ideas in backlog")
            return
        
        print("\n📋 Backlog Ideas:")
        print("-" * 50)
        for idea in backlog_ideas:
            print(f"ID: {idea['id']}")
            print(f"Title: {idea['fields'].get('IdeaTitle', 'N/A')}")
            print(f"Problem: {idea['fields'].get('ProblemStatement', 'N/A')[:100]}...")
            print(f"Source: {idea['fields'].get('DataSource', 'N/A')}")
            print("-" * 50)
    except Exception as e:
        print(f"❌ Error listing backlog ideas: {e}")

if __name__ == '__main__':
    print("--- My Idea Engine - Airtable Manager ---")
    print("1. Add new idea")
    print("2. List backlog ideas")
    print("3. Update idea status")
    print("4. Exit")
    
    choice = input("\nSelect an option (1-4): ")
    
    if choice == '1':
        print("\n--- Add a New Idea ---")
        idea_title = input("Enter the Idea Title: ")
        problem_statement = input("Enter the core Problem Statement: ")
        data_source = input("Enter the Data Source (e.g., Reddit, Manual): ")
        
        if idea_title and problem_statement and data_source:
            add_idea(idea_title, problem_statement, data_source)
        else:
            print("❌ Title, Problem, and Source are required. Aborting.")
    
    elif choice == '2':
        list_backlog_ideas()
    
    elif choice == '3':
        idea_id = input("Enter the Idea ID to update: ")
        print("Available statuses: Backlog, Researching, Prototyping")
        new_status = input("Enter new status: ")
        if idea_id and new_status:
            update_idea_status(idea_id, new_status)
        else:
            print("❌ Idea ID and status are required.")
    
    elif choice == '4':
        print("👋 Goodbye!")
    
    else:
        print("❌ Invalid option selected.") 