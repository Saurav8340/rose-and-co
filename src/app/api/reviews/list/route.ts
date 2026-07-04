import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const product = searchParams.get('product');

  if (!product) {
    return NextResponse.json({ error: 'product param required' }, { status: 400 });
  }

  const reviews = await prisma.review.findMany({
    where: {
      productSlug: product,
      approved: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const formatted = reviews.map((r) => ({
    ...r,
    photos: (() => {
      try { return JSON.parse(r.photos); } catch { return []; }
    })(),
  }));

  return NextResponse.json({ reviews: formatted, count: formatted.length });
}
