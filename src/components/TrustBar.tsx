export default function TrustBar() {
  const items = [
    { title: 'Free shipping', sub: 'Delhivery, everywhere in India' },
    { title: 'Ships in 24-48 hrs', sub: 'From Gurugram' },
    { title: '7-day returns', sub: 'Free pickup' },
    { title: 'UPI checkout', sub: 'Any app - GPay, PhonePe, Paytm' },
  ];

  return (
    <div className="bg-ivory border-y border-taupe/20">
      <div className="container-x grid grid-cols-2 md:grid-cols-4 gap-4 py-6">
        {items.map(x => (
          <div key={x.title} className="text-center">
            <div className="text-xs uppercase tracking-widest text-wine font-semibold">{x.title}</div>
            <div className="text-[11px] text-espresso/60 mt-1">{x.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
