'use client';

import { useEffect, useState } from 'react';

export default function NameCollector() {
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('rc_name');
    const asked = localStorage.getItem('rc_name_asked');
    // Ask on 2nd visit if not asked yet
    const visits = parseInt(localStorage.getItem('rc_visits') || '0', 10);
    if (!stored && !asked && visits >= 2) {
      setTimeout(() => setShow(true), 8000);
    }
  }, []);

  const handleSave = () => {
    if (name.trim().length < 2) return;
    localStorage.setItem('rc_name', name.trim());
    localStorage.setItem('rc_name_asked', '1');
    setShow(false);
  };

  const handleSkip = () => {
    localStorage.setItem('rc_name_asked', '1');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-24 right-4 max-w-xs bg-ivory shadow-2xl border border-taupe/20 p-4 z-30 md:bottom-24">
      <div className="text-xs uppercase tracking-[0.3em] text-wine mb-2">Quick thing</div>
      <p className="text-sm text-espresso mb-3">What should we call you?</p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="w-full border border-taupe/30 px-3 py-2 focus:border-wine focus:outline-none text-sm mb-2"
        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
      />
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="flex-1 bg-wine text-ivory py-2 text-xs uppercase tracking-widest hover:bg-espresso transition"
        >
          Save
        </button>
        <button
          onClick={handleSkip}
          className="px-3 py-2 text-xs text-espresso/60 hover:text-espresso"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
