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
    <div className="fixed inset-0 bg-espresso/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShow(false)}>
      <div
        className="bg-blush max-w-md w-full p-8 relative rounded-lg border border-taupe/30"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShow(false)}
          className="absolute top-3 right-3 text-ivory/50 hover:text-ivory text-2xl leading-none cursor-pointer"
          aria-label="Close"
        >
          ×
        </button>

        {!submitted ? (
          <>
            <div className="text-xs uppercase tracking-[0.3em] text-crimson mb-3">Before you go</div>
            <h3 className="font-display text-3xl text-ivory leading-tight">
              Ten percent off your first piece.
            </h3>
            <p className="mt-4 text-sm text-ivory/70 leading-relaxed">
              Drop your email. We'll send the code. And a short note when the next drop lands.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full border border-taupe/40 bg-blush/60 text-ivory px-4 py-3 focus:border-wine focus:outline-none rounded"
                required
                autoFocus
              />
              <button
                type="submit"
                className="w-full bg-wine text-ivory py-3 uppercase tracking-widest text-sm hover:bg-wine/90 rc-glow-btn transition cursor-pointer rounded"
              >
                Send me the code
              </button>
            </form>
            <p className="mt-3 text-[10px] text-ivory/50 text-center">
              No spam. One-click unsubscribe. Not selling data.
            </p>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl">🖤</div>
            <h3 className="font-display text-2xl text-ivory mt-4">Check your inbox.</h3>
            <p className="mt-2 text-sm text-ivory/70">
              Code <span className="font-mono font-semibold text-crimson">WELCOME10</span> is on its way.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}




