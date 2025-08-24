import React from 'react';
import { ClerkProvider, SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs';
import './globals.css';
import Link from 'next/link';
import CustomProfileMenu from '../components/CustomProfileMenu';

export const metadata = {
  title: 'Vantage',
  description: 'Intelligence for the Next Wave.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="font-sans bg-[#111111] min-h-screen flex flex-col">
          <nav className="sticky top-0 z-30 w-full bg-[#111111] border-b border-[#1A1A1A]">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">
              <div className="flex items-center gap-3">
                <Link href="/" className="text-2xl font-extrabold tracking-tight text-white" style={{ letterSpacing: '-0.04em' }}>
                  Vantage
                </Link>
              </div>
              <div className="flex gap-4 items-center">
                <SignedIn>
                  <Link href="/dashboard" className="text-[#0085FF] font-semibold hover:underline text-base mr-2">Dashboard</Link>
                  <CustomProfileMenu />
                </SignedIn>
                <SignedOut>
                  <SignInButton>
                    <button className="text-[#888888] font-medium hover:text-white transition">Sign In</button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="btn-accent ml-2">Sign Up</button>
                  </SignUpButton>
                </SignedOut>
              </div>
            </div>
          </nav>
          <main className="flex-1 w-full flex flex-col items-center justify-start bg-transparent">
            {children}
          </main>
          <footer className="w-full py-8 text-center text-[#888888] text-xs border-t border-[#1A1A1A] bg-[#111111] mt-12">
            &copy; {new Date().getFullYear()} Vantage. All rights reserved.
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
} 