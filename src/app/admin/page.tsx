import { redirect } from 'next/navigation';
import Link from 'next/link';
import { verifyAdminSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { inr } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard({ searchParams }: { searchParams: { status?: string; q?: string } }) {
  const ok = await verifyAdminSession();
  if (!ok) redirect('/admin/login');

  const where: any = {};
  if (searchParams.status) where.orderStatus = searchParams.status;
  if (searchParams.q) where.OR = [
    { orderNumber: { contains: searchParams.q } },
    { mobile: { contains: searchParams.q } },
    { fullName: { contains: searchParams.q } },
  ];

  const orders = await prisma.order.findMany({
    where, orderBy: { createdAt: 'desc' }, take: 100, include: { items: true },
  });

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60_000);

  const [
    totalOrders, verifiedRevenueAgg, pendingCount,
    todayCount, todayVerifiedRevAgg,
    prepaidAll, codAll,
    prepaidVerified, codVerified,
    rtoCount, deliveredCount,
    capiFiredCount,
    waitlistCount,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { paidAmount: true }, where: { paymentStatus: 'VERIFIED' } }),
    prisma.order.count({ where: { paymentStatus: 'PENDING' } }),
    prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.order.aggregate({ _sum: { paidAmount: true }, where: { paymentStatus: 'VERIFIED', createdAt: { gte: startOfToday } } }),
    prisma.order.count({ where: { paymentMethod: 'PREPAID', createdAt: { gte: thirtyDaysAgo } } }),
    prisma.order.count({ where: { paymentMethod: 'PARTIAL_COD', createdAt: { gte: thirtyDaysAgo } } }),
    prisma.order.count({ where: { paymentMethod: 'PREPAID', paymentStatus: 'VERIFIED', createdAt: { gte: thirtyDaysAgo } } }),
    prisma.order.count({ where: { paymentMethod: 'PARTIAL_COD', orderStatus: 'DELIVERED', paymentStatus: 'VERIFIED', createdAt: { gte: thirtyDaysAgo } } }),
    prisma.order.count({ where: { orderStatus: 'CANCELLED', paymentMethod: 'PARTIAL_COD', createdAt: { gte: thirtyDaysAgo } } }),
    prisma.order.count({ where: { orderStatus: 'DELIVERED', paymentMethod: 'PARTIAL_COD', createdAt: { gte: thirtyDaysAgo } } }),
    prisma.order.count({ where: { capiFired: true, createdAt: { gte: thirtyDaysAgo } } }),
    prisma.waitlist.count({ where: { notified: false } }),
  ]);

  const total30d = prepaidAll + codAll;
  const prepaidRate = total30d > 0 ? Math.round((prepaidAll / total30d) * 100) : 0;
  const codDeliveryRate = (rtoCount + deliveredCount) > 0
    ? Math.round((deliveredCount / (rtoCount + deliveredCount)) * 100)
    : null;

  const cityAgg = await prisma.order.groupBy({
    by: ['city'],
    where: { paymentStatus: 'VERIFIED', createdAt: { gte: thirtyDaysAgo } },
    _count: { city: true },
    orderBy: { _count: { city: 'desc' } },
    take: 1,
  });
  const topCity = cityAgg[0]?.city || '—';

  return (
    <div className="container-x py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-espresso">Admin dashboard</h1>
          <p className="text-sm text-espresso/60">Rosé & Co · Order management</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/waitlist" className="btn-secondary">Waitlist {waitlistCount > 0 && <span className="ml-2 badge bg-wine text-ivory">{waitlistCount}</span>}</Link>
          <Link href="/admin/products" className="btn-secondary">Products</Link>
          <Link href="/api/admin/orders/export" className="btn-secondary">Export CSV</Link>
          <form action="/api/admin/logout" method="POST"><button className="text-xs uppercase tracking-widest text-espresso/60 hover:text-wine">Logout</button></form>
        </div>
      </div>

      {/* Today */}
      <div className="mb-6 p-4 bg-blush/30 border-l-4 border-wine">
        <div className="text-xs uppercase tracking-widest text-wine">Today</div>
        <div className="mt-2 flex flex-wrap gap-6 text-sm">
          <div><b className="text-espresso text-lg">{todayCount}</b> orders</div>
          <div><b className="text-espresso text-lg">{inr(todayVerifiedRevAgg._sum.paidAmount || 0)}</b> verified revenue</div>
          <div>Top city (30d): <b className="text-espresso">{topCity}</b></div>
        </div>
      </div>

      {/* CORE KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total orders" value={totalOrders.toString()} />
        <StatCard title="Verified revenue" value={inr(verifiedRevenueAgg._sum.paidAmount || 0)} />
        <StatCard title="Pending verification" value={pendingCount.toString()} highlight />
        <StatCard title="CAPI events fired (30d)" value={capiFiredCount.toString()} />
      </div>

      {/* AD SPEND EFFICIENCY (30-day) */}
      <div className="mb-8 p-5 border-2 border-green-700/40 bg-green-50/50">
        <div className="text-xs uppercase tracking-widest text-green-800 font-semibold mb-3">Ad-spend efficiency (30 days)</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-xs text-espresso/60 uppercase tracking-widest">Prepaid share</div>
            <div className="text-2xl font-display text-espresso mt-1">{prepaidRate}%</div>
            <div className="text-xs text-espresso/50 mt-1">Target: 55%+</div>
          </div>
          <div>
            <div className="text-xs text-espresso/60 uppercase tracking-widest">Prepaid verified</div>
            <div className="text-2xl font-display text-espresso mt-1">{prepaidVerified}</div>
            <div className="text-xs text-espresso/50 mt-1">of {prepaidAll} total</div>
          </div>
          <div>
            <div className="text-xs text-espresso/60 uppercase tracking-widest">COD delivered</div>
            <div className="text-2xl font-display text-espresso mt-1">{codDeliveryRate !== null ? `${codDeliveryRate}%` : '—'}</div>
            <div className="text-xs text-espresso/50 mt-1">Target: 85%+</div>
          </div>
          <div>
            <div className="text-xs text-espresso/60 uppercase tracking-widest">COD RTO (30d)</div>
            <div className="text-2xl font-display text-espresso mt-1">{rtoCount}</div>
            <div className="text-xs text-espresso/50 mt-1">Cancelled after dispatch</div>
          </div>
        </div>
        <p className="mt-4 text-xs text-espresso/60 leading-relaxed">
          Meta CAPI fires only when money is in the bank. Prepaid: on payment VERIFIED. COD: on DELIVERED + VERIFIED. This keeps your Meta ROAS clean.
        </p>
      </div>

      <form className="flex flex-wrap gap-3 mb-4" method="GET">
        <input name="q" defaultValue={searchParams.q} placeholder="Search order/mobile/name" className="input flex-1 max-w-sm" />
        <select name="status" defaultValue={searchParams.status || ''} className="input max-w-xs">
          <option value="">All statuses</option>
          <option>PLACED</option><option>CONFIRMED</option><option>PACKED</option>
          <option>SHIPPED</option><option>DELIVERED</option><option>CANCELLED</option>
        </select>
        <button className="btn-primary">Filter</button>
      </form>

      <div className="overflow-x-auto border border-taupe/20">
        <table className="w-full text-sm">
          <thead className="bg-blush/40 text-xs uppercase tracking-widest">
            <tr>
              <th className="p-3 text-left">Order</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">Payment</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">CAPI</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-t border-taupe/20 hover:bg-blush/10">
                <td className="p-3 font-mono">{o.orderNumber}</td>
                <td className="p-3">{o.fullName}<br/><span className="text-xs text-espresso/60">{o.mobile}</span></td>
                <td className="p-3 text-xs">{o.items.map(i => `${i.productName} · ${i.size} × ${i.quantity}`).join(', ')}</td>
                <td className="p-3">
                  <div>{inr(o.paidAmount)} <span className={`text-xs ${o.paymentMethod === 'PREPAID' ? 'text-green-800 font-medium' : 'text-espresso/60'}`}>{o.paymentMethod === 'PREPAID' ? 'Prepaid' : 'COD'}</span></div>
                  <div className={`text-xs ${o.paymentStatus === 'VERIFIED' ? 'text-green-700' : o.paymentStatus === 'FAILED' ? 'text-red-700' : 'text-wine'}`}>{o.paymentStatus}</div>
                  {o.utr && <div className="text-[10px] text-espresso/50 font-mono">UTR: {o.utr}</div>}
                </td>
                <td className="p-3"><span className="badge bg-espresso text-ivory">{o.orderStatus}</span></td>
                <td className="p-3 text-xs">{o.capiFired ? <span className="text-green-700">✓ Sent</span> : <span className="text-espresso/40">—</span>}</td>
                <td className="p-3 text-xs">{new Date(o.createdAt).toLocaleString('en-IN')}</td>
                <td className="p-3"><Link href={`/admin/orders/${o.id}`} className="text-wine underline text-xs">View</Link></td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={8} className="p-10 text-center text-espresso/60">No orders yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ title, value, highlight }: { title: string; value: string; highlight?: boolean }) {
  return (
    <div className={`p-5 border ${highlight ? 'border-wine bg-blush/30' : 'border-taupe/20 bg-white'}`}>
      <div className="text-xs uppercase tracking-widest text-espresso/60">{title}</div>
      <div className="text-2xl font-display text-espresso mt-1">{value}</div>
    </div>
  );
}
