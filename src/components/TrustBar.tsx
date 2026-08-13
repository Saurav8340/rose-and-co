export default function TrustBar() {
  const items = [
    { title: 'Free shipping', sub: 'Anywhere in India' },
    { title: 'Ships in 48 hours', sub: 'From Gurugram' },
    { title: 'Seven-day returns', sub: 'We arrange the pickup' },
    { title: 'Written by a person', sub: 'Every note answered' },
  ];

  return (
    <div className="bg-espresso border-y border-taupe/20">
      <div className="container-x grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
        {items.map(x => (
          <div key={x.title} className="text-center">
            <div className="text-xs uppercase tracking-widest text-wine font-semibold">{x.title}</div>
            <div className="text-[11px] text-ivory/60 mt-1">{x.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
