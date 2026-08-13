'use client';

import { useEffect, useState } from 'react';
import { readIdentity, writeIdentity } from '@/lib/identity';

export default function NameCollector() {
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    // FIX: was reading localStorage.getItem('rc_name') directly — now uses
    // the shared identity store, so if the customer already gave their name
    // via checkout or the lead popup, this correctly stays hidden instead
    // of asking again.
    const stored = readIdentity().name;
    const asked = localStorage.getItem('rc_name_asked');
    // Ask on 2nd visit if not asked yet
    const visits = parseInt(localStorage.getItem('rc_visits') || '0', 10);
    if (!stored && !asked && visits >= 2) {
      setTimeout(() => setShow(true), 8000);
    }
  }, []);

  const handleSave = () => {
    if (name.trim().length < 2) return;
    writeIdentity({ name: name.trim() });
    localStorage.setItem('rc_name_asked', '1');
    setShow(false);
  };

  const handleSkip = () => {
    localStorage.setItem('rc_name_asked', '1');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-24 right-4 max-w-xs bg-blush shadow-2xl border border-taupe/30 rounded-lg p-4 z-30 md:bottom-24">
      <div className="text-xs uppercase tracking-[0.3em] text-wine mb-2">Quick thing</div>
      <p className="text-sm text-ivory mb-3">What should we call you?</p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="w-full border border-taupe/40 bg-blush/60 text-ivory placeholder:text-ivory/40 px-3 py-2 focus:border-wine focus:outline-none text-sm mb-2 rounded"
        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
      />
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="flex-1 bg-wine text-ivory py-2 text-xs uppercase tracking-widest hover:bg-wine/90 transition cursor-pointer rounded"
        >
          Save
        </button>
        <button
          onClick={handleSkip}
          className="px-3 py-2 text-xs text-ivory/60 hover:text-ivory transition cursor-pointer"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
