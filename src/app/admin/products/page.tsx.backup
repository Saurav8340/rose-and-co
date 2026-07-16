import { redirect } from 'next/navigation';
import Link from 'next/link';
import { verifyAdminSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { inr } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function AdminProducts() {
  if (!(await verifyAdminSession())) redirect('/admin/login');
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="container-x py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-3xl text-espresso">Products</h1>
        <Link href="/admin" className="text-xs uppercase tracking-widest">← Dashboard</Link>
      </div>
      <div className="border border-taupe/20 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-blush/40 text-xs uppercase tracking-widest">
            <tr><th className="p-3 text-left">Product</th><th className="p-3 text-left">Slug</th><th className="p-3 text-left">Price</th><th className="p-3 text-left">Sizes / Stock</th><th className="p-3">Active</th></tr>
          </thead>
          <tbody>
            {products.map(p => {
              const sizes: any[] = JSON.parse(p.sizes);
              return (
                <tr key={p.id} className="border-t border-taupe/20">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3 font-mono text-xs">{p.slug}</td>
                  <td className="p-3">{inr(p.price)}</td>
                  <td className="p-3 text-xs">{sizes.map(s => `${s.size}:${s.stock}`).join(' · ')}</td>
                  <td className="p-3 text-center">{p.active ? '✓' : '✗'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-6 text-xs text-espresso/60">To edit product content, images, prices or stock: use <code>npx prisma studio</code> or re-run <code>npm run db:seed</code>.</p>
    </div>
  );
}
