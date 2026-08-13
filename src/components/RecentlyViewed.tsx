'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getRecentlyViewed, ViewedProduct } from '@/lib/recentlyViewed';
import { inr } from '@/lib/format';

export default function RecentlyViewed({ currentSlug }: { currentSlug?: string }) {
  const [items, setItems] = useState<ViewedProduct[]>([]);

  useEffect(() => {
    const all = getRecentlyViewed().filter(x => x.slug !== currentSlug);
    setItems(all);
  }, [currentSlug]);

  if (items.length === 0) return null;

  return (
    <section className="container-x py-12 border-t border-taupe/20">
      <div className="text-xs uppercase tracking-[0.3em] text-ivory/60">Recently viewed</div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
        {items.map(p => (
          <Link key={p.slug} href={`/product/${p.slug}`} className="group">
            <div className="relative aspect-[3/4] bg-blush/20 overflow-hidden rounded">
              <Image src={p.image} alt={p.name} fill sizes="(max-width: 768px) 50vw, 20vw" className="object-cover group-hover:scale-105 transition-transform" />
            </div>
            <div className="mt-2 text-xs text-ivory font-medium truncate">{p.name}</div>
            <div className="text-xs text-wine">{inr(p.price)}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
