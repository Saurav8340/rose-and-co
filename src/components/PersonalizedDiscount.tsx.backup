'use client';

import { useEffect, useState } from 'react';
import { humanizeCode } from '@/lib/coupon';

export default function PersonalizedDiscount() {
  const [message, setMessage] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem('rc_discount_dismissed')) {
      setDismissed(true);
      return;
    }

    const timer = setTimeout(() => {
      const name = localStorage.getItem('rc_name');
      const rawCode = localStorage.getItem('rc_active_code');
      const pct = localStorage.getItem('rc_active_discount') || '10';

      if (!rawCode) return;

      const friendlyCode = humanizeCode(rawCode);
      setCode(friendlyCode);
      setMessage(
        name
          ? `${name}, your code is ready.`
          : `A small welcome — ${pct}% off.`
      );
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('rc_discount_dismissed', '1');
  };

  if (!code || dismissed) return null;

  return (
    <div className="bg-espresso text-ivory py-2 px-4 relative text-sm">
      <div className="container-x flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
        <span>{message}</span>
        <span className="font-mono font-semibold text-champagne">{code}</span>
        <span className="text-xs uppercase tracking-widest text-ivory/80">
          Auto-applied at checkout
        </span>
      </div>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory/60 hover:text-ivory text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}
