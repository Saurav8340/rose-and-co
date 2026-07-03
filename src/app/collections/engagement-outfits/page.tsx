import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { inr } from '@/lib/format';

export const metadata = { title: 'Engagement outfits', description: 'Outfits for engagement functions and roka ceremonies. Warm tones, small batch, works for family functions.' };

export default async function EngagementCollection() {
  const products = await prisma.product.findMany({ where: { active: true } });

  return (
    <div className="container-x py-12 max-w-6xl">
      <div className="text-xs uppercase tracking-[0.3em] text-wine">Engagement outfits</div>
      <h1 className="font-display text-4xl md:text-5xl text-espresso mt-3">Roka, engagement, family functions</h1>
      <p className="mt-4 text-espresso/70 max-w-2xl leading-relaxed">
        Warm-toned satin co-ords that work for engagement functions. Read as put-together, not competing with the bride.
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

      <div className="mt-16 pt-8 border-t border-taupe/20 space-y-3 text-espresso/70">
        <h2 className="font-display text-2xl text-espresso">Guides for engagement functions</h2>
        <div>&middot; <Link href="/journal/roka-outfit-ideas-brides-family" className="underline text-wine">Roka outfit ideas for the bride\'s family</Link></div>
        <div>&middot; <Link href="/journal/satin-coord-engagement-function" className="underline text-wine">Satin co-ord for engagement functions</Link></div>
      </div>
    </div>
  );
}
