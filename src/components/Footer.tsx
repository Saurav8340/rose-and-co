import Link from 'next/link';
import { SITE } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-taupe/20 bg-ivory">
      <div className="container-x py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <div className="font-display text-2xl tracking-[0.15em] text-wine">{SITE.name.toUpperCase()}</div>
          <p className="mt-4 text-sm text-espresso/70 leading-relaxed">
            Small-batch co-ord sets in hand-painted prints. Designed, printed and shipped from Gurugram.
          </p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest text-espresso mb-4">Shop</h4>
          <ul className="space-y-2 text-sm text-espresso/80">
            <li><Link href="/product/amara-marble-swirl-coord-set" className="hover:text-wine">Amara Co-ord Set</Link></li>
            <li><Link href="/journal" className="hover:text-wine">Journal</Link></li>
            <li><Link href="/track" className="hover:text-wine">Track your order</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest text-espresso mb-4">Help</h4>
          <ul className="space-y-2 text-sm text-espresso/80">
            <li><Link href="/contact" className="hover:text-wine">Contact us</Link></li>
            <li><Link href="/faq" className="hover:text-wine">FAQ</Link></li>
            <li><Link href="/shipping-policy" className="hover:text-wine">Shipping</Link></li>
            <li><Link href="/refund-policy" className="hover:text-wine">Returns & refunds</Link></li>
            <li><Link href="/cancellation-policy" className="hover:text-wine">Cancellations</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest text-espresso mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-espresso/80">
            <li><Link href="/about" className="hover:text-wine">About us</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-wine">Privacy</Link></li>
            <li><Link href="/terms" className="hover:text-wine">Terms</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-taupe/20">
        <div className="container-x py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-espresso/60">
          <span>{new Date().getFullYear()} {SITE.name}. Made in India.</span>
          <div className="flex gap-4 uppercase tracking-widest">
            <a href={SITE.instagram} target="_blank" rel="noopener">Instagram</a>
            <a href={`mailto:${SITE.email}`}>Email</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
