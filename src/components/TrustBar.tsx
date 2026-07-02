export default function TrustBar() {
  const items = [
    { t: 'Free shipping',    s: 'All India delivery' },
    { t: '24–48 hr dispatch', s: 'From Delhi NCR' },
    { t: '7-day returns',    s: 'Free reverse pickup' },
    { t: 'Secure checkout',  s: 'SSL + captcha protected' },
  ];
  return (
    <section className="border-y border-taupe/20 bg-blush/30">
      <div className="container-x grid grid-cols-2 md:grid-cols-4 gap-6 py-8">
        {items.map(x => (
          <div key={x.t} className="text-center">
            <div className="text-sm uppercase tracking-widest text-wine font-medium">{x.t}</div>
            <div className="text-xs text-espresso/60 mt-1">{x.s}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
