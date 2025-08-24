"use client";
import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';

export default function ProfilePage() {
  const { user } = useUser();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [about, setAbout] = useState('');
  const [emailPref, setEmailPref] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      // Fetch about and emailPref from Supabase
      fetchProfileExtras();
    }
  }, [user]);

  async function fetchProfileExtras() {
    if (!user) return;
    const { data } = await supabase
      .from('user_profiles')
      .select('about, email_pref')
      .eq('user_id', user.id)
      .single();
    if (data) {
      setAbout(data.about || '');
      setEmailPref(!!data.email_pref);
    }
  }

  async function handleUpdateProfile() {
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      // Update Clerk profile
      await user?.update({ firstName, lastName });
      // Update Supabase profile extras
      if (user) {
        await supabase.from('user_profiles').upsert({
          user_id: user.id,
          about,
          email_pref: emailPref,
        });
      }
      setSuccess('Profile updated!');
    } catch (e) {
      setError('Failed to update profile.');
    }
    setLoading(false);
  }

  async function handleUpdateEmail() {
    // Clerk handles email update via their UI
    window.open('https://dashboard.clerk.com/', '_blank');
  }

  async function handleResetPassword() {
    // Clerk handles password reset via their UI
    window.open('https://dashboard.clerk.com/', '_blank');
  }

  if (!user) return <div className="p-8 text-[#888888]">Loading...</div>;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#111111] px-4 py-16">
      <div className="w-full max-w-xl bg-[#181818] rounded-2xl shadow-lg p-8 border border-[#222] flex flex-col items-center">
        <img src={user.imageUrl} alt="avatar" className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-[#0085FF]" />
        <button className="text-xs text-[#0085FF] hover:underline mb-4" onClick={() => window.open('https://dashboard.clerk.com/', '_blank')}>Change Photo</button>
        <form className="w-full flex flex-col gap-4" onSubmit={e => { e.preventDefault(); handleUpdateProfile(); }}>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-[#888888] text-xs mb-1">First Name</label>
              <input type="text" className="w-full bg-[#222] text-white rounded p-2 mb-2" value={firstName} onChange={e => setFirstName(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="block text-[#888888] text-xs mb-1">Last Name</label>
              <input type="text" className="w-full bg-[#222] text-white rounded p-2 mb-2" value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-[#888888] text-xs mb-1">About You</label>
            <textarea className="w-full bg-[#222] text-white rounded p-2 mb-2" rows={3} value={about} onChange={e => setAbout(e.target.value)} placeholder="Share your background, goals, and anything else you want the AI to know about you." />
          </div>
          <button type="submit" className="btn-accent w-full" disabled={loading}>{loading ? 'Updating...' : 'Update Profile'}</button>
          {success && <div className="text-green-400 text-xs mt-1">{success}</div>}
          {error && <div className="text-red-400 text-xs mt-1">{error}</div>}
        </form>
        <div className="w-full mt-8">
          <div className="mb-4">
            <label className="block text-[#888888] text-xs mb-1">Current Email</label>
            <input type="text" className="w-full bg-[#222] text-white rounded p-2 mb-2" value={user.primaryEmailAddress?.emailAddress} disabled />
            <button className="w-full px-4 py-2 rounded bg-[#222] text-[#0085FF] text-sm font-semibold hover:bg-[#333] transition mb-2" onClick={handleUpdateEmail}>Update Email</button>
          </div>
          <div className="mb-4">
            <label className="block text-[#888888] text-xs mb-1">Password</label>
            <input type="password" className="w-full bg-[#222] text-white rounded p-2 mb-2" value="********" disabled />
            <button className="w-full px-4 py-2 rounded bg-[#222] text-[#0085FF] text-sm font-semibold hover:bg-[#333] transition" onClick={handleResetPassword}>Reset Password</button>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <label className="text-[#888888] text-xs">Idea of the Day Emails</label>
            <input type="checkbox" checked={emailPref} onChange={e => setEmailPref(e.target.checked)} />
          </div>
        </div>
      </div>
    </div>
  );
} 