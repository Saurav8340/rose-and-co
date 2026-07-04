import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string };
}) {
  const session = cookies().get('admin_session')?.value;
  if (!session) redirect('/admin/login');

  const status = searchParams.status || 'all';
  const q = searchParams.q || '';

  const where: any = {};
  if (status !== 'all') where.status = status;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q } },
      { email: { contains: q, mode: 'insensitive' } },
      { city: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [leads, stats] = await Promise.all([
    prisma.lead.findMany({ where, orderBy: { createdAt: 'desc' }, take: 300 }),
    Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { optedIn: true } }),
      prisma.lead.count({ where: { phone: { not: null } } }),
      prisma.lead.count({ where: { email: { not: null } } }),
      prisma.lead.count({ where: { isReturning: true } }),
      prisma.lead.count({ where: { cartAdded: true } }),
      prisma.lead.count({ where: { cartAbandoned: true } }),
      prisma.lead.count({ where: { converted: true } }),
    ]).then(([total, optedIn, withPhone, withEmail, returning, cartAdded, cartAbandoned, converted]) => ({
      total, optedIn, withPhone, withEmail, returning, cartAdded, cartAbandoned, converted,
    })),
  ]);

  return (
    <div className="container-x py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-espresso">Leads</h1>
          <p className="text-sm text-espresso/70">Every visitor tracked automatically. Live data.</p>
        </div>
        <Link href="/admin" className="text-xs uppercase tracking-widest underline text-wine">
          Back to admin
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        <Stat label="Total" value={stats.total} />
        <Stat label="Opted in" value={stats.optedIn} />
        <Stat label="Has phone" value={stats.withPhone} />
        <Stat label="Has email" value={stats.withEmail} />
        <Stat label="Returning" value={stats.returning} />
        <Stat label="Cart added" value={stats.cartAdded} />
        <Stat label="Cart abandoned" value={stats.cartAbandoned} accent="warning" />
        <Stat label="Converted" value={stats.converted} accent="success" />
      </div>

      {/* Filter + search */}
      <form className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex gap-2 border-b border-taupe/20 flex-1">
          {['all', 'new', 'contacted', 'converted', 'lost', 'spam'].map((s) => (
            <a
              key={s}
              href={`/admin/leads?status=${s}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
              className={`px-3 py-2 text-xs uppercase tracking-widest ${
                status === s ? 'text-wine border-b-2 border-wine -mb-px' : 'text-espresso/60 hover:text-espresso'
              }`}
            >
              {s}
            </a>
          ))}
        </div>
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search name / phone / email / city"
          className="border border-taupe/30 px-3 py-2 text-sm w-64 focus:border-wine focus:outline-none"
        />
        <input type="hidden" name="status" value={status} />
        <button type="submit" className="text-xs uppercase tracking-widest px-4 py-2 border border-wine text-wine hover:bg-wine hover:text-ivory transition">
          Search
        </button>
      </form>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-taupe/30 text-xs uppercase tracking-widest text-espresso/60">
              <th className="py-2 px-3">Time</th>
              <th className="py-2 px-3">Contact</th>
              <th className="py-2 px-3">Location</th>
              <th className="py-2 px-3">Device</th>
              <th className="py-2 px-3">Source</th>
              <th className="py-2 px-3">Behavior</th>
              <th className="py-2 px-3">Cart</th>
              <th className="py-2 px-3">Coupon</th>
              <th className="py-2 px-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-b border-taupe/10 hover:bg-blush/10 align-top">
                <td className="py-3 px-3 text-xs text-espresso/70 whitespace-nowrap">
                  {new Date(l.createdAt).toLocaleString('en-IN', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                  })}
                </td>
                <td className="py-3 px-3">
                  <div className="font-medium">{l.name || <span className="text-espresso/40 italic">anon</span>}</div>
                  <div className="text-xs text-espresso/70 space-y-0.5 mt-1">
                    {l.phone && <div>Phone: {l.phone}</div>}
                    {l.email && <div>Email: {l.email}</div>}
                  </div>
                </td>
                <td className="py-3 px-3 text-xs">
                  {l.city && <div className="font-medium">{l.city}</div>}
                  {l.region && <div className="text-espresso/60">{l.region}</div>}
                  {l.timezone && <div className="text-espresso/40 text-[10px]">{l.timezone}</div>}
                </td>
                <td className="py-3 px-3 text-xs">
                  <div className="capitalize">{l.deviceType || '-'}</div>
                  {l.screenWidth && l.screenHeight && (
                    <div className="text-espresso/60 text-[10px]">{l.screenWidth} x {l.screenHeight}</div>
                  )}
                </td>
                <td className="py-3 px-3 text-xs">
                  {l.utmCampaign ? (
                    <div>
                      <span className="bg-wine/10 text-wine px-2 py-0.5 text-[10px] rounded">
                        {l.utmSource || 'meta'}
                      </span>
                      <div className="text-espresso/70 mt-1 max-w-[140px] truncate">{l.utmCampaign}</div>
                      {l.utmContent && <div className="text-espresso/50 text-[10px] truncate max-w-[140px]">{l.utmContent}</div>}
                    </div>
                  ) : l.referrer && l.referrer !== 'direct' ? (
                    <div className="text-espresso/60 text-[10px] truncate max-w-[140px]">{safeHostname(l.referrer)}</div>
                  ) : (
                    <span className="text-espresso/40">Direct</span>
                  )}
                </td>
                <td className="py-3 px-3 text-xs space-y-1">
                  <div>Visits: <strong>{l.visitCount}</strong></div>
                  {l.isReturning && <div className="text-green-700">Returning</div>}
                  {l.scrolled && <div className="text-blue-700">Scrolled</div>}
                  {l.hasAddress && <div className="text-purple-700">Address saved</div>}
                </td>
                <td className="py-3 px-3 text-xs">
                  {l.cartAdded ? (
                    <div>
                      <div className={l.cartAbandoned ? 'text-wine font-semibold' : 'text-green-700'}>
                        {l.cartAbandoned ? 'Abandoned' : 'Active'}
                      </div>
                      {l.cartValue && <div className="text-espresso/70">Rs {l.cartValue.toLocaleString('en-IN')}</div>}
                    </div>
                  ) : (
                    <span className="text-espresso/40">-</span>
                  )}
                </td>
                <td className="py-3 px-3 text-xs">
                  {l.couponCode ? (
                    <div>
                      <div className="font-mono font-semibold">{l.couponCode}</div>
                      <div className="text-espresso/60">{l.couponPct}% off</div>
                      {l.segment && <div className="text-[10px] text-espresso/50 capitalize">{l.segment.replace('_', ' ')}</div>}
                    </div>
                  ) : (
                    <span className="text-espresso/40">-</span>
                  )}
                </td>
                <td className="py-3 px-3 text-xs">
                  <span className={statusBadge(l.status)}>{l.status}</span>
                  {l.converted && <div className="text-green-700 text-[10px] mt-1">Order: {l.orderNumber}</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {leads.length === 0 && (
        <div className="text-center py-16 text-espresso/60 bg-blush/10">
          <p>No leads yet.</p>
          <p className="text-xs mt-2">As soon as visitors land, they will appear here.</p>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: 'success' | 'warning' }) {
  const color =
    accent === 'success' ? 'bg-green-50 border-green-200' :
    accent === 'warning' ? 'bg-wine/10 border-wine/30' :
    'bg-blush/20 border-taupe/20';
  return (
    <div className={`border p-3 ${color}`}>
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-espresso/70 mt-1">{label}</div>
    </div>
  );
}

function statusBadge(status: string): string {
  const base = 'px-2 py-1 rounded text-[10px] uppercase tracking-widest ';
  switch (status) {
    case 'converted': return base + 'bg-green-100 text-green-800';
    case 'contacted': return base + 'bg-blue-100 text-blue-800';
    case 'lost': return base + 'bg-gray-100 text-gray-600';
    case 'spam': return base + 'bg-red-100 text-red-800';
    default: return base + 'bg-yellow-100 text-yellow-800';
  }
}

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url.slice(0, 40);
  }
}
