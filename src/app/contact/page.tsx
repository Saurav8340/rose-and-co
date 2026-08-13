import { SITE } from '@/lib/constants';

export const metadata = { title: 'Contact' };

export default function ContactPage() {
  return (
    <div className="container-x py-16 max-w-2xl">
      <h1 className="font-display text-4xl text-ivory">Get in touch</h1>
      <p className="mt-3 text-ivory/70 leading-relaxed">
        Fastest way to reach us is email. We reply within 24 hours &mdash; usually much faster on weekdays.
      </p>

      <div className="mt-8 grid gap-4 text-ivory">
        <div className="p-5 border border-taupe/30 bg-blush rounded-lg">
          <div className="text-xs uppercase tracking-widest text-ivory/60 mb-1">Email</div>
          <a className="text-lg underline text-crimson hover:text-ivory transition" href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </div>
        <div className="p-5 border border-taupe/30 bg-blush rounded-lg">
          <div className="text-xs uppercase tracking-widest text-ivory/60 mb-1">Instagram</div>
          <a className="text-lg underline text-crimson hover:text-ivory transition" href={SITE.instagram} target="_blank" rel="noopener">@roseandco</a>
          <p className="text-xs text-ivory/60 mt-2">DMs are open. Slower than email but we do check.</p>
        </div>
        <div className="p-5 border border-taupe/30 bg-blush rounded-lg">
          <div className="text-xs uppercase tracking-widest text-ivory/60 mb-1">Address</div>
          <div className="text-sm text-ivory">{SITE.address}</div>
          <p className="text-xs text-ivory/60 mt-2">Not a shopfront. Studio + fulfilment only.</p>
        </div>
      </div>

      <div className="mt-10 p-5 bg-blush/40 border border-taupe/20 rounded-lg">
        <h2 className="font-display text-xl text-ivory">Before you write in</h2>
        <ul className="mt-3 text-sm text-ivory/80 space-y-2 list-disc pl-5">
          <li><b className="text-ivory">Order help:</b> include your order number in the subject line.</li>
          <li><b className="text-ivory">Sizing help:</b> tell us your height and usual size in Zara or H&M. We will pick for you.</li>
          <li><b className="text-ivory">Payment issues:</b> attach your UPI transaction reference.</li>
          <li><b className="text-ivory">Return / exchange:</b> just say &ldquo;return&rdquo; or &ldquo;exchange&rdquo; and your order number. We do the rest.</li>
        </ul>
      </div>
    </div>
  );
}



