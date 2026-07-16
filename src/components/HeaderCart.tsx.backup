'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function HeaderCart() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Read cart count from localStorage or your cart store
    try {
      const raw = localStorage.getItem('cart');
      if (raw) {
        const cart = JSON.parse(raw);
        setCount(Array.isArray(cart) ? cart.length : (cart.items?.length || 0));
      }
    } catch {}
  }, []);

  return (
    <Link href="/cart" className="relative text-sm uppercase tracking-widest text-espresso hover:text-wine transition">
      Cart
      {count > 0 && (
        <span className="absolute -top-2 -right-4 bg-wine text-ivory text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  );
}
