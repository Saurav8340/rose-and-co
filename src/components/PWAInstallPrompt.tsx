'use client';
import { useEffect, useState } from 'react';

export default function PWAInstallPrompt() {
  const [prompt, setPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setPrompt(e);
      // Show only if user has been on site for 20+ seconds
      setTimeout(() => {
        if (!localStorage.getItem('rc_pwa_dismissed')) setVisible(true);
      }, 20_000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setVisible(false);
    localStorage.setItem('rc_pwa_dismissed', '1');
  };

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem('rc_pwa_dismissed', '1');
  };

  if (!visible || !prompt) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-40 bg-espresso text-ivory p-4 shadow-2xl border border-champagne/30">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-medium">Add Rose &amp; Co to your home screen</div>
          <div className="text-xs text-ivory/70 mt-1">Faster checkout, offline browsing.</div>
        </div>
        <button onClick={dismiss} aria-label="Dismiss" className="text-ivory/60 text-xl leading-none">&times;</button>
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={install} className="flex-1 bg-ivory text-espresso py-2 text-xs uppercase tracking-widest font-medium">Install</button>
        <button onClick={dismiss} className="px-4 py-2 text-xs uppercase tracking-widest text-ivory/70">Not now</button>
      </div>
    </div>
  );
}
