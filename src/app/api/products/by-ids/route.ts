import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { ids } = await req.json().catch(() => ({ ids: [] }));
  if (!Array.isArray(ids) || ids.length === 0) return NextResponse.json({ products: [] });

  const products = await prisma.product.findMany({
    where: { id: { in: ids.slice(0, 20) }, active: true },
  });

  return NextResponse.json({
    products: products.map(p => {
      const imgs = JSON.parse(p.images);
      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: p.price,
        image: imgs[0] || '/products/amara-front.png',
      };
    }),
  });
}
