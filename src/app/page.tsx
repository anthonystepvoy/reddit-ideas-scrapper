import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#111111] font-sans">
      <section className="w-full flex flex-col md:flex-row items-center justify-between py-32 px-8 max-w-7xl mx-auto relative overflow-hidden">
        {/* Minimalistic SVG geometric pattern background for dark mode */}
        <svg
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none select-none"
          width="900" height="400" viewBox="0 0 900 400" fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ zIndex: 0 }}
        >
          <polyline points="0,300 120,180 240,260 360,120 480,200 600,100 720,220 900,160"
            fill="none" stroke="#0085FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="120" cy="180" r="8" fill="#0085FF" />
          <circle cx="360" cy="120" r="8" fill="#0085FF" />
          <circle cx="600" cy="100" r="8" fill="#0085FF" />
          <circle cx="900" cy="160" r="8" fill="#0085FF" />
        </svg>
        {/* Hero Text Left */}
        <div className="flex-1 flex flex-col items-start z-10 max-w-xl">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
            Intelligence for the Next Wave.
          </h1>
          <p className="text-lg md:text-xl text-[#888888] mb-10" style={{ fontFamily: 'Inter, sans-serif' }}>
            Discover, validate, and act on vetted startup opportunities from across the web. Vantage is the definitive intelligence platform for builders and investors.
          </p>
          <Link href="/ideas">
            <button className="btn-accent">Get Started</button>
          </Link>
        </div>
        {/* Hero Visual Right (optional, can add animated SVG/plexus here later) */}
        <div className="flex-1 hidden md:flex items-center justify-center z-10">
          {/* Placeholder for future animated SVG/plexus */}
        </div>
      </section>
      {/* Features Section */}
      <section className="w-full max-w-5xl mx-auto mt-8 px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="flex flex-col items-start">
            {/* Abstract stack/funnel icon */}
            <svg className="feature-icon" viewBox="0 0 32 32" fill="none"><rect x="4" y="6" width="24" height="4" rx="2" fill="#0085FF"/><rect x="8" y="14" width="16" height="4" rx="2" fill="#0085FF"/><rect x="12" y="22" width="8" height="4" rx="2" fill="#0085FF"/></svg>
            <h3 className="font-bold text-xl text-white mb-2">Vetted Opportunities</h3>
            <p className="text-[#888888]">Handpicked, high-potential ideas from across the web, filtered for quality and relevance.</p>
          </div>
          <div className="flex flex-col items-start">
            {/* Abstract target/bookmark icon */}
            <svg className="feature-icon" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="10" stroke="#0085FF" strokeWidth="3"/><circle cx="16" cy="16" r="4" fill="#0085FF"/></svg>
            <h3 className="font-bold text-xl text-white mb-2">Strategic Watchlist</h3>
            <p className="text-[#888888]">Save, track, and organize your favorite opportunities with precision.</p>
          </div>
          <div className="flex flex-col items-start">
            {/* Abstract line chart/growth arrow icon */}
            <svg className="feature-icon" viewBox="0 0 32 32" fill="none"><polyline points="4,24 12,16 20,20 28,8" stroke="#0085FF" strokeWidth="3" fill="none"/><circle cx="28" cy="8" r="3" fill="#0085FF"/></svg>
            <h3 className="font-bold text-xl text-white mb-2">Market Thesis</h3>
            <p className="text-[#888888]">Unlock data-driven insights and frameworks to build with conviction.</p>
          </div>
        </div>
      </section>
      {/* Social Proof Section */}
      <section className="w-full max-w-5xl mx-auto mt-20 px-8 mb-16">
        <div className="text-center text-[#888888] tracking-widest text-sm mb-6">TRUSTED BY LEADERS AT</div>
        <div className="social-proof-logos">
          {/* Placeholder logos, replace with real SVGs or images */}
          <svg width="90" height="28"><rect width="90" height="28" rx="8" fill="#222"/><text x="50%" y="50%" textAnchor="middle" dy=".35em" fill="#888" fontSize="18">a16z</text></svg>
          <svg width="90" height="28"><rect width="90" height="28" rx="8" fill="#222"/><text x="50%" y="50%" textAnchor="middle" dy=".35em" fill="#888" fontSize="18">YC</text></svg>
          <svg width="90" height="28"><rect width="90" height="28" rx="8" fill="#222"/><text x="50%" y="50%" textAnchor="middle" dy=".35em" fill="#888" fontSize="18">Stripe</text></svg>
          <svg width="90" height="28"><rect width="90" height="28" rx="8" fill="#222"/><text x="50%" y="50%" textAnchor="middle" dy=".35em" fill="#888" fontSize="18">Sequoia</text></svg>
        </div>
      </section>
    </main>
  );
} 