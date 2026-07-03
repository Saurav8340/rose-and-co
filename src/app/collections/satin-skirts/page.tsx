import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { inr } from '@/lib/format';

export const metadata = { title: 'Satin skirts', description: 'Poly-satin skirts at 95+ GSM. Falls with weight, doesn\'t cling. Small batch, hand-painted prints available.' };

export default async function SatinSkirtsCollection() {
  const products = await prisma.product.findMany({ where: { active: true } });

  return (
    <div className="container-x py-12 max-w-6xl">
      <div className="text-xs uppercase tracking-[0.3em] text-wine">Satin skirts</div>
      <h1 className="font-display text-4xl md:text-5xl text-espresso mt-3">Real satin, real weight</h1>
      <p className="mt-4 text-espresso/70 max-w-2xl leading-relaxed">
        Poly-satin at 95-105 GSM. Not the thin plasticky kind. Weight, drape, and colour that photograph beautifully.
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
        <h2 className="font-display text-2xl text-espresso mb-4">On satin</h2>
        <ul className="space-y-2 text-espresso/70">
          <li>&middot; <Link href="/journal/poly-satin-fabric-guide" className="underline text-wine">Poly-satin fabric guide: GSM and care</Link></li>
          <li>&middot; <Link href="/journal/poly-satin-vs-silk-satin" className="underline text-wine">Poly-satin vs silk satin</Link></li>
          <li>&middot; <Link href="/journal/best-satin-skirts-under-1500-india" className="underline text-wine">Best satin skirts under Rs 1,500</Link></li>
          <li>&middot; <Link href="/journal/spot-cheap-satin-in-photos" className="underline text-wine">How to spot cheap satin in photos</Link></li>
        </ul>
      </div>
    </div>
  );
}
