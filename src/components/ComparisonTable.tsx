export default function ComparisonTable() {
  const rows = [
    { label: 'Fabric weight',    us: '~100 GSM',      z: '~65 GSM',       f: '~80 GSM',       h: '40-90 GSM' },
    { label: 'Print',            us: 'Hand-painted',  z: 'Digital',       f: 'Digital',       h: 'Screen / digital' },
    { label: 'Each unique',      us: 'Yes',           z: 'No',            f: 'No',            h: 'No' },
    { label: 'Delivery (Delhi)', us: '3-4 days',      z: '4-7 days',      f: '4-6 days',      h: '5-14 days' },
    { label: 'Returns',          us: '7 days, free',  z: '30 days',       f: '15 days',       h: 'Rarely' },
    { label: 'Price',            us: 'Rs 1,499',      z: 'Rs 2,290+',     f: 'Rs 1,899',      h: 'Rs 800-1,800' },
  ];
  return (
    <div className="mt-6">
      <div className="text-xs uppercase tracking-widest text-espresso/60 mb-3">How the Amara compares</div>
      <div className="overflow-x-auto border border-taupe/30">
        <table className="w-full text-sm">
          <thead className="bg-blush/40 text-espresso">
            <tr>
              <th className="p-3 text-left text-xs uppercase tracking-widest"> </th>
              <th className="p-3 text-left text-xs uppercase tracking-widest text-wine font-bold">Amara</th>
              <th className="p-3 text-left text-xs uppercase tracking-widest">Zara</th>
              <th className="p-3 text-left text-xs uppercase tracking-widest">Urbanic</th>
              <th className="p-3 text-left text-xs uppercase tracking-widest">Instagram brands</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.label} className="border-t border-taupe/20">
                <td className="p-3 text-xs uppercase tracking-widest text-espresso/70">{r.label}</td>
                <td className="p-3 font-semibold text-wine">{r.us}</td>
                <td className="p-3 text-espresso/70">{r.z}</td>
                <td className="p-3 text-espresso/70">{r.f}</td>
                <td className="p-3 text-espresso/70">{r.h}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-espresso/50 mt-2">Based on our own orders and public size charts. Prices are Nov 2025.</p>
    </div>
  );
}
