import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { inr } from '@/lib/format';

export const metadata = { title: 'Plaid & Bottoms', description: 'Plaid skirts, bondage pants, D-ring trousers. Real hardware, small batch, no restock.' };

export default async function BottomsCollection() {
  const products = await prisma.product.findMany({ where: { active: true } });

  return (
    <div className="container-x py-12 max-w-6xl">
      <div className="text-xs uppercase tracking-[0.3em] text-crimson">Plaid & Bottoms</div>
      <h1 className="font-display text-4xl md:text-5xl text-ivory mt-3">The staple, done right.</h1>
      <p className="mt-4 text-ivory/70 max-w-2xl leading-relaxed">
        Plaid skirts and bondage pants with real D-ring hardware — not the printed-on kind. Built to move with you, not just sit right in a photo.
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
                <div className="text-sm text-ivory font-medium">{p.name}</div>
                <div className="text-sm text-crimson mt-1">{inr(p.price)}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}




