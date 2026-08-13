import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const orderNumber = String(body.orderNumber || '').trim().toUpperCase();
  const mobile = String(body.mobile || '').replace(/\D/g, '');

  if (!orderNumber || !mobile) return NextResponse.json({ error: 'Order number and mobile required' }, { status: 400 });

  const order = await prisma.order.findFirst({
    where: { orderNumber, mobile },
    include: { items: true },
  });
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  return NextResponse.json({
    orderNumber: order.orderNumber,
    status: order.orderStatus,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt,
    totalAmount: order.totalAmount,
    items: order.items.map(i => ({ name: i.productName, size: i.size, qty: i.quantity })),
  });
}




