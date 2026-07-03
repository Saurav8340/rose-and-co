import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { inr } from '@/lib/format';

export const metadata = { title: 'Party wear', description: 'Satin co-ords, dresses, and evening wear for Indian parties. Made in small batches, shipped from Gurugram.' };

export default async function PartyWearCollection() {
  const products = await prisma.product.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' } });

  return (
    <div className="container-x py-12 max-w-6xl">
      <div className="text-xs uppercase tracking-[0.3em] text-wine">Party wear</div>
      <h1 className="font-display text-4xl md:text-5xl text-espresso mt-3">For cocktail parties, engagements, dinners</h1>
      <p className="mt-4 text-espresso/70 max-w-2xl leading-relaxed">
        Party wear that works for Indian occasions. Satin co-ords in muted tones for engagements. Fitted midis for cocktails. All under Rs 2,000.
      </p>

      <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-6">
        {products.map(p => {
          const imgs = JSON.parse(p.images);
          return (
            <Link key={p.id} href={`/product/${p.slug}`} className="group">
              <div className="relative aspect-[3/4] bg-blush/20">
                <Image src={imgs[0]} alt={p.name} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition" />
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
        <h2 className="font-display text-2xl text-espresso mb-4">More on party wear</h2>
        <ul className="space-y-2 text-espresso/70">
          <li>&middot; <Link href="/journal/cocktail-party-outfit-ideas-2026" className="underline text-wine">Cocktail party outfit ideas for Indian women in 2026</Link></li>
          <li>&middot; <Link href="/journal/20-party-wear-outfit-ideas-under-2000" className="underline text-wine">20 party wear outfit ideas under Rs 2,000</Link></li>
          <li>&middot; <Link href="/journal/sangeet-outfit-ideas-not-lehengas" className="underline text-wine">Sangeet outfit ideas that aren\'t lehengas</Link></li>
        </ul>
      </div>
    </div>
  );
}
