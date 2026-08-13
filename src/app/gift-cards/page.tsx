import { SITE } from '@/lib/constants';

export const metadata = { title: 'Gift cards', description: 'Give Rosé &amp; Co credit as a gift. Rs 500, Rs 1,500, or Rs 3,000 amounts. Emailed instantly.' };

export default function GiftCardsPage() {
  const cards = [
    { amount: 500, tagline: 'A small gift' },
    { amount: 1500, tagline: 'A full piece, most drops' },
    { amount: 3000, tagline: 'Two pieces, or one plus the next drop' },
  ];

  return (
    <div className="container-x py-16 max-w-3xl">
      <div className="text-xs uppercase tracking-[0.3em] text-crimson">Gift cards</div>
      <h1 className="font-display text-4xl md:text-5xl text-ivory mt-3">Give a Rosé &amp; Co gift card</h1>
      <p className="mt-4 text-ivory/70 leading-relaxed">
        A pre-paid credit code, emailed to your recipient. They redeem it at checkout. No expiry. Works for one full order (not multiple).
      </p>

      <div className="mt-10 grid md:grid-cols-3 gap-4">
        {cards.map(c => (
          <div key={c.amount} className="rc-card p-6 rounded-lg text-center">
            <div className="text-4xl font-display text-crimson">Rs {c.amount.toLocaleString('en-IN')}</div>
            <div className="text-sm text-ivory/70 mt-2">{c.tagline}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 p-6 bg-blush/40 border border-taupe/20 rounded-lg">
        <h2 className="font-display text-xl text-ivory mb-3">How it works</h2>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-ivory/70">
          <li>Email us at <a href={`mailto:${SITE.email}`} className="underline text-crimson">{SITE.email}</a> with the amount and recipient email.</li>
          <li>Pay via UPI (send to the ID on our checkout page).</li>
          <li>We generate the gift card code, email it to the recipient.</li>
          <li>They enter the code at checkout when they order.</li>
        </ol>
        <p className="mt-4 text-xs text-ivory/60">
          Turnaround: 4 hours during working hours (10 AM to 8 PM). Longer at night/weekends.
        </p>
      </div>
    </div>
  );
}




