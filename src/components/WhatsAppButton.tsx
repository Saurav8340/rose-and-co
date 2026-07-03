'use client';

export default function WhatsAppButton() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!number) return null;

  const msg = encodeURIComponent('Hi Rose & Co, I have a question about the Amara set.');
  const href = `https://wa.me/${number}?text=${msg}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label="WhatsApp us"
      className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-30 flex items-center gap-2 pl-3 pr-4 py-3 rounded-full shadow-lg bg-[#25D366] text-white active:scale-95 transition"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
        <path d="M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.892c0 2.096.549 4.14 1.594 5.945L0 24l6.335-1.652a12.062 12.062 0 005.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.495-8.411z"/>
      </svg>
      <span className="text-sm font-medium">Chat</span>
    </a>
  );
}
