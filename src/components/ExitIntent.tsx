'use client';

import { useEffect, useState } from 'react';

export default function ExitIntent() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem('rc_exit_seen')) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setShow(true);
        sessionStorage.setItem('rc_exit_seen', '1');
      }
    };

    // Trigger on mobile after 30s of scrolling (no exit intent on mobile)
    let scrolled = false;
    const handleScroll = () => {
      if (!scrolled && window.scrollY > 500) {
        scrolled = true;
        setTimeout(() => {
          if (!sessionStorage.getItem('rc_exit_seen')) {
            setShow(true);
            sessionStorage.setItem('rc_exit_seen', '1');
          }
        }, 25000);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    localStorage.setItem('rc_email', email);
    setSubmitted(true);
    // TODO: send to your backend/email list
    setTimeout(() => setShow(false), 2500);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={() => setShow(false)}>
      <div
        className="bg-ivory max-w-md w-full p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShow(false)}
          className="absolute top-3 right-3 text-espresso/50 hover:text-espresso text-2xl leading-none"
          aria-label="Close"
        >
          ×
        </button>

        {!submitted ? (
          <>
            <div className="text-xs uppercase tracking-[0.3em] text-wine mb-3">Before you go</div>
            <h3 className="font-display text-3xl text-espresso leading-tight">
              Ten percent off your first set.
            </h3>
            <p className="mt-4 text-sm text-espresso/70 leading-relaxed">
              Drop your email. We'll send the code. And a short note when the next drop lands.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full border border-taupe/40 px-4 py-3 focus:border-wine focus:outline-none"
                required
                autoFocus
              />
              <button
                type="submit"
                className="w-full bg-wine text-ivory py-3 uppercase tracking-widest text-sm hover:bg-espresso transition"
              >
                Send me the code
              </button>
            </form>
            <p className="mt-3 text-[10px] text-espresso/50 text-center">
              No spam. One-click unsubscribe. Not selling data.
            </p>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl">🌹</div>
            <h3 className="font-display text-2xl text-espresso mt-4">Check your inbox.</h3>
            <p className="mt-2 text-sm text-espresso/70">
              Code <span className="font-mono font-semibold">WELCOME10</span> is on its way.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
