'use client';
import { useEffect } from 'react';
import { captureUtm } from '@/lib/utm';

export default function UtmCapture() {
  useEffect(() => {
    // Defer non-critical work until browser is idle
    const run = () => captureUtm();
    if (typeof requestIdleCallback !== 'undefined') {
      const id = requestIdleCallback(run, { timeout: 2000 });
      return () => cancelIdleCallback(id);
    }
    const t = setTimeout(run, 500);
    return () => clearTimeout(t);
  }, []);
  return null;
}
