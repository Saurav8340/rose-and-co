import Link from 'next/link';
import NavShop from './NavShop';
import HeaderCart from './HeaderCart';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-ivory/90 backdrop-blur border-b border-taupe/10">
      <div className="container-x flex items-center justify-between h-16">
        {/* Left nav */}
        <nav className="hidden md:flex items-center gap-8">
          <NavShop />
          <Link href="/journal" className="text-sm uppercase tracking-widest text-espresso hover:text-wine transition">
            Journal
          </Link>
          <Link href="/faq" className="text-sm uppercase tracking-widest text-espresso hover:text-wine transition">
            Help
          </Link>
        </nav>

        {/* Center logo */}
        <Link href="/" className="font-display text-2xl text-espresso hover:text-wine transition">
          Rosé &amp; Co
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-6">
          <Link href="/wishlist" className="text-sm uppercase tracking-widest text-espresso hover:text-wine transition hidden md:block">
            Wishlist
          </Link>
          <HeaderCart />
        </div>
      </div>
    </header>
  );
}
