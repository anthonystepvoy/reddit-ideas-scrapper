# Reddit Ideas Scrapper 🚀

> **Note**: This project was originally built for personal use and is now being shared publicly to contribute to the developer community.

A comprehensive intelligence platform for capturing, analyzing, and developing startup ideas using systematic data collection and AI-powered enrichment. Built with Next.js, Supabase, and AI integration.

## 🎯 Project Overview

This project implements the "Pragmatic Builder's Action Plan" - a strategic approach to building a personal idea generation and analysis system that's superior to scraping competitors. It combines:

- **Patient Collector**: Manual + API-based idea capture
- **Systematic Reddit Mining**: Automated problem discovery
- **Enrichment Pipeline**: AI-powered idea development
- **Remix Framework**: Strategic differentiation and innovation

<div align="center">

<img width="1210" height="859" alt="image" src="https://github.com/user-attachments/assets/40c66a2f-248c-4ca1-a816-2696dedefc3a" />


<img width="1382" height="907" alt="image" src="https://github.com/user-attachments/assets/47221711-43ec-4d49-9cbd-ff50a56eb44b" />

</div>


## 🛠️ Tech Stack

- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **Database**: Supabase
- **AI Integration**: OpenAI API
- **Backend Scripts**: Python for data collection

## 📁 Project Structure

```
reddit-ideas-scrapper/
├── src/                    # Next.js app router
│   ├── app/               # Next.js app router
│   ├── components/        # React components
│   └── utils/            # Utility functions
├── public/                # Static assets
├── airtable_manager.py    # Airtable database interactions
├── reddit_scanner.py      # Reddit idea mining
├── requirements.txt       # Python dependencies
└── package.json          # Node.js dependencies
```

## 🚀 Quick Start

### Frontend Setup (Next.js)

1. **Clone the repository**
   ```bash
   git clone https://github.com/anthonystepvoy/reddit-ideas-scrapper.git
   cd reddit-ideas-scrapper
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Copy `.env.local.example` to `.env.local`
   - Add your API keys for Clerk, Supabase, and OpenAI

4. **Run the development server:**
   ```bash
   npm run dev
   ```

### Backend Setup (Python Scripts)

1. **Set up Python virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Configure Python environment:**
   - Set up your Reddit API credentials
   - Configure Airtable API access

## 📊 Airtable Database Schema

| Field Name | Data Type | Notes |
|------------|-----------|-------|
| `IdeaID` | Autonumber | Auto-generated |
| `IdeaTitle` | Single line text | |
| `ProblemStatement` | Long text | |
| `SolutionOverview` | Long text | |
| `OpportunityAnalysis` | Long text | |
| `FeasibilityScore` | Rating (1-5) | |
| `MarketInsights` | Long text | Enable rich text |
| `CustomerPersona` | Long text | Enable rich text |
| `DistributionStrategy` | Long text | Enable rich text |
| `PricingStrategy` | Single line text | |
| `DataSource` | Single select | Options: "Reddit", "IdeaBrowser Daily", "Manual" |
| `Status` | Single select | Options: "Backlog", "Researching", "Prototyping" |

## 🤖 AI Prompts Library

### Prompt 1: The "Tedious Workflow" Generator
*Use this to generate new raw ideas based on Greg Isenberg's methodology*

```
Based on Greg Isenberg's methodology, give me 10 tedious, manual, or repetitive workflows that a [Insert Profession, e.g., 'Paralegal', 'e-commerce store owner', 'project manager'] does that AI could automate. For each one, briefly describe the pain point.
```

### Prompt 2: The "Idea Enrichment" Pipeline
*Use this when you have a raw idea and want to fill out your database fields*

```
I have a startup concept. Act as a startup analyst and help me enrich it based on the following schema.

**Idea Title:** [e.g., "AI-Powered Report Formatter for Accountants"]
**Problem Statement:** [e.g., "Accountants spend hours manually copying data from various sources into a standardized weekly report format. It's time-consuming, error-prone, and soul-crushing."]

Now, generate the following fields:
- **Solution Overview:**
- **Opportunity Analysis:** (Why is now the right time?)
- **Initial Customer Persona:** (Be specific: name, role, frustrations, goals)
- **Data-Driven Market Insights:** (Provide some hypothetical but realistic data points on market size or trends)
- **Ranked Distribution Strategy:** (List 3-4 potential customer acquisition channels)
- **Suggested Pricing Strategy:**
```

### Prompt 3: The "Remix Framework"
*Use this on existing ideas to generate differentiated versions*

```
I want to apply the "Remix Framework" to an existing business concept.

**Original Concept:** [e.g., A prayer reminders app called "Prayminder"]
**Core Components:** [e.g., It's a free, solitary app for Christians to list prayers and get reminders]
**Known Weaknesses:** [e.g., The Android app is buggy, it's limited to one religion, and it has no community or B2B features]

Now, perform Step 3 and 4 of the framework:

1. **Identify Differentiating Angles:** Brainstorm multiple vectors for differentiation based on the weaknesses (e.g., Niche, Technology, Business Model, Feature Set).

2. **Rebuild and Differentiate:** Generate three distinct "remixes" based on these angles. For each remix, provide a new concept name, its core value proposition, its target audience, and a potential monetization model.
```

## 🔄 Complete Workflow

1. **Daily/Weekly:** Run `python reddit_scanner.py` to find raw problems
2. **Capture:** Use `python airtable_manager.py` to log promising ideas with status "Backlog"
3. **Enrich:** Pick backlog ideas and use the "Idea Enrichment" prompt to generate detailed fields
4. **Remix & Innovate:** Use the "Remix Framework" prompt on your most promising ideas
5. **Prototype:** Start coding MVPs for your best remixed ideas

## 🛠️ Usage Examples

### Adding a new idea manually:
```bash
python airtable_manager.py
```

### Scanning Reddit for problems:
```bash
python reddit_scanner.py
```

## 📈 Strategic Benefits

This system provides several advantages over competitor scraping:

1. **Ethical & Legal**: No copyright issues or terms of service violations
2. **Proprietary Data**: Your insights are unique and valuable
3. **Scalable Process**: Systematic approach that improves over time
4. **Defensible Position**: Builds real expertise and market understanding
5. **Innovation Focus**: Generates truly new ideas rather than copying existing ones

## 🔒 Security Notes

- Never commit your `.env` file to version control
- Keep your API keys secure and rotate them regularly
- The `.gitignore` file is configured to exclude sensitive files

## 📚 Resources

- [Airtable API Documentation](https://airtable.com/api)
- [PRAW (Python Reddit API Wrapper)](https://praw.readthedocs.io/)
- [Greg Isenberg's Content](https://twitter.com/gregisenberg)

---

*Built with ❤️ using Cursor's AI-assisted coding capabilities* 
