export default function AnnouncementBar() {
  const items = [
    'Free shipping across India',
    '₹1,499 all-in · GST + shipping included',
    'Ships from Delhi NCR in 24–48 hours',
    '7-day returns · Free reverse pickup',
    'New drop — Amara marble swirl',
  ];
  return (
    <div className="bg-espresso text-ivory text-[11px] sm:text-xs tracking-widest uppercase py-2 overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee">
        <div className="flex gap-12 px-6 shrink-0">
          {items.map(t => <span key={t}>✦ {t}</span>)}
        </div>
        <div className="flex gap-12 px-6 shrink-0" aria-hidden>
          {items.map(t => <span key={t}>✦ {t}</span>)}
        </div>
      </div>
    </div>
  );
}
