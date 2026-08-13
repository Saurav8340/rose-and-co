import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { orderSchema } from '@/lib/validate';
import { generateOrderNumber } from '@/lib/orderNumber';
import { rateLimit, getIp } from '@/lib/rateLimit';
import { getPrepaidPrice, getCodDeposit, getCodRemaining } from '@/lib/constants';
import { isBotUA, isDisposableEmail } from '@/lib/blocklists';

function isSuspiciousMobile(m: string): boolean {
  if (/^(\d)\1+$/.test(m))            return true;
  if (m === '1234567890' || m === '0987654321') return true;
  if (/^(\d)\1{5,}/.test(m))          return true;
  return false;
}

function isSuspiciousName(n: string): boolean {
  if (n.trim().length < 3)              return true;
  if (/^(.)\1+$/.test(n.replace(/\s/g, ''))) return true;
  if (!/[a-zA-Z]/.test(n))              return true;
  return false;
}

export async function POST(req: Request) {
  const ip = getIp(req);
  const ua = req.headers.get('user-agent') || '';

  if (isBotUA(ua)) {
    console.log('[Anti-bot] Bot UA blocked from IP', ip);
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const rl = rateLimit(`order:${ip}`, 5, 60 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: 'Too many order attempts. Try later.' }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid' }, { status: 400 });

  const d = parsed.data;

  if (d.website && d.website.length > 0) {
    console.log('[Anti-bot] Honeypot triggered from IP', ip);
    return NextResponse.json({ ok: true, orderNumber: 'FAKE-' + Date.now() });
  }

  const elapsedMs = Date.now() - d.startedAt;
  if (elapsedMs < 4000) {
    return NextResponse.json({ error: 'Please take a moment to review your details.' }, { status: 400 });
  }
  if (elapsedMs > 60 * 60_000) {
    return NextResponse.json({ error: 'Session expired. Please start checkout again.' }, { status: 400 });
  }

  if (isSuspiciousMobile(d.mobile)) return NextResponse.json({ error: 'Please enter a valid mobile number.' }, { status: 400 });
  if (isSuspiciousName(d.fullName)) return NextResponse.json({ error: 'Please enter your real full name.' }, { status: 400 });
  if (d.email && isDisposableEmail(d.email)) return NextResponse.json({ error: 'Please use a real email address.' }, { status: 400 });
  if (!d.paidConfirmed)             return NextResponse.json({ error: 'Please confirm the payment before placing the order.' }, { status: 400 });

  const blocked = await prisma.blockedPincode.findUnique({ where: { pincode: d.pincode } });
  if (blocked) {
    return NextResponse.json({ error: 'We are unable to deliver to this pincode. Please email us.' }, { status: 400 });
  }

  const session = await prisma.verificationSession.findUnique({ where: { token: d.verificationToken } });
  if (!session || !session.verified || session.mobile !== d.mobile) {
    return NextResponse.json({ error: 'Verification failed. Please restart checkout.' }, { status: 400 });
  }
  if (session.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Session expired. Please restart checkout.' }, { status: 400 });
  }

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60_000);
  const mobileCount = await prisma.order.count({
    where: { mobile: d.mobile, createdAt: { gte: oneDayAgo } },
  });
  if (mobileCount >= 2) {
    return NextResponse.json({ error: 'You have already placed orders today. Please email us if you need help.' }, { status: 429 });
  }

  const thirtyMinAgo = new Date(Date.now() - 30 * 60_000);
  const dup = await prisma.order.findFirst({
    where: {
      mobile: d.mobile,
      createdAt: { gte: thirtyMinAgo },
      items: { some: { productId: d.productId } },
    },
    orderBy: { createdAt: 'desc' },
  });
  if (dup) return NextResponse.json({ ok: true, orderId: dup.id, orderNumber: dup.orderNumber });

  const product = await prisma.product.findUnique({ where: { id: d.productId } });
  if (!product || !product.active) return NextResponse.json({ error: 'Product unavailable' }, { status: 400 });

  const sizes: Array<{ size: string; stock: number }> = JSON.parse(product.sizes);
  const sizeInfo = sizes.find(s => s.size === d.size);
  if (!sizeInfo || sizeInfo.stock < d.quantity) {
    return NextResponse.json({ error: 'Selected size is out of stock' }, { status: 400 });
  }

  const qty = d.quantity;
  const isPrepaid = d.paymentMethod === 'PREPAID';

  // ============================================================
  // PRICING — calculated from THIS product's own price (fetched
  // above from the database), not a hardcoded flat rate. This is
  // the actual money-charging logic, so it must always reflect
  // whatever price is set on the product in admin — a product
  // priced at ₹399 is now correctly charged at ₹399-based math,
  // not the old flat ₹2,299 rate.
  // ============================================================
  const unitPrepaidPrice = getPrepaidPrice(product.price);
  const unitCodDeposit   = getCodDeposit(product.price);
  const unitCodRemaining = getCodRemaining(product.price);

  const totalAmount    = product.price * qty;
  const paidAmount     = isPrepaid ? (unitPrepaidPrice * qty) : (unitCodDeposit * qty);
  const codAmount      = isPrepaid ? 0 : (unitCodRemaining * qty);
  const discountAmount = isPrepaid ? ((product.price - unitPrepaidPrice) * qty) : 0;

  const orderNumber = generateOrderNumber();

  // Store IP + UA in structured JSON in notes so we can retrieve for CAPI later
  const notes = JSON.stringify({ ip, ua: ua.slice(0, 500) });

  const order = await prisma.$transaction(async (tx) => {
    const o = await tx.order.create({
      data: {
        orderNumber,
        fullName: d.fullName,
        mobile: d.mobile,
        email: d.email || null,
        altPhone: d.altPhone || null,
        pincode: d.pincode,
        state: d.state,
        city: d.city,
        addressLine1: d.addressLine1,
        addressLine2: d.addressLine2 || null,
        landmark: d.landmark || null,
        paymentMethod: d.paymentMethod,
        paidAmount, codAmount, totalAmount, discountAmount,
        paymentStatus: 'PENDING',
        orderStatus: 'PLACED',
        notes,
        metaFbc: d.metaFbc || null,
        metaFbp: d.metaFbp || null,
        utmData: d.utm || null,
      },
    });
    await tx.orderItem.create({
      data: {
        orderId: o.id, productId: product.id, productName: product.name,
        size: d.size, quantity: qty, price: product.price,
      },
    });
    const newSizes = sizes.map(s => s.size === d.size ? { ...s, stock: s.stock - qty } : s);
    await tx.product.update({ where: { id: product.id }, data: { sizes: JSON.stringify(newSizes) } });
    return o;
  });

  return NextResponse.json({ ok: true, orderId: order.id, orderNumber: order.orderNumber });
}



