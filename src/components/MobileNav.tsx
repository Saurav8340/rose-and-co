'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Isolated client component — handles ONLY the mobile hamburger button and
// slide-in drawer state. Deliberately does NOT import NavShop (which is a
// Server Component using Prisma) so this file can safely be 'use client'
// without pulling any server-only data fetching into the browser bundle.
export default function MobileNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        aria-expanded={mobileOpen}
        className="md:hidden flex items-center justify-center w-10 h-10 -ml-2 text-ivory hover:text-crimson transition cursor-pointer"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
        </svg>
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-espresso/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute top-0 left-0 bottom-0 w-[82vw] max-w-xs bg-blush border-r border-taupe/30 shadow-2xl flex flex-col animate-fade-in">
            <div className="flex items-center justify-between h-16 px-5 border-b border-taupe/20">
              <span className="font-display text-xl text-ivory">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="w-9 h-9 flex items-center justify-center text-ivory hover:text-crimson transition cursor-pointer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-col p-5 gap-1">
              <Link
                href="/shop"
                onClick={() => setMobileOpen(false)}
                className="py-3 text-sm uppercase tracking-widest text-ivory hover:text-crimson transition border-b border-taupe/10"
              >
                New Arrivals
              </Link>
              <Link
                href="/journal"
                onClick={() => setMobileOpen(false)}
                className="py-3 text-sm uppercase tracking-widest text-ivory hover:text-crimson transition border-b border-taupe/10"
              >
                Journal
              </Link>
              <Link
                href="/faq"
                onClick={() => setMobileOpen(false)}
                className="py-3 text-sm uppercase tracking-widest text-ivory hover:text-crimson transition border-b border-taupe/10"
              >
                Help
              </Link>
              <Link
                href="/wishlist"
                onClick={() => setMobileOpen(false)}
                className="py-3 text-sm uppercase tracking-widest text-ivory hover:text-crimson transition"
              >
                Wishlist
              </Link>
            </nav>

            <div className="mt-auto p-5 text-xs text-ivory/50 border-t border-taupe/20">
              Free shipping across India · Ships from Gurugram
            </div>
          </div>
        </div>
      )}
    </>
  );
}



