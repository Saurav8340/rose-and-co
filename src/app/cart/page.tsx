'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/components/CartContext';
import { inr } from '@/lib/format';
import { PAYMENT } from '@/lib/constants';

export default function CartPage() {
  const { items, update, remove, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="container-x py-24 text-center max-w-lg mx-auto">
        <h1 className="font-display text-4xl text-espresso">Your bag is empty.</h1>
        <p className="mt-4 text-espresso/70">Take a look at the Amara set and come back if you like it.</p>
        <Link href="/product/amara-marble-swirl-coord-set" className="btn-primary mt-8">Shop Amara</Link>
      </div>
    );
  }

  const qty = items.reduce((s, i) => s + i.quantity, 0);
  const prepaidTotal = PAYMENT.prepaidPrice * qty;
  const prepaidSaves = PAYMENT.prepaidSavings * qty;

  return (
    <div className="container-x py-10">
      <h1 className="font-display text-3xl md:text-4xl text-espresso mb-2">Your bag</h1>
      <p className="text-sm text-espresso/60 mb-8">{items.length} {items.length === 1 ? 'item' : 'items'} · Free shipping</p>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {items.map((it, i) => (
            <div key={i} className="flex gap-4 border border-taupe/20 p-4 bg-white">
              <div className="relative w-24 h-32 bg-blush/20 shrink-0">
                <Image src={it.image} alt={it.name} fill sizes="96px" className="object-cover" />
              </div>
              <div className="flex-1 flex flex-col">
                <div className="text-espresso font-medium">{it.name}</div>
                <div className="text-xs text-espresso/60 mt-1">Size {it.size}</div>
                <div className="text-wine font-semibold mt-1">{inr(it.price)}</div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="inline-flex items-center border border-taupe/40">
                    <button onClick={() => update(i, it.quantity - 1)} className="px-3 py-1">−</button>
                    <span className="px-3">{it.quantity}</span>
                    <button onClick={() => update(i, it.quantity + 1)} className="px-3 py-1">+</button>
                  </div>
                  <button onClick={() => remove(i)} className="text-xs uppercase tracking-widest text-espresso/60 hover:text-wine">Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border border-taupe/20 p-6 bg-blush/20 h-fit">
          <div className="text-xs uppercase tracking-widest text-espresso/60 mb-4">Order summary</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{inr(total)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span className="text-wine">Free</span></div>
            <div className="flex justify-between text-xs text-espresso/60"><span>Taxes</span><span>Included</span></div>
          </div>
          <div className="flex justify-between mt-4 pt-4 border-t border-taupe/30 font-semibold text-lg">
            <span>Total</span><span>{inr(total)}</span>
          </div>

          {/* Prepaid saving nudge */}
          <div className="mt-4 p-3 bg-green-50 border-2 border-green-600/40 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-lg">💰</span>
              <div>
                <div className="font-semibold text-green-800">Save ₹{prepaidSaves} by paying via UPI</div>
                <div className="text-xs text-espresso/70 mt-1">Pay <b>{inr(prepaidTotal)}</b> upfront instead of {inr(total)}. Choose &ldquo;Full prepaid&rdquo; at checkout.</div>
              </div>
            </div>
          </div>

          <Link href="/checkout" className="btn-primary w-full mt-4">Checkout →</Link>
          <div className="mt-4 text-xs text-espresso/60 text-center">No surprise charges. Human verification required.</div>
        </div>
      </div>
    </div>
  );
}
