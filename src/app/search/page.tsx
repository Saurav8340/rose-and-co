import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { inr } from '@/lib/format';

export const metadata = { title: 'Search' };

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q || '').trim();
  const products = q ? await prisma.product.findMany({
    where: { active: true, OR: [{ name: { contains: q } }, { description: { contains: q } }] },
  }) : await prisma.product.findMany({ where: { active: true } });

  return (
    <div className="container-x py-10">
      <h1 className="font-display text-3xl md:text-4xl text-ivory">Search</h1>
      <form className="mt-6 max-w-md" method="GET">
        <input name="q" defaultValue={q} placeholder="Search products…" className="input" />
      </form>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
        {products.map(p => {
          const img = (JSON.parse(p.images)[0]) as string;
          return (
            <Link key={p.id} href={`/product/${p.slug}`} className="group">
              <div className="relative aspect-[3/4] bg-blush/20 rounded overflow-hidden"><Image src={img} alt={p.name} fill sizes="300px" className="object-cover group-hover:scale-105 transition" /></div>
              <div className="mt-3 text-sm text-ivory font-medium">{p.name}</div>
              <div className="text-crimson">{inr(p.price)}</div>
            </Link>
          );
        })}
      </div>
      {products.length === 0 && <p className="text-ivory/60 mt-8">No products found.</p>}
    </div>
  );
}



