'use client';

import Link from 'next/link';
import { useCart } from '@/components/CartContext';

/**
 * Live cart count from CartContext (the single source of truth), so the badge
 * updates the instant an item is added — instead of reading localStorage once
 * on mount and going stale. The badge count is spring-free but the number swap
 * keys off `count` so it animates in cleanly.
 */
export default function HeaderCart() {
  const { count } = useCart();

  return (
    <Link
      href="/cart"
      className="relative text-sm uppercase tracking-widest text-ivory hover:text-crimson transition"
      aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}
    >
      Cart
      {count > 0 && (
        <span
          key={count}
          className="absolute -top-2 -right-4 bg-wine text-ivory text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-fade-in tabular-nums"
        >
          {count}
        </span>
      )}
    </Link>
  );
}




