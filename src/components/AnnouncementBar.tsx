import { sanitizeHtml } from "@/lib/sanitize";
export default function AnnouncementBar() {
  const items = [
    'Free shipping across India',
    'Small-batch drop &middot; 200 sets',
    'Ships from Gurugram within 48 hours',
    'Seven-day returns',
  ];
  return (
    <div className="bg-espresso text-ivory text-[11px] sm:text-xs tracking-widest uppercase py-2 overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee">
        <div className="flex gap-12 px-6 shrink-0">
          {items.map(t => <span key={t} dangerouslySetInnerHTML={{ __html: sanitizeHtml('&middot; ' + t) }} />)}
        </div>
        <div className="flex gap-12 px-6 shrink-0" aria-hidden>
          {items.map(t => <span key={t} dangerouslySetInnerHTML={{ __html: sanitizeHtml('&middot; ' + t) }} />)}
        </div>
      </div>
    </div>
  );
}
