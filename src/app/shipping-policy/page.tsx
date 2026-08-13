export const metadata = { title: 'Shipping Policy' };

export default function Page() {
  return (
    <div className="container-x py-16 max-w-3xl">
      <h1 className="font-display text-4xl text-ivory mb-8">Shipping</h1>

      <div className="text-ivory/80 leading-relaxed space-y-5">
        <div className="grid grid-cols-2 gap-4">
          {[
            ['Ships to', 'All of India'],
            ['Shipping cost', 'Free · no minimum'],
            ['Dispatch time', '24–48 hours'],
            ['Delivery time', '3–7 business days'],
          ].map(([k, v]) => (
            <div key={k} className="p-4 bg-blush/40 border border-taupe/20 rounded">
              <div className="text-xs uppercase tracking-widest text-ivory/60">{k}</div>
              <div className="text-ivory font-medium mt-1">{v}</div>
            </div>
          ))}
        </div>

        <div className="pt-4">
          <h2 className="font-display text-xl text-ivory mb-2">Dispatch time</h2>
          <p>24–48 hours from payment confirmation. If you order Friday evening, expect Monday dispatch.</p>
        </div>

        <div>
          <h2 className="font-display text-xl text-ivory mb-2">Delivery time</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><b>Metros:</b> 3–5 business days (Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Pune, Kolkata)</li>
            <li><b>Tier-2 / tier-3 cities:</b> 5–7 business days</li>
            <li><b>North-East + remote pincodes:</b> up to 10 business days</li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-xl text-ivory mb-2">Courier partners</h2>
          <p>Delhivery for most pincodes. Ecom Express or Xpressbees for zones where Delhivery does not reach.</p>
        </div>

        <div>
          <h2 className="font-display text-xl text-ivory mb-2">Tracking</h2>
          <p>You get a tracking link via SMS when your order ships. You can also track from our <a href="/track" className="underline text-crimson hover:text-ivory transition">Track order</a> page any time.</p>
        </div>

        <div>
          <h2 className="font-display text-xl text-ivory mb-2">Partial COD</h2>
          <p>A small deposit is collected online at checkout. The remaining amount is collected in cash when the courier hands over the package.</p>
        </div>

        <div>
          <h2 className="font-display text-xl text-ivory mb-2">Failed delivery</h2>
          <p>The courier attempts three times. If all three fail, the package comes back to us. We refund the online-paid amount within 7 working days.</p>
        </div>

        <div>
          <h2 className="font-display text-xl text-ivory mb-2">Address changes</h2>
          <p>Email us within 4 hours of placing the order. After that the order is picked up by the courier and cannot be modified.</p>
        </div>
      </div>
    </div>
  );
}




