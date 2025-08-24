"use client";
import { useUser, useAuth } from '@clerk/nextjs';
import { useState, useRef, useEffect } from 'react';

export default function CustomProfileMenu() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;
  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 focus:outline-none">
        <img src={user.imageUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-[#222]" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-[#181818] border border-[#222] rounded-lg shadow-lg z-50">
          <div className="px-4 py-3 border-b border-[#222]">
            <div className="font-semibold text-white">{user.fullName}</div>
            <div className="text-xs text-[#888888]">{user.primaryEmailAddress?.emailAddress}</div>
          </div>
          <a href="/profile" className="block px-4 py-2 text-sm text-[#0085FF] hover:bg-[#222]">Profile</a>
          <a href="/dashboard" className="block px-4 py-2 text-sm text-[#0085FF] hover:bg-[#222]">Dashboard</a>
          <button
            className="block w-full text-left px-4 py-2 text-sm text-[#FF4D4F] hover:bg-[#222]"
            onClick={() => signOut()}
          >Sign out</button>
        </div>
      )}
    </div>
  );
} 