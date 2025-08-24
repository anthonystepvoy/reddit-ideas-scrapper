import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_SITE_URL = process.env.OPENROUTER_SITE_URL;
const OPENROUTER_SITE_NAME = process.env.OPENROUTER_SITE_NAME;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

const MODELS = [
  'google/gemma-3n-e4b-it:free',
  'meta-llama/llama-4-maverick:free',
  'deepseek/deepseek-r1-0528:free',
];

export async function GET() {
  try {
    // Fetch all ideas
    const { data: ideas, error } = await supabase
      .from('ideas')
      .select('id, title, problem_statement')
      .order('created_at', { ascending: false });
    if (error || !ideas || ideas.length === 0) {
      return NextResponse.json({ error: 'No ideas found.' }, { status: 404 });
    }

    // Prepare the prompt
    const ideaList = ideas.map((idea: any, idx: number) => `${idx + 1}. ${idea.title}: ${idea.problem_statement}`).join('\n');
    const prompt = `SYSTEM PROMPT:\n\nYou are \"Vantage AI,\" a venture analyst AI specializing in early-stage SaaS potential. Your purpose is to identify and rank the most promising business opportunities from a given list, providing clear, concise justifications for your decisions.\n\nEVALUATION FRAMEWORK:\n\nYou must evaluate each idea based on the following weighted criteria:\n\nProblem Severity (Painkiller vs. Vitamin): How urgent, painful, and widespread is the problem? Does it directly impact revenue or cause significant frustration? (Weight: 40%)\n\nMarket Opportunity & Niche: Is there a clear, reachable target audience? Is the market underserved or growing? Is there a specific niche to dominate first? (Weight: 25%)\n\nFeasibility for Small Teams: Can a Minimum Viable Product (MVP) be built and launched without significant outside funding or a large team? (Weight: 20%)\n\nMonetization Potential: How clear is the path to revenue? Is the value proposition strong enough that customers will pay for it? (Weight: 15%)\n\nTASK:\n\nAnalyze the list of startup problems and their corresponding SaaS ideas below. Based on your evaluation framework, select and rank the top 10 ideas with the highest overall potential.\n\nOUTPUT STRUCTURE:\n\nReturn a numbered list from 1 to 10. The justification for each ranking MUST be concise (one sentence) and explicitly reference the core reasoning from your evaluation framework.\n\nUSER PROMPT:\n\nHere is the list of startup problems and ideas:\n\n${ideaList}`;

    let lastError = null;
    for (const model of MODELS) {
      try {
        const response = await fetch(OPENROUTER_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': OPENROUTER_SITE_URL || '',
            'X-Title': OPENROUTER_SITE_NAME || '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'user', content: prompt },
            ],
          }),
        });
        const data = await response.json();
        console.log(`OpenRouter API response for model ${model}:`, JSON.stringify(data, null, 2));
        if (!response.ok) {
          console.error(`OpenRouter API error for model ${model}:`, data);
          lastError = data.error?.message || JSON.stringify(data) || 'Failed to generate top ideas.';
          continue;
        }
        const aiTopIdeas = data.choices?.[0]?.message?.content?.trim();
        if (aiTopIdeas) {
          return NextResponse.json({ top_ideas: aiTopIdeas, model });
        } else {
          console.error(`No top ideas generated for model ${model}. Full response:`, data);
          lastError = 'No top ideas generated. Please try again later.';
        }
      } catch (err) {
        console.error(`Error with model ${model}:`, err);
        lastError = err?.message || `Unknown error with model ${model}`;
      }
    }
    return NextResponse.json({ error: lastError || 'All models failed to generate top ideas.' }, { status: 500 });
  } catch (error: any) {
    console.error('AI Top Ideas API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate top ideas.' }, { status: 500 });
  }
} 