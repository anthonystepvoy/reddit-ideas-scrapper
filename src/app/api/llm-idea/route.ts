import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_SITE_URL = process.env.OPENROUTER_SITE_URL;
const OPENROUTER_SITE_NAME = process.env.OPENROUTER_SITE_NAME;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const MODELS = [
  'google/gemma-3n-e4b-it:free',
  'meta-llama/llama-4-maverick:free',
  'deepseek/deepseek-r1-0528:free',
];

export async function POST(req: NextRequest) {
  try {
    const { idea_id } = await req.json();
    if (!idea_id) {
      return NextResponse.json({ error: 'Missing idea_id.' }, { status: 400 });
    }

    // 1. Check if ai_saas_idea already exists for this idea
    const { data: idea, error } = await supabase
      .from('ideas')
      .select('id, problem_statement, ai_saas_idea')
      .eq('id', idea_id)
      .single();
    if (error || !idea) {
      return NextResponse.json({ error: 'Idea not found.' }, { status: 404 });
    }
    if (idea.ai_saas_idea) {
      return NextResponse.json({ saas_idea: idea.ai_saas_idea, cached: true });
    }

    // 2. If not, generate with LLM
    const prompt = `SYSTEM PROMPT:\n\nYou are \"Vantage AI,\" a product strategist and co-founder AI for early-stage ventures. Your expertise is in identifying lean, high-potential SaaS opportunities from real-world problems. Your tone is insightful, concise, and professional.\n\nYour task is to analyze the user-provided problem statement and generate a compelling SaaS concept. The concept must be specific, actionable, and tailored for an indie hacker or a small, agile team. Avoid overly complex or capital-intensive ideas.\n\nOUTPUT STRUCTURE:\n\nProvide the output in a structured markdown format.\n\nConcept Name: [A creative and memorable name for the SaaS]\n\nValue Proposition: [A single, powerful sentence describing the core benefit and target user]\n\nCore Features (MVP):\n- [Feature 1: The absolute essential function that solves the core problem]\n- [Feature 2: A key feature that enhances the core loop or provides key data]\n- [Feature 3: A feature that supports user retention or personalization]\n\nMonetization Strategy: [A plausible model, e.g., 'Freemium with paid analytics', 'Tiered subscription based on usage', 'Per-seat pricing']\n\nUSER PROMPT:\n\nProblem: ${idea.problem_statement}`;

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
          lastError = data.error?.message || JSON.stringify(data) || 'Failed to generate SaaS idea.';
          continue;
        }

        const saasIdea = data.choices?.[0]?.message?.content?.trim();
        if (saasIdea) {
          // 3. Store the result in the database
          await supabase
            .from('ideas')
            .update({ ai_saas_idea: saasIdea })
            .eq('id', idea_id);
          return NextResponse.json({ saas_idea: saasIdea, model, cached: false });
        } else {
          console.error(`No SaaS idea generated for model ${model}. Full response:`, data);
          lastError = 'No SaaS idea generated. Please try again later.';
        }
      } catch (err) {
        console.error(`Error with model ${model}:`, err);
        lastError = err?.message || `Unknown error with model ${model}`;
      }
    }
    return NextResponse.json({ error: lastError || 'All models failed to generate a SaaS idea.' }, { status: 500 });
  } catch (error: any) {
    console.error('LLM API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate SaaS idea.' }, { status: 500 });
  }
} 