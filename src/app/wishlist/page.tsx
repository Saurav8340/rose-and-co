'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/components/WishlistContext';
import { inr } from '@/lib/format';

type Product = { id: string; slug: string; name: string; price: number; image: string };

export default function WishlistPage() {
  const { ids, toggle } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) { setProducts([]); setLoading(false); return; }
    fetch('/api/products/by-ids', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    })
      .then(r => r.json())
      .then(data => setProducts(data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ids]);

  return (
    <div className="container-x py-12 max-w-4xl">
      <div className="text-xs uppercase tracking-[0.3em] text-wine">Wishlist</div>
      <h1 className="font-display text-4xl md:text-5xl text-espresso mt-3">Your saved pieces</h1>
      <p className="mt-3 text-sm text-espresso/70">Wishlist is saved in your browser. No account needed.</p>

      {loading ? (
        <div className="mt-12 text-center text-espresso/60">Loading...</div>
      ) : products.length === 0 ? (
        <div className="mt-12 p-12 text-center border border-taupe/20 bg-blush/10">
          <div className="text-espresso/70">Nothing saved yet.</div>
          <Link href="/" className="btn-primary mt-4">Explore Amara</Link>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-6">
          {products.map(p => (
            <div key={p.id} className="group">
              <Link href={`/product/${p.slug}`}>
                <div className="relative aspect-[3/4] bg-blush/20 overflow-hidden">
                  <Image src={p.image} alt={p.name} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform" />
                </div>
              </Link>
              <div className="mt-3 flex items-start justify-between gap-2">
                <div>
                  <Link href={`/product/${p.slug}`} className="text-sm text-espresso font-medium hover:text-wine">{p.name}</Link>
                  <div className="text-sm text-wine mt-1">{inr(p.price)}</div>
                </div>
                <button
                  onClick={() => toggle(p.id)}
                  aria-label="Remove from wishlist"
                  className="text-xs uppercase tracking-widest text-espresso/60 hover:text-wine"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
