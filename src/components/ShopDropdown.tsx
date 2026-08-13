'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface Product {
  slug: string;
  name: string;
  price: number;
  compareAt: number | null;
  image: string;
  tagline: string;
}

export default function ShopDropdown({ products }: { products: Product[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const handleEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };

  const handleLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 200);
  };

  return (
    <div ref={ref} className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-1 text-sm uppercase tracking-widest text-ivory hover:text-crimson transition"
      >
        Shop
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M1 3L5 7L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
<div
  className="absolute left-0 top-full mt-3 w-[min(92vw,640px)] bg-blush shadow-2xl border border-taupe/30 z-50"
  role="menu"
>          <div className="absolute -top-3 left-0 right-0 h-3" />
          <div className="p-6">
            <div className="text-xs uppercase tracking-[0.3em] text-crimson mb-4">New Arrivals</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((p) => {
                const discount = p.compareAt ? Math.round(((p.compareAt - p.price) / p.compareAt) * 100) : 0;
                return (
                  <Link
                    key={p.slug}
                    href={`/product/${p.slug}`}
                    prefetch
                    onClick={() => setOpen(false)}
                    className="group flex gap-4 p-3 hover:bg-taupe/20 transition rounded"
                  >
                    <div className="relative w-24 h-32 flex-shrink-0 overflow-hidden bg-blush/40">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        sizes="96px"
                        className="object-cover object-top group-hover:scale-105 transition duration-500"
                      />
                      {discount > 0 && (
                        <span className="absolute top-1 right-1 bg-ivory text-wine text-[10px] font-semibold px-1.5 py-0.5">
                          {discount}%
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-lg text-ivory group-hover:text-crimson transition truncate">
                        {p.name}
                      </div>
                      <div className="text-xs text-ivory/60 mt-1 line-clamp-2">{p.tagline}</div>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-sm font-semibold text-crimson">
                          Rs {p.price.toLocaleString('en-IN')}
                        </span>
                        {p.compareAt && (
                          <span className="text-xs line-through text-ivory/60">
                            Rs {p.compareAt.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="border-t border-taupe/30 mt-4 pt-4 flex items-center justify-between text-xs">
              <Link href="/shop" onClick={() => setOpen(false)} className="text-crimson underline uppercase tracking-widest">
                View all
              </Link>
              <div className="text-ivory/60">Free shipping - 7-day returns</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}





