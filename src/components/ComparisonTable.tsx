export default function ComparisonTable() {
  const rows = [
    { label: 'Hardware',         us: 'Real metal D-rings', z: 'Printed graphic', f: 'Plastic hardware', h: 'Varies, often printed' },
    { label: 'Corset boning',    us: 'Steel-boned',        z: 'No boning',       f: 'Plastic boning',   h: 'Rarely boned' },
    { label: 'Mesh weight',      us: 'Dense, holds shape',  z: 'Thin, sheer',     f: 'Mid-weight',        h: '40-90 denier, varies' },
    { label: 'Delivery (Delhi)', us: '3-4 days',            z: '7-14 days',       f: '5-8 days',           h: '5-14 days' },
    { label: 'Returns',          us: '7 days, free',        z: 'Rarely',          f: '10 days',            h: 'Rarely' },
    { label: 'Price',            us: 'Rs 699-899',          z: 'Rs 3,000+',       f: 'Rs 1,200-1,800',    h: 'Rs 400-900' },
  ];
  return (
    <div className="mt-6">
      <div className="text-xs uppercase tracking-widest text-ivory/60 mb-3">How this compares</div>
      <div className="overflow-x-auto border border-taupe/30">
        <table className="w-full text-sm">
          <thead className="bg-blush/40 text-ivory">
            <tr>
              <th className="p-3 text-left text-xs uppercase tracking-widest"> </th>
              <th className="p-3 text-left text-xs uppercase tracking-widest text-crimson font-bold">Rosé & Co</th>
              <th className="p-3 text-left text-xs uppercase tracking-widest">Imported brands</th>
              <th className="p-3 text-left text-xs uppercase tracking-widest">Local alt sellers</th>
              <th className="p-3 text-left text-xs uppercase tracking-widest">Meesho / Instagram resellers</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.label} className="border-t border-taupe/20">
                <td className="p-3 text-xs uppercase tracking-widest text-ivory/70">{r.label}</td>
                <td className="p-3 font-semibold text-crimson">{r.us}</td>
                <td className="p-3 text-ivory/70">{r.z}</td>
                <td className="p-3 text-ivory/70">{r.f}</td>
                <td className="p-3 text-ivory/70">{r.h}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-ivory/50 mt-2">Based on our own orders and public listings. Prices as of 2026.</p>
    </div>
  );
}



