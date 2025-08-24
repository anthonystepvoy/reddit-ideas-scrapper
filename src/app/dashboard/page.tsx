import React from 'react';

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#111111] font-sans px-4 py-16 flex flex-col items-center">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Your Dashboard</h1>
      <p className="text-[#888888] mb-8 text-base">Track your progress and manage your entrepreneurial journey</p>
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Welcome Widget */}
        <div className="md:col-span-2 bg-[#181818] rounded-2xl p-6 shadow-lg border border-[#222] flex flex-col mb-4">
          <h2 className="text-xl font-bold text-white mb-2">Welcome to Vantage!</h2>
          <p className="text-[#888888] text-base mb-4">Get ready to discover trending business opportunities delivered daily. We analyze Reddit discussions, track Google Trends, and package the best opportunities into actionable frameworks.</p>
          <div className="flex gap-4 mb-2">
            <button className="btn-accent">Watch the Tour</button>
            <button className="btn-accent bg-transparent border border-[#0085FF] text-[#0085FF] hover:bg-[#0085FF] hover:text-white">Compare Plans</button>
          </div>
        </div>
        {/* Feature Widgets */}
        <div className="bg-[#181818] rounded-2xl p-6 shadow-lg border border-[#222] flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[#F5F5F5] font-semibold">AI Idea Agent</span>
              <button className="btn-accent bg-[#222] text-[#0085FF] border border-[#0085FF] px-2 py-1 text-xs">Learn More</button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#F5F5F5] font-semibold">AI Agent Chats</span>
              <button className="btn-accent bg-[#222] text-[#0085FF] border border-[#0085FF] px-2 py-1 text-xs">Learn More</button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#F5F5F5] font-semibold">AI Founder Fit</span>
              <button className="btn-accent bg-[#00C896] text-white px-2 py-1 text-xs">Upgrade</button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#F5F5F5] font-semibold">Claimed Ideas</span>
              <button className="btn-accent bg-[#222] text-[#0085FF] border border-[#0085FF] px-2 py-1 text-xs">Learn More</button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#F5F5F5] font-semibold">Saved Ideas</span>
              <span className="text-[#888888]">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#F5F5F5] font-semibold">Idea Downloads</span>
              <span className="text-[#888888]">Coming Soon</span>
            </div>
          </div>
        </div>
        {/* Notifications */}
        <div className="bg-[#181818] rounded-2xl p-6 shadow border border-[#222] flex flex-col">
          <h3 className="text-lg font-bold text-white mb-2">Notifications</h3>
          <div className="text-[#888888] text-sm mb-2">Welcome to Vantage! Take a tour of what's included in your free plan.</div>
          <a href="#" className="text-[#0085FF] text-xs hover:underline">View All →</a>
        </div>
        {/* Recent Activity */}
        <div className="bg-[#181818] rounded-2xl p-6 shadow border border-[#222] flex flex-col">
          <h3 className="text-lg font-bold text-white mb-2">Recent Activity</h3>
          <div className="text-[#888888] text-sm mb-2">No recent activity</div>
          <a href="#" className="text-[#0085FF] text-xs hover:underline">View All →</a>
        </div>
        {/* Quick Links */}
        <div className="md:col-span-3 bg-[#181818] rounded-2xl p-6 shadow border border-[#222] flex flex-col md:flex-row gap-8 mt-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2">Quick Links</h3>
            <ul className="text-[#888888] text-sm space-y-2">
              <li><a href="#" className="text-[#0085FF] hover:underline">Explore Features</a></li>
              <li><a href="#" className="text-[#0085FF] hover:underline">Help & Support</a></li>
              <li><a href="#" className="text-[#0085FF] hover:underline">Upgrade Plan</a></li>
            </ul>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2">Account Settings</h3>
            <ul className="text-[#888888] text-sm space-y-2">
              <li><a href="/profile" className="text-[#0085FF] hover:underline">Manage your profile and settings</a></li>
              <li><a href="#" className="text-[#0085FF] hover:underline">What's New</a></li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
} 