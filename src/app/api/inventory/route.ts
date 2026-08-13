import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('product');
  if (!slug) return NextResponse.json({ error: 'product param' }, { status: 400 });

  const product = await prisma.product.findUnique({
    where: { slug },
    select: { sizes: true },
  });
  if (!product) return NextResponse.json({ remaining: null });

  try {
    const sizes = JSON.parse(product.sizes) as Array<{ size: string; stock: number }>;
    const total = sizes.reduce((s, x) => s + (x.stock || 0), 0);
    return NextResponse.json({ remaining: total, sizes });
  } catch {
    return NextResponse.json({ remaining: null });
  }
}



