'use client';

import { useEffect, useState } from 'react';

interface UserContext {
  name?: string;
  city?: string;
  isReturning: boolean;
  visitCount: number;
  lastVisitDays: number;
}

export default function GreetingBanner() {
  const [ctx, setCtx] = useState<UserContext | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    (async () => {
      // Read localStorage
      const name = localStorage.getItem('rc_name') || undefined;
      const visitCount = parseInt(localStorage.getItem('rc_visits') || '0', 10) + 1;
      const lastVisitStr = localStorage.getItem('rc_last_visit');
      const lastVisitDays = lastVisitStr
        ? Math.floor((Date.now() - parseInt(lastVisitStr, 10)) / (1000 * 60 * 60 * 24))
        : 0;

      localStorage.setItem('rc_visits', String(visitCount));
      localStorage.setItem('rc_last_visit', String(Date.now()));

      // Fetch city from IP (via our own API route to avoid CORS)
      let city: string | undefined;
      try {
        const res = await fetch('/api/geo', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          city = data.city;
        }
      } catch {}

      setCtx({
        name,
        city,
        isReturning: visitCount > 1,
        visitCount,
        lastVisitDays,
      });
    })();

    const wasDismissed = sessionStorage.getItem('rc_greeting_dismissed');
    if (wasDismissed) setDismissed(true);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('rc_greeting_dismissed', '1');
  };

  if (!ctx || dismissed) return null;

  // Build personalized message
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  let message = '';
  if (ctx.isReturning && ctx.name) {
    message = `${timeGreeting}, ${ctx.name}. Your wishlist is waiting.`;
  } else if (ctx.isReturning && ctx.city) {
    message = `Welcome back from ${ctx.city}. Free shipping still on us.`;
  } else if (ctx.isReturning) {
    message = `Welcome back. Use code WELCOME10 for 10% off your first order.`;
  } else if (ctx.city) {
    message = `${timeGreeting} from ${ctx.city}. Free shipping to your door.`;
  } else {
    message = `${timeGreeting}. Free shipping across India, ships in 24-48 hrs.`;
  }

  return (
    <div className="bg-espresso text-ivory text-center py-2 px-4 text-xs relative">
      <span>{message}</span>
      <button
        onClick={handleDismiss}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-ivory/60 hover:text-ivory text-lg leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
