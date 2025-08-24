"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { useUser, useAuth } from '@clerk/nextjs';
import ReactMarkdown from 'react-markdown';

interface Comment {
  id: number;
  idea_id: number;
  parent_id: number | null;
  user_id: string;
  content: string;
  created_at: string;
  likes: number;
  replies?: Comment[];
}

interface UserProfile {
  id: string;
  imageUrl: string;
  firstName?: string;
  lastName?: string;
}

export default function IdeaDetailPage() {
  const { id } = useParams();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [idea, setIdea] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [llmIdea, setLlmIdea] = useState<string | null>(null);
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmError, setLlmError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [replyInput, setReplyInput] = useState<{ [key: number]: string }>({});
  const [commentLoading, setCommentLoading] = useState(false);
  const [userProfiles, setUserProfiles] = useState<{ [key: string]: UserProfile }>({});
  const [likedComments, setLikedComments] = useState<Set<number>>(new Set());
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editInput, setEditInput] = useState<string>("");
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
  const [commentLikes, setCommentLikes] = useState<{ [key: number]: number }>({});
  const [ideaLikes, setIdeaLikes] = useState<number>(0);
  const [ideaLiked, setIdeaLiked] = useState<boolean>(false);

  useEffect(() => {
    async function fetchIdea() {
      setLoading(true);
      const { data, error } = await supabase
        .from("ideas")
        .select("*")
        .eq("id", parseInt(id as string))
        .single();
      if (error) setIdea(null);
      else {
        setIdea(data);
        // Show cached AI SaaS idea if present
        if (data && data.ai_saas_idea) setLlmIdea(data.ai_saas_idea);
      }
      setLoading(false);
    }
    if (id) fetchIdea();
    if (id && user && user.id) fetchIdeaLikes();
  }, [id, user]);

  useEffect(() => {
    if (id) fetchComments();
    // eslint-disable-next-line
  }, [id]);

  async function fetchComments() {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('idea_id', parseInt(id as string))
      .order('created_at', { ascending: true });
    if (data) {
      // Build threaded structure
      const byId: { [key: number]: Comment } = {};
      data.forEach((c: Comment) => { byId[c.id] = { ...c, replies: [] }; });
      const root: Comment[] = [];
      data.forEach((c: Comment) => {
        if (c.parent_id) byId[c.parent_id]?.replies?.push(byId[c.id]);
        else root.push(byId[c.id]);
      });
      setComments(root);
      // Fetch user profiles for all unique user_ids
      const userIds = Array.from(new Set(data.map((c: Comment) => c.user_id)));
      fetchUserProfiles(userIds);
      // Fetch liked comments for current user
      if (user && user.id) fetchLikedComments(user.id);
      // Fetch like counts for all comments
      fetchCommentLikes(data.map((c: Comment) => c.id));
    }
  }

  async function fetchUserProfiles(userIds: string[]) {
    if (!userIds.length) return;
    // Clerk public API for user info
    try {
      const profiles: { [key: string]: UserProfile } = {};
      await Promise.all(userIds.map(async (uid) => {
        try {
          const res = await fetch(`/api/clerk-user?userId=${uid}`);
          if (res.ok) {
            const data = await res.json();
            profiles[uid] = {
              id: uid,
              imageUrl: data.imageUrl,
              firstName: data.firstName,
              lastName: data.lastName,
            };
          }
        } catch {}
      }));
      setUserProfiles(prev => ({ ...prev, ...profiles }));
    } catch {}
  }

  async function fetchLikedComments(userId: string) {
    const { data, error } = await supabase
      .from('comment_likes')
      .select('comment_id')
      .eq('user_id', userId);
    if (data) {
      setLikedComments(new Set(data.map((row: any) => row.comment_id)));
    }
  }

  async function fetchCommentLikes(commentIds: number[]) {
    if (!commentIds.length) return;
    const { data, error } = await supabase
      .from('comment_likes')
      .select('comment_id, count:comment_id')
      .in('comment_id', commentIds);
    if (data) {
      // Count likes per comment
      const likeCounts: { [key: number]: number } = {};
      commentIds.forEach(id => { likeCounts[id] = 0; });
      data.forEach((row: any) => {
        likeCounts[row.comment_id] = (likeCounts[row.comment_id] || 0) + 1;
      });
      setCommentLikes(likeCounts);
    }
  }

  async function fetchIdeaLikes() {
    if (!user || !user.id) return;
    // Get total likes
    const { count } = await supabase
      .from('idea_likes')
      .select('id', { count: 'exact', head: true })
      .eq('idea_id', parseInt(id as string));
    setIdeaLikes(count || 0);
    // Check if current user liked
    const { data } = await supabase
      .from('idea_likes')
      .select('id')
      .eq('idea_id', parseInt(id as string))
      .eq('user_id', user.id);
    setIdeaLiked(!!(data && data.length));
  }

  async function toggleIdeaLike() {
    if (!user || !user.id) return;
    if (ideaLiked) {
      // Unlike
      await supabase.from('idea_likes')
        .delete()
        .eq('idea_id', parseInt(id as string))
        .eq('user_id', user.id);
    } else {
      // Like
      await supabase.from('idea_likes').insert({
        idea_id: parseInt(id as string),
        user_id: user.id,
      });
    }
    await fetchIdeaLikes();
  }

  async function postComment(parent_id: number | null, content: string) {
    if (!user || !user.id || !content.trim()) return;
    setCommentLoading(true);
    await supabase.from('comments').insert({
      idea_id: parseInt(id as string),
      parent_id,
      user_id: user.id,
      content,
    });
    setCommentInput("");
    setReplyInput({ ...replyInput, [parent_id || 'root']: "" });
    await fetchComments();
    setCommentLoading(false);
  }

  async function likeComment(commentId: number) {
    if (!user || !user.id) return;
    if (likedComments.has(commentId)) {
      // Unlike: remove from comment_likes
      await supabase.from('comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', user.id);
    } else {
      // Like: insert into comment_likes
      await supabase.from('comment_likes').insert({
        comment_id: commentId,
        user_id: user.id,
      });
    }
    await fetchComments();
  }

  async function updateComment(commentId: number, content: string) {
    if (!content.trim()) return;
    await supabase.from('comments').update({ content }).eq('id', commentId);
    setEditingCommentId(null);
    setEditInput("");
    await fetchComments();
  }

  async function deleteComment(commentId: number) {
    await supabase.from('comments').delete().eq('id', commentId);
    setDeletingCommentId(null);
    await fetchComments();
  }

  const generateSaasIdea = async () => {
    setLlmLoading(true);
    setLlmError(null);
    setLlmIdea(null);
    try {
      const res = await fetch("/api/llm-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea_id: idea.id }),
      });
      const data = await res.json();
      if (data.saas_idea) setLlmIdea(data.saas_idea);
      else setLlmError(data.error || "No idea generated.");
    } catch (e) {
      setLlmError("Failed to fetch idea.");
    }
    setLlmLoading(false);
  };

  if (loading) return <div className="p-8 text-[#888888]">Loading...</div>;
  if (!idea) return <div className="p-8 text-red-400">Idea not found.</div>;

  function getAvatar(userId: string) {
    const profile = userProfiles[userId];
    if (profile && profile.imageUrl) {
      return <img src={profile.imageUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover mr-2" />;
    }
    // Default avatar
    return <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center text-[#888] mr-2">?</div>;
  }

  function CommentThread({ comment }: { comment: Comment }) {
    const isAuthor = user && user.id === comment.user_id;
    return (
      <div className="pl-2 border-l border-[#222] mt-4">
        <div className="flex items-center gap-2 mb-1">
          <span>{getAvatar(comment.user_id)}</span>
          <button
            className={`text-[#0085FF] hover:scale-110 transition text-lg ${likedComments.has(comment.id) ? 'font-bold' : ''}`}
            onClick={() => likeComment(comment.id)}
            title={likedComments.has(comment.id) ? 'Unlike' : 'Like'}
          >
            ▲
          </button>
          <span className="text-xs text-[#888888]">{commentLikes[comment.id] || 0}</span>
          <span className="text-xs text-[#888888] ml-2">{new Date(comment.created_at).toLocaleDateString()}</span>
          {isAuthor && (
            <>
              <button
                className="text-xs text-[#00C896] hover:underline ml-2"
                onClick={() => {
                  setEditingCommentId(comment.id);
                  setEditInput(comment.content);
                }}
              >Edit</button>
              <button
                className="text-xs text-[#FF4D4F] hover:underline ml-1"
                onClick={() => setDeletingCommentId(comment.id)}
              >Delete</button>
            </>
          )}
        </div>
        {editingCommentId === comment.id ? (
          <div className="mb-2">
            <textarea
              className="w-full bg-[#181818] text-[#F5F5F5] rounded p-2 text-sm mb-1 border border-[#222]"
              rows={2}
              value={editInput}
              onChange={e => setEditInput(e.target.value)}
              placeholder="Edit your comment..."
            />
            <button
              className="px-2 py-1 rounded bg-[#00C896] text-white text-xs font-semibold hover:bg-[#009e6d] transition disabled:opacity-50 mr-2"
              onClick={() => updateComment(comment.id, editInput)}
            >Save</button>
            <button
              className="px-2 py-1 rounded bg-[#222] text-[#888] text-xs font-semibold hover:bg-[#333] transition disabled:opacity-50"
              onClick={() => setEditingCommentId(null)}
            >Cancel</button>
          </div>
        ) : (
          <div className="text-[#F5F5F5] text-base mb-1">{comment.content}</div>
        )}
        {deletingCommentId === comment.id && (
          <div className="mb-2 text-xs text-[#FF4D4F]">
            Are you sure you want to delete this comment?
            <button
              className="ml-2 px-2 py-1 rounded bg-[#FF4D4F] text-white text-xs font-semibold hover:bg-[#b30000] transition"
              onClick={() => deleteComment(comment.id)}
            >Yes, Delete</button>
            <button
              className="ml-2 px-2 py-1 rounded bg-[#222] text-[#888] text-xs font-semibold hover:bg-[#333] transition"
              onClick={() => setDeletingCommentId(null)}
            >Cancel</button>
          </div>
        )}
        <button
          className="text-xs text-[#0085FF] hover:underline mb-1"
          onClick={() => setReplyInput({ ...replyInput, [comment.id]: replyInput[comment.id] === undefined ? '' : replyInput[comment.id] })}
        >
          Reply
        </button>
        {replyInput[comment.id] !== undefined && (
          <div className="mb-2">
            <textarea
              className="w-full bg-[#181818] text-[#F5F5F5] rounded p-2 text-sm mb-1 border border-[#222]"
              rows={2}
              value={replyInput[comment.id] || ''}
              onChange={e => setReplyInput({ ...replyInput, [comment.id]: e.target.value })}
              placeholder="Write a reply..."
            />
            <button
              className="px-2 py-1 rounded bg-[#0085FF] text-white text-xs font-semibold hover:bg-[#005fa3] transition disabled:opacity-50"
              onClick={() => postComment(comment.id, replyInput[comment.id] || '')}
              disabled={commentLoading}
            >
              {commentLoading ? 'Posting...' : 'Post Reply'}
            </button>
          </div>
        )}
        {comment.replies && comment.replies.length > 0 && (
          <div className="ml-4">
            {comment.replies.map(reply => (
              <CommentThread key={reply.id} comment={reply} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] px-4 py-16 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-white mb-4" style={{ maxWidth: 700, textAlign: 'center' }}>{idea.title}</h1>
      <div className="text-[#888888] mb-4 max-w-xl text-center">
        <span className="font-medium text-[#F5F5F5]">Problem:</span> {idea.problem_statement}
      </div>
      {/* Idea Like Button and Think with AI in one row */}
      <div className="flex items-center justify-between max-w-xl w-full mb-4 mx-auto">
        <div /> {/* Empty div for left alignment, can be used for future features */}
        <button
          className={`px-4 py-2 rounded bg-[#0085FF] text-white text-sm font-semibold hover:bg-[#005fa3] transition disabled:opacity-50 mx-auto${llmLoading ? ' breathing' : ''}`}
          onClick={generateSaasIdea}
          disabled={llmLoading || !!llmIdea}
          style={{ display: llmIdea ? 'none' : 'block', margin: '0 auto' }}
        >
          {llmLoading ? "Thinking with AI..." : "Think with AI"}
        </button>
        <style jsx>{`
          @keyframes breathe {
            0% { transform: scale(1); box-shadow: 0 0 0 0 #0085FF44; }
            50% { transform: scale(1.05); box-shadow: 0 0 12px 4px #0085FF44; }
            100% { transform: scale(1); box-shadow: 0 0 0 0 #0085FF44; }
          }
          .breathing {
            animation: breathe 1.5s infinite;
          }
        `}</style>
        <div className="flex items-center gap-1">
          <button
            className={`text-[#0085FF] hover:scale-110 transition text-2xl ${ideaLiked ? 'font-bold' : ''}`}
            onClick={toggleIdeaLike}
            title={ideaLiked ? 'Unlike' : 'Like'}
          >▲</button>
          <span className="text-xs text-[#888888]">{ideaLikes}</span>
        </div>
      </div>
      {/* AI thinking animation with 3 spinning/crossing stars */}
      {llmLoading && !llmIdea && (
        <div className="flex justify-center items-center w-full mb-4" style={{ height: 180 }}>
          <div className="relative" style={{ width: 120, height: 120 }}>
            <img
              src="/assets/ai-star.png"
              alt="AI Star"
              className="ai-star ai-star-1"
              style={{
                position: 'absolute',
                left: 0,
                top: 40,
                width: 40,
                height: 40,
                zIndex: 1,
              }}
            />
            <img
              src="/assets/ai-star.png"
              alt="AI Star"
              className="ai-star ai-star-2"
              style={{
                position: 'absolute',
                left: 40,
                top: 0,
                width: 40,
                height: 40,
                zIndex: 2,
              }}
            />
            <img
              src="/assets/ai-star.png"
              alt="AI Star"
              className="ai-star ai-star-3"
              style={{
                position: 'absolute',
                left: 80,
                top: 40,
                width: 40,
                height: 40,
                zIndex: 3,
              }}
            />
            <style jsx>{`
              .ai-star-1 {
                animation: orbit1 1.8s linear infinite;
                transform-origin: 60px 20px;
              }
              .ai-star-2 {
                animation: orbit2 2.2s linear infinite;
                transform-origin: 20px 60px;
              }
              .ai-star-3 {
                animation: orbit3 2.6s linear infinite;
                transform-origin: -20px 20px;
              }
              @keyframes orbit1 {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg);}
              }
              @keyframes orbit2 {
                0% { transform: rotate(120deg);}
                100% { transform: rotate(480deg);}
              }
              @keyframes orbit3 {
                0% { transform: rotate(240deg);}
                100% { transform: rotate(600deg);}
              }
            `}</style>
          </div>
        </div>
      )}
      {llmError && <div className="text-red-400 text-sm mb-2">{llmError}</div>}
      {llmIdea && (
        <div className="bg-[#222] text-[#F5F5F5] p-4 rounded text-sm mb-2 max-w-xl prose prose-invert prose-h2:text-xl prose-h3:text-lg prose-p:mb-2 prose-li:mb-1">
          <ReactMarkdown>
            {llmIdea.replace(/^AI SaaS Idea:|^##?\s*Vantage AI.*Concept\s*/i, '').trim()}
          </ReactMarkdown>
        </div>
      )}
      {/* Move date to bottom left of the idea card area */}
      <div className="w-full max-w-xl relative mb-8">
        <span className="absolute left-0 bottom-0 text-xs text-[#888888] pl-1 pb-1">{new Date(idea.created_at).toLocaleDateString()}</span>
      </div>
      {/* Comments Section */}
      <div className="w-full max-w-xl mt-8">
        <h2 className="text-xl font-bold text-white mb-4">Comments</h2>
        <div className="mb-4">
          <textarea
            className="w-full bg-[#181818] text-[#F5F5F5] rounded p-2 text-sm mb-2 border border-[#222]"
            rows={3}
            value={commentInput}
            onChange={e => setCommentInput(e.target.value)}
            placeholder="Write a comment..."
          />
          <button
            className="px-3 py-1 rounded bg-[#0085FF] text-white text-sm font-semibold hover:bg-[#005fa3] transition disabled:opacity-50"
            onClick={() => postComment(null, commentInput)}
            disabled={commentLoading}
          >
            {commentLoading ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
        <div>
          {comments.length === 0 && <div className="text-[#888888]">No comments yet. Be the first to comment!</div>}
          {comments.map(comment => (
            <CommentThread key={comment.id} comment={comment} />
          ))}
        </div>
      </div>
    </div>
  );
} 