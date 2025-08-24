"use client";
import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'next/navigation';

interface Idea {
  id: string;
  title: string;
  problem_statement: string;
  solution_overview: string;
  opportunity_analysis: string;
  feasibility_score: number;
  market_insights: string;
  customer_persona: string;
  distribution_strategy: string;
  pricing_strategy: string;
  data_source: string;
  status: string;
  created_at: string;
  subject?: string;
}

const IDEAS_PER_PAGE = 12;

function IdeaCard({ idea, saved, onToggleSave, user = {} }: {
  idea: Idea;
  saved: boolean;
  onToggleSave: (id: string) => void;
  user?: any;
}) {
  const router = useRouter();

  return (
    <div
      className="bg-[#1A1A1A] rounded-2xl shadow-lg p-6 flex flex-col transition-all border border-transparent hover:border-[#0085FF] hover:shadow-[0_4px_32px_0_rgba(0,133,255,0.10)] hover:-translate-y-1 relative cursor-pointer"
      style={{ minHeight: 180 }}
      onClick={() => router.push(`/ideas/${idea.id}`)}
    >
      <h2 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>{idea.title}</h2>
      <p className="text-[#888888] text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
        <span className="font-medium text-[#F5F5F5]">Problem:</span> {idea.problem_statement.slice(0, 100)}{idea.problem_statement.length > 100 ? '...' : ''}
      </p>
      {idea.subject && (
        <span className="inline-block bg-[#222] text-[#00C2FF] px-2 py-1 rounded text-xs mb-2">{idea.subject}</span>
      )}
      <button
        className="mb-2 px-3 py-1 rounded bg-[#0085FF] text-white text-xs font-semibold hover:bg-[#005fa3] transition disabled:opacity-50"
        onClick={e => { e.stopPropagation(); router.push(`/ideas/${idea.id}`); }}
      >
        Think with AI
      </button>
      <div className="flex flex-row items-center justify-between gap-2 mt-auto">
        <span className="bg-[#222] text-[#888888] px-2 py-1 rounded text-xs">{new Date(idea.created_at).toLocaleDateString()}</span>
        <button
          className="text-[#0085FF] hover:scale-110 transition"
          onClick={e => { e.stopPropagation(); onToggleSave(idea.id); }}
          aria-label={saved ? 'Unsave idea' : 'Save idea'}
          disabled={!user || !user.id}
        >
          {saved ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="#0085FF" viewBox="0 0 24 24" width="28" height="28"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#0085FF" strokeWidth="2" viewBox="0 0 24 24" width="28" height="28"><path d="M12.1 8.64l-.1.1-.11-.11C10.14 6.6 7.1 7.24 5.6 9.28c-1.5 2.04-1.1 5.12 1.4 7.05L12 21.35l4.99-5.02c2.5-1.93 2.9-5.01 1.4-7.05-1.5-2.04-4.54-2.68-6.29-0.64z"/></svg>
          )}
        </button>
      </div>
    </div>
  );
}

// Floating stars animation component
function FloatingStars() {
  return (
    <div className="flex justify-center items-center h-24">
      <div className="relative w-32 h-24">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float-star"
            style={{
              left: `${Math.random() * 90}%`,
              top: `${Math.random() * 80}%`,
              fontSize: `${Math.random() * 1.2 + 0.8}rem`,
              color: '#0085FF',
              opacity: 0.7 + Math.random() * 0.3,
              animationDelay: `${Math.random() * 2}s`,
            }}
          >
            ★
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper: fuzzy match leaderboard title to idea title
function normalizeTitle(str: string): string {
  return str
    .toLowerCase()
    .replace(/\*+/g, '') // remove markdown bold/italics
    .replace(/\d+\.?/g, '') // remove leading numbers and dots
    .replace(/[^a-z0-9 ]/gi, '') // remove punctuation
    .replace(/\s+/g, ' ') // collapse whitespace
    .trim();
}

function findMatchingIdeaId(leaderboardTitle: string, ideas: Idea[]): string | null {
  const normLeaderboard = normalizeTitle(leaderboardTitle);
  console.log('Leaderboard title (raw):', leaderboardTitle);
  console.log('Leaderboard title (normalized):', normLeaderboard);
  for (const idea of ideas) {
    console.log('Idea title (raw):', idea.title, '| Normalized:', normalizeTitle(idea.title));
  }
  // Try exact match (case-insensitive, normalized)
  let found = ideas.find((idea: Idea) => normalizeTitle(idea.title) === normLeaderboard);
  if (found) return found.id;
  // Try partial match (normalized)
  found = ideas.find((idea: Idea) =>
    normalizeTitle(idea.title).includes(normLeaderboard) ||
    normLeaderboard.includes(normalizeTitle(idea.title))
  );
  if (found) return found.id;
  // Try fuzzy match (first 10+ chars, normalized)
  found = ideas.find((idea: Idea) =>
    normalizeTitle(idea.title).slice(0, 10) === normLeaderboard.slice(0, 10)
  );
  if (found) return found.id;
  return null;
}

export default function IdeasPage() {
  const { user: rawUser } = useUser();
  const user = rawUser || { id: undefined };
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [savedIdeaIds, setSavedIdeaIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [subjectFilter, setSubjectFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [saveError, setSaveError] = useState<string | null>(null);

  // Leaderboard state
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<string | null>(null);
  const [leaderboardList, setLeaderboardList] = useState<any[]>([]);
  const [leaderboardDate, setLeaderboardDate] = useState<string>('');

  const router = useRouter();

  // Helper: get today's date string
  function getTodayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  // Fetch all ideas
  useEffect(() => {
    async function fetchIdeas() {
      setLoading(true);
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) setError(error.message);
      else setIdeas(data || []);
      setLoading(false);
    }
    fetchIdeas();
  }, []);

  // Fetch saved ideas for the user
  useEffect(() => {
    if (!user || !user.id) return;
    async function fetchSaved() {
      const { data, error } = await supabase
        .from('saved_ideas')
        .select('idea_id')
        .eq('user_id', user.id);
      if (error) {
        setSaveError('Error fetching saved ideas: ' + error.message);
        console.error('Supabase fetchSaved error:', error);
      }
      setSavedIdeaIds(new Set((data || []).map((row: any) => row.idea_id)));
    }
    fetchSaved();
  }, [user]);

  // Save or unsave an idea
  async function toggleSave(ideaId: string) {
    setSaveError(null);
    if (!user?.id) return;
    try {
      if (savedIdeaIds.has(ideaId)) {
        // Unsave
        const { error } = await supabase
          .from('saved_ideas')
          .delete()
          .eq('user_id', user?.id)
          .eq('idea_id', ideaId);
        if (error) {
          setSaveError('Error unsaving idea: ' + error.message);
          console.error('Supabase unsave error:', error);
        } else {
          setSavedIdeaIds(prev => {
            const next = new Set(prev);
            next.delete(ideaId);
            return next;
          });
        }
      } else {
        // Save
        const { error } = await supabase
          .from('saved_ideas')
          .insert({ user_id: user?.id, idea_id: ideaId });
        if (error) {
          setSaveError('Error saving idea: ' + error.message);
          console.error('Supabase save error:', error);
        } else {
          setSavedIdeaIds(prev => new Set(prev).add(ideaId));
        }
      }
    } catch (e) {
      setSaveError('Unexpected error saving idea.');
      console.error('toggleSave error:', e);
    }
  }

  // Filtering and Sorting
  let filteredIdeas = ideas.filter((idea) => {
    return (
      (statusFilter ? idea.status === statusFilter : true) &&
      (sourceFilter ? idea.data_source === sourceFilter : true) &&
      (subjectFilter ? idea.subject === subjectFilter : true)
    );
  });
  if (sortOrder === 'newest') {
    filteredIdeas = filteredIdeas.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else {
    filteredIdeas = filteredIdeas.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  // Pagination
  const totalPages = Math.ceil(filteredIdeas.length / IDEAS_PER_PAGE);
  const pagedIdeas = filteredIdeas.slice((page - 1) * IDEAS_PER_PAGE, page * IDEAS_PER_PAGE);

  // Unique status, data sources, and subjects for filter dropdowns
  const statusOptions = Array.from(new Set(ideas.map(i => i.status))).filter(Boolean);
  const sourceOptions = Array.from(new Set(ideas.map(i => i.data_source))).filter(Boolean);
  const subjectOptions = Array.from(new Set(ideas.map(i => i.subject))).filter(Boolean);

  // Leaderboard cache logic
  useEffect(() => {
    if (showLeaderboard) {
      const today = getTodayStr();
      setLeaderboardDate(today);
      const cached = localStorage.getItem(`ai_leaderboard_${today}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setLeaderboard(parsed.leaderboard);
          setLeaderboardList(parsed.leaderboardList);
          setLeaderboardLoading(false);
          setLeaderboardError(null);
          return;
        } catch {}
      }
      fetchLeaderboard();
    }
  }, [showLeaderboard]);

  // Fetch AI leaderboard
  async function fetchLeaderboard() {
    setLeaderboardLoading(true);
    setLeaderboardError(null);
    setLeaderboard(null);
    setLeaderboardList([]);
    try {
      const res = await fetch('/api/ai-top-ideas');
      const data = await res.json();
      if (data.top_ideas) {
        setLeaderboard(data.top_ideas);
        // Parse numbered list into array
        let list = data.top_ideas.split(/\n\d+\. /).filter(Boolean).map((item: any, idx: number) => {
          // Remove markdown, numbers, and extract title before colon
          let rawTitle = item.split(':')[0] || '';
          rawTitle = rawTitle.replace(/\*+/g, '').replace(/\d+\.?/g, '').replace(/^[^a-zA-Z0-9]+/, '').trim();
          const [_, ...rest] = item.split(':');
          return {
            number: idx + 1,
            title: rawTitle,
            justification: rest.join(':').trim(),
          };
        });
        // Remove the first item if it looks like an analysis header
        if (list.length > 0 && list[0].title.toLowerCase().includes('analysis and ranking')) {
          list = list.slice(1);
        }
        setLeaderboardList(list);
        // Cache in localStorage
        const today = getTodayStr();
        localStorage.setItem(`ai_leaderboard_${today}`,
          JSON.stringify({ leaderboard: data.top_ideas, leaderboardList: list })
        );
      } else {
        setLeaderboardError(data.error || 'No leaderboard data.');
      }
    } catch (e: any) {
      setLeaderboardError(e.message || 'Failed to fetch leaderboard.');
    }
    setLeaderboardLoading(false);
  }

  // Refresh leaderboard (clear cache and re-fetch)
  function refreshLeaderboard() {
    const today = getTodayStr();
    localStorage.removeItem(`ai_leaderboard_${today}`);
    fetchLeaderboard();
  }

  if (error) {
    return (
      <div className="p-8 text-red-400 bg-[#111111] min-h-screen">Error loading ideas: {error}</div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] px-4 py-16 flex flex-col items-center">
      <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
        Vantage Idea Database
      </h1>
      <div className="w-24 h-1 bg-[#0085FF] rounded-full mb-12" />
      {/* Leaderboard Toggle Button */}
      <button
        className="mb-8 px-6 py-2 rounded bg-[#0085FF] text-white text-base font-semibold hover:bg-[#005fa3] transition disabled:opacity-50"
        onClick={() => {
          setShowLeaderboard(v => !v);
        }}
        disabled={leaderboardLoading}
      >
        {showLeaderboard ? 'Hide AI Leaderboard' : leaderboardLoading ? 'Loading AI Leaderboard...' : 'Show AI Leaderboard'}
      </button>
      {showLeaderboard && (
        <button
          className="mb-4 ml-4 px-4 py-1 rounded bg-[#222] text-[#0085FF] text-xs font-semibold hover:bg-[#333] border border-[#0085FF]"
          onClick={refreshLeaderboard}
          disabled={leaderboardLoading}
        >
          Refresh Leaderboard
        </button>
      )}
      {/* Leaderboard Section */}
      {showLeaderboard && (
        <div className="w-full max-w-3xl bg-[#1A1A1A] rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">AI Leaderboard: Top 10 SaaS Ideas</h2>
          {leaderboardError && <div className="text-red-400 mb-2">{leaderboardError}</div>}
          {leaderboardLoading ? (
            <div className="flex justify-center items-center w-full mb-4" style={{ height: 120 }}>
              <div className="relative" style={{ width: 120, height: 120 }}>
                <img
                  src="/assets/ai-star.png"
                  alt="AI Star (1)"
                  className="ai-star ai-star-1"
                  style={{
                    position: 'absolute',
                    left: 40,
                    top: 40,
                    width: 40,
                    height: 40,
                    zIndex: 1,
                  }}
                />
                <img
                  src="/assets/ai-star.png"
                  alt="AI Star (2)"
                  className="ai-star ai-star-2"
                  style={{
                    position: 'absolute',
                    left: 40,
                    top: 40,
                    width: 40,
                    height: 40,
                    zIndex: 2,
                  }}
                />
                <img
                  src="/assets/ai-star.png"
                  alt="AI Star (3)"
                  className="ai-star ai-star-3"
                  style={{
                    position: 'absolute',
                    left: 40,
                    top: 40,
                    width: 40,
                    height: 40,
                    zIndex: 3,
                  }}
                />
                <style jsx>{`
                  .ai-star-1 {
                    animation: orbit-star-1 3.5s linear infinite;
                  }
                  .ai-star-2 {
                    animation: orbit-star-2 3.5s linear infinite;
                  }
                  .ai-star-3 {
                    animation: orbit-star-3 3.5s linear infinite;
                  }
                  @keyframes orbit-star-1 {
                    0%   { transform: rotate(0deg)   translate(25px) scale(0.7) rotate(0deg); }
                    25%  { transform: rotate(90deg)  translate(40px) scale(1.2) rotate(-90deg); }
                    50%  { transform: rotate(180deg) translate(25px) scale(0.7) rotate(-180deg); }
                    75%  { transform: rotate(270deg) translate(25px) scale(0.5) rotate(-270deg); }
                    100% { transform: rotate(360deg) translate(25px) scale(0.7) rotate(-360deg); }
                  }
                  @keyframes orbit-star-2 {
                    0%   { transform: rotate(120deg)  translate(25px) scale(0.7) rotate(-120deg); }
                    25%  { transform: rotate(210deg)  translate(40px) scale(1.2) rotate(-210deg); }
                    50%  { transform: rotate(300deg)  translate(25px) scale(0.7) rotate(-300deg); }
                    75%  { transform: rotate(390deg)  translate(25px) scale(0.5) rotate(-390deg); }
                    100% { transform: rotate(480deg)  translate(25px) scale(0.7) rotate(-480deg); }
                  }
                  @keyframes orbit-star-3 {
                    0%   { transform: rotate(240deg)  translate(25px) scale(0.7) rotate(-240deg); }
                    25%  { transform: rotate(330deg)  translate(40px) scale(1.2) rotate(-330deg); }
                    50%  { transform: rotate(420deg)  translate(25px) scale(0.7) rotate(-420deg); }
                    75%  { transform: rotate(510deg)  translate(25px) scale(0.5) rotate(-510deg); }
                    100% { transform: rotate(600deg)  translate(25px) scale(0.7) rotate(-600deg); }
                  }
                `}</style>
              </div>
            </div>
          ) : leaderboardList.length > 0 ? (
            <div className="flex flex-col gap-4">
              {leaderboardList.map((item, idx) => {
                // Try to find a matching idea id for this leaderboard item
                const matchedId = findMatchingIdeaId(item.title || '', ideas);
                return (
                  <div
                    key={idx}
                    className={`group bg-[#222] rounded-lg p-4 border border-[#333] transition ${matchedId ? 'cursor-pointer hover:border-[#0085FF] hover:bg-[#181f2a]' : 'opacity-60 cursor-not-allowed'}`}
                    onClick={() => matchedId && router.push(`/ideas/${matchedId}`)}
                    tabIndex={matchedId ? 0 : -1}
                    role="button"
                    aria-disabled={!matchedId}
                    title={matchedId ? 'Click to view full idea' : 'Idea not found in database'}
                    onKeyDown={e => { if (matchedId && (e.key === 'Enter' || e.key === ' ')) router.push(`/ideas/${matchedId}`); }}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[#0085FF] font-bold text-lg">{item.number}.</span>
                      <span className="text-white font-semibold text-lg">{item.title}</span>
                    </div>
                    <div className="text-[#F5F5F5] text-base">{item.justification}</div>
                    {!matchedId && <div className="text-xs text-[#888888] mt-1">(Idea not found in database)</div>}
                  </div>
                );
              })}
            </div>
          ) : (
            leaderboard && <pre className="whitespace-pre-wrap text-[#F5F5F5] text-base mb-2">{leaderboard}</pre>
          )}
        </div>
      )}
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-4 mb-8 w-full max-w-7xl items-center justify-between">
        <select
          className="bg-[#1A1A1A] text-[#F5F5F5] border border-[#222] rounded px-4 py-2 focus:outline-none"
          value={subjectFilter}
          onChange={e => { setSubjectFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Subjects</option>
          {subjectOptions.map(subject => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
        <select
          className="bg-[#1A1A1A] text-[#F5F5F5] border border-[#222] rounded px-4 py-2 focus:outline-none"
          value={sortOrder}
          onChange={e => { setSortOrder(e.target.value as 'newest' | 'oldest'); setPage(1); }}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
        <div className="text-[#888888] text-sm">
          {filteredIdeas.length} results
        </div>
      </div>
      {saveError && <div className="text-red-400 mb-4">{saveError}</div>}
      {loading ? (
        <div className="text-[#888888]">Loading...</div>
      ) : (
        <>
          <div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
            {pagedIdeas.length > 0 ? (
              pagedIdeas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  saved={savedIdeaIds.has(idea.id)}
                  onToggleSave={toggleSave}
                  user={user || {}}
                />
              ))
            ) : (
              <div className="col-span-full text-center text-[#888888]">No ideas found.</div>
            )}
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex gap-2 justify-center items-center mt-12">
              <button
                className="px-3 py-1 rounded bg-[#1A1A1A] border border-[#222] text-[#F5F5F5] disabled:opacity-40"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Prev
              </button>
              <span className="text-[#888888] mx-2">Page {page} of {totalPages}</span>
              <button
                className="px-3 py-1 rounded bg-[#1A1A1A] border border-[#222] text-[#F5F5F5] disabled:opacity-40"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 