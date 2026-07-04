'use client';

import { useEffect } from 'react';
import { useCart } from '@/components/CartContext';
import { updateLead } from '@/lib/analytics';

/**
 * Watches cart state. If user adds items and doesn't checkout in 20 min,
 * logs to backend as abandoned cart (for future WhatsApp automation).
 */
export default function CartAbandonmentTracker() {
  const { items, total } = useCart();

  useEffect(() => {
    if (items.length === 0) return;

    // Mark cart-add event in lead
    const abandonKey = 'rc_cart_abandon_' + items.length;
    if (!sessionStorage.getItem(abandonKey)) {
      sessionStorage.setItem(abandonKey, '1');

      const cartSummary = items.map((i) => `${i.name} (${i.size})`).join(', ');
      updateLead({
        // @ts-ignore — extension field
        cartAdded: true,
        cartValue: total,
        cartSummary,
      } as any);
    }

    // If user leaves the tab, mark as abandoning
    const handleBeforeUnload = () => {
      const phone = localStorage.getItem('rc_phone');
      const email = localStorage.getItem('rc_email');
      if (phone || email) {
        // Fire-and-forget beacon so server knows
        try {
          navigator.sendBeacon('/api/leads/create', new Blob([JSON.stringify({
            sessionId: sessionStorage.getItem('rc_session_id'),
            cartAbandoned: true,
            cartValue: total,
            timestamp: Date.now(),
          })], { type: 'application/json' }));
        } catch {}
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [items, total]);

  return null;
}
