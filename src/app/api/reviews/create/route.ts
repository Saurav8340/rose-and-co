import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productSlug, orderId, rating, name, city, title, body: text,
      photos = [], size,
    } = body;

    if (!productSlug || !rating || !name || !title || !text) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 });
    }

    // If linked to a real order, mark verified
    let verified = false;
    if (orderId) {
      const order = await prisma.order.findUnique({ where: { id: orderId } }).catch(() => null);
      if (order) verified = true;
    }

    const review = await prisma.review.create({
      data: {
        productSlug,
        orderId,
        rating: Math.min(5, Math.max(1, parseInt(rating, 10))),
        name,
        city,
        title,
        body: text,
        photos: JSON.stringify(photos),
        size,
        verified,
        approved: false, // needs admin approval
      },
    });

    return NextResponse.json({ ok: true, id: review.id });
  } catch (err) {
    console.error('review create error', err);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}
