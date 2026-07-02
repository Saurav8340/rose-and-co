import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { inr } from '@/lib/format';
import { SITE } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }: { searchParams: { id?: string } }) {
  return {
    title: `Order confirmed — ${searchParams.id || ''}`,
    robots: { index: false, follow: false },
  };
}

export default async function OrderSuccess({ searchParams }: { searchParams: { id?: string } }) {
  const orderNumber = searchParams.id;
  if (!orderNumber) notFound();

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
  if (!order) notFound();

  let productImage = '/products/amara-front.png';
  const firstItem = order.items[0];
  if (firstItem) {
    const p = await prisma.product.findUnique({ where: { id: firstItem.productId } });
    if (p) {
      try {
        const imgs = JSON.parse(p.images);
        if (imgs?.[0]) productImage = imgs[0];
      } catch {}
    }
  }

  const placedAt = new Date(order.createdAt);
  const eta    = new Date(order.createdAt.getTime() + 5 * 24 * 60 * 60_000);
  const etaMin = new Date(order.createdAt.getTime() + 3 * 24 * 60 * 60_000);
  const firstName = order.fullName.trim().split(' ')[0];
  const isPrepaid = order.paymentMethod === 'PREPAID';

  return (
    <div className="bg-blush/10">
      <section className="relative overflow-hidden bg-gradient-to-b from-blush/50 via-blush/20 to-ivory">
        <div className="container-x py-14 md:py-20 text-center max-w-3xl">
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-wine/20 animate-ping" />
            <div className="relative w-20 h-20 rounded-full bg-wine text-ivory flex items-center justify-center text-4xl shadow-lg">✓</div>
          </div>

          <div className="mt-6 text-xs uppercase tracking-[0.4em] text-wine">Order confirmed</div>
          <h1 className="font-display text-4xl md:text-6xl text-espresso mt-4 leading-tight">
            Thanks, {firstName}.
          </h1>
          <p className="mt-4 text-espresso/70 max-w-lg mx-auto leading-relaxed">
            We got your order. Payment gets checked in the next couple of hours (usually much faster), then we start packing.
          </p>

          <div className="mt-8 inline-flex flex-col sm:flex-row items-center gap-3 bg-white border border-taupe/30 px-6 py-4">
            <div className="text-left">
              <div className="text-[10px] uppercase tracking-widest text-espresso/60">Order number</div>
              <div className="font-mono text-xl text-wine tracking-wider">{order.orderNumber}</div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-taupe/30" />
            <div className="text-left">
              <div className="text-[10px] uppercase tracking-widest text-espresso/60">Placed at</div>
              <div className="text-sm text-espresso">{placedAt.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true })}</div>
            </div>
          </div>
          <p className="text-xs text-espresso/50 mt-3">Save this number. You will need it to track or return.</p>
        </div>
      </section>

      <section className="container-x py-10 max-w-4xl">
        <div className="bg-white border border-taupe/20 p-6 md:p-8">
          <h2 className="font-display text-xl text-espresso mb-6">Where your order is</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { t: 'Placed',              d: placedAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), done: true },
              { t: 'Payment check',       d: 'Within 2 hours',    active: true },
              { t: 'Packed + shipped',    d: '24–48 hrs from now' },
              { t: 'Delivered',           d: `${etaMin.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${eta.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` },
            ].map((s: any, i) => (
              <div key={s.t} className="text-center">
                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-sm font-semibold border-2 ${
                  s.done ? 'bg-wine text-ivory border-wine' :
                  s.active ? 'bg-blush text-wine border-wine animate-pulse' :
                  'bg-white text-taupe border-taupe/40'
                }`}>{s.done ? '✓' : i + 1}</div>
                <div className={`mt-3 text-xs uppercase tracking-widest ${s.done || s.active ? 'text-espresso' : 'text-espresso/50'}`}>{s.t}</div>
                <div className="text-[11px] text-espresso/50 mt-1">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x pb-10 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-taupe/20 p-6">
            <div className="text-xs uppercase tracking-widest text-espresso/60 mb-4">What you ordered</div>
            {order.items.map(i => (
              <div key={i.id} className="flex gap-4">
                <div className="relative w-20 h-24 bg-blush/20 shrink-0">
                  <Image src={productImage} alt={i.productName} fill sizes="80px" className="object-cover" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-espresso">{i.productName}</div>
                  <div className="text-xs text-espresso/60 mt-1">Size <b>{i.size}</b> · Qty {i.quantity}</div>
                  <div className="text-wine font-semibold mt-2">{inr(i.price * i.quantity)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-taupe/20 p-6">
            <div className="text-xs uppercase tracking-widest text-espresso/60 mb-4">Delivering to</div>
            <div className="text-sm text-espresso space-y-1 leading-relaxed">
              <div className="font-semibold text-base">{order.fullName}</div>
              <div>{order.addressLine1}</div>
              {order.addressLine2 && <div>{order.addressLine2}</div>}
              {order.landmark && <div className="text-espresso/70">Near {order.landmark}</div>}
              <div>{order.city}, {order.state} – {order.pincode}</div>
              <div className="pt-3 mt-3 border-t border-taupe/10 text-xs text-espresso/60">
                <div>📱 {order.mobile}</div>
                {order.email && <div className="mt-1">✉️ {order.email}</div>}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-taupe/20 p-6 mt-6">
          <div className="text-xs uppercase tracking-widest text-espresso/60 mb-4">Payment</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-espresso/80"><span>Subtotal</span><span>{inr(order.totalAmount)}</span></div>
            <div className="flex justify-between text-espresso/80"><span>Shipping</span><span className="text-wine">Free</span></div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-800">
                <span>UPI prepaid discount</span>
                <span>-{inr(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-espresso/80"><span>Taxes</span><span>Included</span></div>
            <div className="flex justify-between font-semibold text-base pt-3 mt-3 border-t border-taupe/20">
              <span>Total</span>
              <span>{inr(order.totalAmount - order.discountAmount)}</span>
            </div>
          </div>
          <div className="mt-5 p-4 bg-blush/30 border-l-4 border-wine">
            <div className="text-xs uppercase tracking-widest text-wine">{isPrepaid ? 'Full prepaid — UPI' : 'Partial COD'}</div>
            {isPrepaid ? (
              <div className="text-sm text-espresso/80 mt-2">
                Paid via UPI: <b>{inr(order.paidAmount)}</b>. We are checking the payment now.
                {order.discountAmount > 0 && <div className="mt-1 text-green-800 text-xs">You saved ₹{order.discountAmount} by choosing prepaid.</div>}
              </div>
            ) : (
              <div className="text-sm text-espresso/80 mt-2">
                Paid online: <b>{inr(order.paidAmount)}</b><br/>
                On delivery: <b className="text-wine">{inr(order.codAmount)}</b> in cash
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="container-x pb-10 max-w-4xl">
        <div className="bg-espresso text-ivory p-8 md:p-10">
          <div className="text-xs uppercase tracking-[0.3em] text-champagne">What happens next</div>
          <h2 className="font-display text-3xl md:text-4xl mt-3">Four steps to your door</h2>
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            {[
              { n: '01', t: 'Payment check',      d: 'We match your UPI payment to your order. Usually done in under an hour, always within 2.' },
              { n: '02', t: 'Packed by hand',     d: 'Every set is checked for print, stitching and loose threads before it goes in the bag.' },
              { n: '03', t: 'Ships from Delhi',   d: 'Handed to the courier within 24–48 hours. Tracking link comes to your mobile.' },
              { n: '04', t: 'Doorstep delivery',  d: `Expected between ${etaMin.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} and ${eta.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}. Free.` },
            ].map(x => (
              <div key={x.n} className="border-t border-ivory/20 pt-4">
                <div className="font-display text-3xl text-champagne">{x.n}</div>
                <div className="mt-2 uppercase tracking-widest text-sm">{x.t}</div>
                <p className="text-sm text-ivory/70 mt-2 leading-relaxed">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x pb-16 max-w-4xl">
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <Link href={`/track?id=${order.orderNumber}`} className="p-6 border border-taupe/20 bg-white hover:bg-blush/20 transition">
            <div className="text-2xl">📦</div>
            <div className="uppercase tracking-widest text-sm mt-2 text-espresso">Track order</div>
            <div className="text-xs text-espresso/60 mt-1">Live status any time</div>
          </Link>
          <a href={`mailto:${SITE.email}?subject=Help with order ${order.orderNumber}`} className="p-6 border border-taupe/20 bg-white hover:bg-blush/20 transition">
            <div className="text-2xl">✉️</div>
            <div className="uppercase tracking-widest text-sm mt-2 text-espresso">Email us</div>
            <div className="text-xs text-espresso/60 mt-1">Reply in under 24 hrs</div>
          </a>
          <Link href="/faq" className="p-6 border border-taupe/20 bg-white hover:bg-blush/20 transition">
            <div className="text-2xl">💬</div>
            <div className="uppercase tracking-widest text-sm mt-2 text-espresso">FAQ</div>
            <div className="text-xs text-espresso/60 mt-1">Quick answers</div>
          </Link>
        </div>

        <div className="mt-10 text-center">
          <p className="text-xs text-espresso/60 leading-relaxed">
            Updates go to <b className="text-espresso">{order.mobile}</b>
            {order.email && <> and <b className="text-espresso">{order.email}</b></>}.<br/>
            Something off? Email <a href={`mailto:${SITE.email}`} className="underline text-wine">{SITE.email}</a> with your order number.
          </p>
        </div>
      </section>
    </div>
  );
}
