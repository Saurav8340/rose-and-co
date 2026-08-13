import Link from 'next/link';
import NavShop from './NavShop';
import HeaderCart from './HeaderCart';
import MobileNav from './MobileNav';

// IMPORTANT: this file has NO 'use client' directive — it must stay a
// Server Component so that <NavShop /> (which fetches products directly
// via Prisma) can keep running on the server. Putting 'use client' here
// previously broke hydration for the ENTIRE page, not just the header —
// that's why review carousels, size selectors, etc. all appeared frozen
// at the same time. All interactive menu-toggle logic now lives in the
// separate <MobileNav /> client component below instead.
export default function Header() {
  return (
    <header className="sticky top-0 z-40 rc-material-bar border-b border-taupe/20">
      <div className="container-x flex items-center justify-between h-16">
        {/* Left nav — desktop only */}
        <nav className="hidden md:flex items-center gap-8">
          <NavShop />
          <Link href="/journal" className="text-sm uppercase tracking-widest text-ivory hover:text-crimson transition">
            Journal
          </Link>
          <Link href="/faq" className="text-sm uppercase tracking-widest text-ivory hover:text-crimson transition">
            Help
          </Link>
        </nav>

        {/* Mobile hamburger + slide-in drawer — isolated client component */}
        <MobileNav />

        {/* Center logo */}
        <Link href="/" className="font-display text-2xl text-ivory hover:text-crimson transition tracking-wide">
          Rosé &amp; Co
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-6">
          <Link href="/wishlist" className="text-sm uppercase tracking-widest text-ivory hover:text-crimson transition hidden md:block">
            Wishlist
          </Link>
          <HeaderCart />
        </div>
      </div>
    </header>
  );
}




