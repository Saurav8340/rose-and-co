'use client';

import { useEffect, useState } from 'react';
import { useUserSegment } from '@/hooks/useUserSegment';

interface Props {
  productName?: string;
}

export default function PersonalizedDiscount({ productName = 'AMARA' }: Props) {
  const profile = useUserSegment(productName);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('rc_discount_dismissed')) setDismissed(true);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('rc_discount_dismissed', '1');
  };

  if (!profile || !profile.showDiscount || dismissed) return null;

  const isVIP = profile.segment === 'returning_vip';
  const greeting = profile.name
    ? `${profile.name}, `
    : profile.city
    ? `${profile.city}, `
    : '';

  const message = isVIP
    ? `${greeting}your VIP code is ready.`
    : `${greeting}a small welcome.`;

  return (
    <div className={`${isVIP ? 'bg-wine' : 'bg-espresso'} text-ivory py-3 px-4 relative`}>
      <div className="container-x flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-sm">
        <span>{message}</span>
        <span className="font-mono font-semibold text-champagne">
          {profile.discountCode}
        </span>
        <span className="text-xs uppercase tracking-widest">
          {profile.discountPct}% off — auto-applied at checkout
        </span>
      </div>
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory/60 hover:text-ivory text-lg leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
