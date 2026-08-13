'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/components/CartContext';
import { inr } from '@/lib/format';
import { getDisplayMrp } from '@/lib/constants';
import CartReviewsSnippet from '@/components/CartReviewsSnippet';

export default function CartPage() {
  const { items, update, remove, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="container-x py-24 text-center max-w-lg mx-auto">
        <h1 className="font-display text-4xl text-ivory">Your bag is empty.</h1>
        <p className="mt-4 text-ivory/70">Take another look.</p>
        <Link href="/shop" className="btn-primary mt-8">Discover the drop</Link>
      </div>
    );
  }

  // MRP total calculated per item from each item's own price (using
  // getDisplayMrp, same function used everywhere else) — not a flat
  // PAYMENT.mrp rate. Works correctly across products at different prices.
  const mrpTotal = items.reduce((s, i) => s + getDisplayMrp(i.price, null) * i.quantity, 0);

  return (
    <div className="container-x py-10">
      <h1 className="font-display text-3xl md:text-4xl text-ivory mb-2">Your bag</h1>
      <p className="text-sm text-ivory/60 mb-8">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {items.map((it, i) => (
            <div key={i} className="flex gap-4 border border-taupe/20 p-4 bg-blush rounded-lg">
              <div className="relative w-24 h-32 bg-blush/20 shrink-0 rounded overflow-hidden">
                <Image src={it.image} alt={it.name} fill sizes="96px" className="object-cover" />
              </div>
              <div className="flex-1 flex flex-col">
                <div className="text-ivory font-medium">{it.name}</div>
                <div className="text-xs text-ivory/60 mt-1">Size {it.size}</div>
                <div className="text-crimson font-semibold mt-1">{inr(it.price)}</div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="inline-flex items-center border border-taupe/40 text-ivory rounded">
                    <button onClick={() => update(i, it.quantity - 1)} className="px-3 py-1 cursor-pointer" aria-label="Decrease">-</button>
                    <span className="px-3">{it.quantity}</span>
                    <button onClick={() => update(i, it.quantity + 1)} className="px-3 py-1 cursor-pointer" aria-label="Increase">+</button>
                  </div>
                  <button onClick={() => remove(i)} className="text-xs uppercase tracking-widest text-ivory/60 hover:text-crimson transition cursor-pointer">Remove</button>
                </div>
              </div>
            </div>
          ))}
          <CartReviewsSnippet />
        </div>

        <div className="border border-taupe/20 p-6 bg-blush/20 h-fit rounded-lg">
          <div className="text-xs uppercase tracking-widest text-ivory/60 mb-4">Summary</div>
          <div className="space-y-2 text-sm text-ivory">
            <div className="flex justify-between text-ivory/50"><span>Was</span><span className="line-through">{inr(mrpTotal)}</span></div>
            <div className="flex justify-between"><span>Subtotal</span><span>{inr(total)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span className="text-crimson">Free</span></div>
          </div>
          <div className="flex justify-between mt-4 pt-4 border-t border-taupe/30 font-semibold text-lg text-ivory">
            <span>Total</span><span>{inr(total)}</span>
          </div>
          <Link href="/checkout" className="btn-primary w-full mt-6 text-center block">Checkout</Link>
          <p className="mt-4 text-[11px] text-ivory/60 text-center">
            Payment method chosen at checkout.
          </p>
        </div>
      </div>
    </div>
  );
}




