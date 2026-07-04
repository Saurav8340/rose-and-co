'use client';

import { useEffect, useState } from 'react';

interface Props {
  productSlug: string;
  totalStock?: number; // Total from Prisma sizes sum
}

export default function InventoryCountdown({ productSlug, totalStock }: Props) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [ticking, setTicking] = useState(false);

  useEffect(() => {
    fetch(`/api/inventory?product=${productSlug}`)
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.remaining === 'number') {
          setRemaining(data.remaining);
        }
      })
      .catch(() => {
        if (totalStock) setRemaining(totalStock);
      });

    // Small ticking animation once per minute (fake activity)
    const tick = setInterval(() => {
      setTicking(true);
      setTimeout(() => setTicking(false), 500);
    }, 45000);
    return () => clearInterval(tick);
  }, [productSlug, totalStock]);

  if (remaining === null || remaining > 100) return null;

  const isUrgent = remaining <= 20;
  const percent = totalStock ? (remaining / totalStock) * 100 : 100;

  return (
    <div className={`inline-flex items-center gap-2 text-sm ${isUrgent ? 'text-wine' : 'text-espresso'}`}>
      <span className={`w-2 h-2 rounded-full ${isUrgent ? 'bg-wine' : 'bg-green-600'} ${ticking ? 'animate-pulse' : ''}`} />
      <span className={isUrgent ? 'font-semibold' : ''}>
        Only {remaining} left in this drop
      </span>
      {isUrgent && (
        <span className="text-xs text-espresso/60">· Selling fast</span>
      )}
    </div>
  );
}
