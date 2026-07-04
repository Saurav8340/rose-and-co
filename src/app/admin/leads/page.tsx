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
      { pincode: { contains: q } },
    ];
  }

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 300,
  });

  const total = await prisma.lead.count();
  const withPhone = await prisma.lead.count({ where: { phone: { not: null } } });
  const withEmail = await prisma.lead.count({ where: { email: { not: null } } });
  const withAddress = await prisma.lead.count({ where: { pincode: { not: null } } });
  const optedIn = await prisma.lead.count({ where: { optedIn: true } });
  const returning = await prisma.lead.count({ where: { isReturning: true } });
  const cartAbandoned = await prisma.lead.count({ where: { cartAbandoned: true } });
  const converted = await prisma.lead.count({ where: { converted: true } });

  return (
    <div className="container-x py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-espresso">Leads</h1>
          <p className="text-sm text-espresso/70">Every visitor. Full contact + address captured.</p>
        </div>
        <Link href="/admin" className="text-xs uppercase tracking-widest underline text-wine">
          Back
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        <Stat label="Total" value={total} />
        <Stat label="Opted in" value={optedIn} />
        <Stat label="Phone" value={withPhone} />
        <Stat label="Email" value={withEmail} />
        <Stat label="Address" value={withAddress} />
        <Stat label="Returning" value={returning} />
        <Stat label="Abandoned" value={cartAbandoned} />
        <Stat label="Converted" value={converted} />
      </div>

      <div className="flex gap-2 border-b border-taupe/20 mb-4 flex-wrap">
        {['all', 'new', 'contacted', 'converted', 'lost', 'spam'].map((s) => (
          <a
            key={s}
            href={`/admin/leads?status=${s}`}
            className={`px-3 py-2 text-xs uppercase tracking-widest ${
              status === s ? 'text-wine border-b-2 border-wine -mb-px' : 'text-espresso/60 hover:text-espresso'
            }`}
          >
            {s}
          </a>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-taupe/30 text-xs uppercase tracking-widest text-espresso/60">
              <th className="py-2 px-3">Time</th>
              <th className="py-2 px-3">Contact</th>
              <th className="py-2 px-3">Address</th>
              <th className="py-2 px-3">Device</th>
              <th className="py-2 px-3">Source</th>
              <th className="py-2 px-3">Visits</th>
              <th className="py-2 px-3">Cart</th>
              <th className="py-2 px-3">Coupon</th>
              <th className="py-2 px-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l: any) => (
              <tr key={l.id} className="border-b border-taupe/10 hover:bg-blush/10 align-top">
                <td className="py-3 px-3 text-xs text-espresso/70 whitespace-nowrap">
                  {new Date(l.createdAt).toLocaleString('en-IN', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                  })}
                </td>
                <td className="py-3 px-3">
                  <div className="font-medium">{l.name || 'anon'}</div>
                  <div className="text-xs text-espresso/70 space-y-0.5">
                    {l.phone && <div className="font-mono">{l.phone}</div>}
                    {l.email && <div className="truncate max-w-[180px]">{l.email}</div>}
                  </div>
                </td>
                <td className="py-3 px-3 text-xs">
                  {l.pincode && <div className="font-mono font-medium">{l.pincode}</div>}
                  {l.city && <div>{l.city}</div>}
                  {l.state && <div className="text-espresso/60">{l.state}</div>}
                  {l.addressLine1 && (
                    <div className="text-espresso/60 truncate max-w-[160px] mt-1" title={l.addressLine1}>
                      {l.addressLine1}
                    </div>
                  )}
                  {!l.pincode && !l.city && <span className="text-espresso/40">-</span>}
                </td>
                <td className="py-3 px-3 text-xs capitalize">{l.deviceType || '-'}</td>
                <td className="py-3 px-3 text-xs">
                  {l.utmCampaign ? (
                    <div>
                      <div className="bg-wine/10 text-wine px-2 py-0.5 text-[10px] rounded inline-block">
                        {l.utmSource || 'meta'}
                      </div>
                      <div className="text-espresso/70 mt-1 truncate max-w-[140px]">{l.utmCampaign}</div>
                    </div>
                  ) : l.referrer && l.referrer !== 'direct' ? (
                    <div className="text-espresso/60 text-[10px] truncate max-w-[140px]">{l.referrer}</div>
                  ) : (
                    <span className="text-espresso/40">Direct</span>
                  )}
                </td>
                <td className="py-3 px-3 text-xs">
                  <div><strong>{l.visitCount}</strong></div>
                  {l.isReturning && <div className="text-green-700">Return</div>}
                </td>
                <td className="py-3 px-3 text-xs">
                  {l.cartAdded ? (
                    <div>
                      <div className={l.cartAbandoned ? 'text-wine font-semibold' : 'text-green-700'}>
                        {l.cartAbandoned ? 'Abandoned' : 'Active'}
                      </div>
                      {l.cartValue && <div className="text-espresso/70">Rs {l.cartValue}</div>}
                    </div>
                  ) : (<span className="text-espresso/40">-</span>)}
                </td>
                <td className="py-3 px-3 text-xs">
                  {l.couponCode ? (
                    <div>
                      <div className="font-mono font-semibold">{l.couponCode}</div>
                      <div className="text-espresso/60">{l.couponPct}%</div>
                    </div>
                  ) : (<span className="text-espresso/40">-</span>)}
                </td>
                <td className="py-3 px-3 text-xs">
                  <span className={statusBadge(l.status)}>{l.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {leads.length === 0 && (
        <div className="text-center py-16 text-espresso/60 bg-blush/10">
          <p>No leads yet.</p>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border p-3 bg-blush/20 border-taupe/20">
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
