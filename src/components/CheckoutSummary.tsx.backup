'use client';

import { useEffect, useState } from 'react';

interface Props {
  subtotal: number;
}

interface AppliedDiscount {
  code: string;
  pct: number;
  amount: number;
}

export default function CheckoutSummary({ subtotal }: Props) {
  const [discount, setDiscount] = useState<AppliedDiscount | null>(null);

  useEffect(() => {
    const code = localStorage.getItem('rc_active_code');
    const pctStr = localStorage.getItem('rc_active_discount');
    if (code && pctStr) {
      const pct = parseFloat(pctStr);
      setDiscount({
        code,
        pct,
        amount: Math.round((subtotal * pct) / 100),
      });
    }
  }, [subtotal]);

  const total = subtotal - (discount?.amount || 0);
  const shippingText = total >= 999 ? 'Free' : 'Rs 99';
  const shipping = total >= 999 ? 0 : 99;
  const grandTotal = total + shipping;

  return (
    <div className="bg-blush/10 p-6 space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-espresso/70">Subtotal</span>
        <span>Rs {subtotal.toLocaleString('en-IN')}</span>
      </div>

      {discount && (
        <div className="flex justify-between text-sm text-green-700">
          <div>
            <span className="font-medium">Discount applied</span>
            <div className="text-xs font-mono text-green-800/80 mt-0.5">{discount.code}</div>
          </div>
          <span>- Rs {discount.amount.toLocaleString('en-IN')}</span>
        </div>
      )}

      <div className="flex justify-between text-sm">
        <span className="text-espresso/70">Shipping</span>
        <span className={shipping === 0 ? 'text-green-700 font-medium' : ''}>
          {shippingText}
        </span>
      </div>

      <div className="border-t border-taupe/20 pt-3 flex justify-between font-semibold">
        <span>Total</span>
        <span className="text-wine text-lg">Rs {grandTotal.toLocaleString('en-IN')}</span>
      </div>

      {discount && (
        <div className="text-xs text-green-700 italic">
          Your personalized code is already applied. Nothing more to do.
        </div>
      )}
    </div>
  );
}
