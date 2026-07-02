'use client';
import { useEffect, useState } from 'react';

export default function Countdown({ minutes = 15 }: { minutes?: number }) {
  const [sec, setSec] = useState(minutes * 60);
  useEffect(() => { const t = setInterval(() => setSec(s => s > 0 ? s - 1 : 0), 1000); return () => clearInterval(t); }, []);
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return <span className="font-mono">{m}:{s}</span>;
}
