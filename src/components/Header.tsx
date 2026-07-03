'use client';
import Link from 'next/link';
import { useCart } from './CartContext';
import { useWishlist } from './WishlistContext';
import MadeInIndiaBadge from './MadeInIndiaBadge';
import { SITE } from '@/lib/constants';

export default function Header() {
  const { count: cartCount } = useCart();
  const { count: wishCount } = useWishlist();

  return (
    <header className="sticky top-0 z-40 bg-ivory/95 backdrop-blur border-b border-taupe/20">
      <div className="container-x flex items-center justify-between h-16 sm:h-20 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-display text-2xl sm:text-3xl tracking-[0.15em] text-wine">
            {SITE.name.toUpperCase()}
          </Link>
          <MadeInIndiaBadge />
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm uppercase tracking-widest text-espresso">
          <Link href="/" className="hover:text-wine">Home</Link>
          <Link href="/product/amara-marble-swirl-coord-set" className="hover:text-wine">Shop</Link>
          <Link href="/journal" className="hover:text-wine">Journal</Link>
          <Link href="/about" className="hover:text-wine">About</Link>
          <Link href="/contact" className="hover:text-wine">Contact</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/wishlist" aria-label="Wishlist" className="relative flex items-center text-espresso hover:text-wine">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>
            {wishCount > 0 && <span className="absolute -top-2 -right-2 bg-wine text-ivory text-[10px] rounded-full w-5 h-5 flex items-center justify-center">{wishCount}</span>}
          </Link>
          <Link href="/cart" aria-label="Cart" className="relative flex items-center gap-2 text-espresso hover:text-wine">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121 0 2.09-.77 2.34-1.865l1.437-6.323A1.125 1.125 0 0021.14 4.5H5.653m1.847 9.75L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/></svg>
            {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-wine text-ivory text-[10px] rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}
