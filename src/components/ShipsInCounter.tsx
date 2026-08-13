'use client';
import { useEffect, useState } from 'react';

export default function ShipsInCounter() {
  const [text, setText] = useState<string>('Delhivery picks up daily at 6 PM');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const cutoff = new Date(now);
      cutoff.setHours(18, 0, 0, 0);

      if (now < cutoff) {
        const msRemaining = cutoff.getTime() - now.getTime();
        const h = Math.floor(msRemaining / (1000 * 60 * 60));
        const m = Math.floor((msRemaining / (1000 * 60)) % 60);
        if (h === 0) {
          setText(`Order in ${m} min - goes out with today's Delhivery pickup`);
        } else {
          setText(`Order in ${h}h ${m}m - goes out with today's Delhivery pickup`);
        }
      } else {
        setText('Order now, goes out tomorrow morning');
      }
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm text-ivory bg-wine/10 border-l-4 border-wine p-3 rounded">
      <div className="w-2 h-2 rounded-full bg-wine animate-pulse" />
      <span className="font-medium text-ivory">{text}</span>
    </div>
  );
}
