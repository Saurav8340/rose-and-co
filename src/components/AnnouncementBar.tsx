export default function AnnouncementBar() {
  const items = [
    'Free Delhivery shipping',
    'Rs 1,499 all-in',
    'Prepaid via UPI - save Rs 100',
    'Ships from Gurugram in 24-48 hrs',
    '7-day free returns',
    'Amara marble swirl - new drop',
  ];
  return (
    <div className="bg-espresso text-ivory text-[11px] sm:text-xs tracking-widest uppercase py-2 overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee">
        <div className="flex gap-12 px-6 shrink-0">
          {items.map(t => <span key={t}>&middot; {t}</span>)}
        </div>
        <div className="flex gap-12 px-6 shrink-0" aria-hidden>
          {items.map(t => <span key={t}>&middot; {t}</span>)}
        </div>
      </div>
    </div>
  );
}
