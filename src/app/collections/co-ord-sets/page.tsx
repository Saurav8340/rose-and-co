import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { inr } from '@/lib/format';

export const metadata = { title: 'Co-ord sets', description: 'Matching top and skirt or top and pant sets. Small batch, hand-painted prints, satin fabric.' };

export default async function CoordSetsCollection() {
  const products = await prisma.product.findMany({ where: { active: true } });

  return (
    <div className="container-x py-12 max-w-6xl">
      <div className="text-xs uppercase tracking-[0.3em] text-wine">Co-ord sets</div>
      <h1 className="font-display text-4xl md:text-5xl text-espresso mt-3">Matching top and bottom sets</h1>
      <p className="mt-4 text-espresso/70 max-w-2xl leading-relaxed">
        Party co-ords for engagements, cocktails, and dinners. Wear as a set for a full look, or split them for 3-4 different outfits.
      </p>

      <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-6">
        {products.map(p => {
          const imgs = JSON.parse(p.images);
          return (
            <Link key={p.id} href={`/product/${p.slug}`} className="group">
              <div className="relative aspect-[3/4] bg-blush/20">
                <Image src={imgs[0]} alt={p.name} fill sizes="33vw" className="object-cover group-hover:scale-105 transition" />
              </div>
              <div className="mt-3">
                <div className="text-sm text-espresso font-medium">{p.name}</div>
                <div className="text-sm text-wine mt-1">{inr(p.price)}</div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-16 pt-8 border-t border-taupe/20">
        <h2 className="font-display text-2xl text-espresso mb-4">Learn about co-ord sets</h2>
        <ul className="space-y-2 text-espresso/70">
          <li>&middot; <Link href="/journal/what-is-a-coord-set" className="underline text-wine">What is a co-ord set? Types and styles</Link></li>
          <li>&middot; <Link href="/journal/best-satin-coord-sets-under-2000-india" className="underline text-wine">Best satin co-ord sets under Rs 2,000 in India</Link></li>
          <li>&middot; <Link href="/journal/how-to-style-marble-swirl-coord" className="underline text-wine">How to style a marble swirl co-ord set</Link></li>
        </ul>
      </div>
    </div>
  );
}
