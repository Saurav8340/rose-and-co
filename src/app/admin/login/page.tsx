'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null); setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push('/admin');
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="container-x py-24 max-w-md">
      <h1 className="font-display text-4xl text-ivory text-center">Admin Login</h1>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <div><label className="label">Email</label><input required autoFocus type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div><label className="label">Password</label><input required type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} /></div>
        {err && <div className="p-3 bg-wine/10 text-crimson text-sm border border-wine/30 rounded">{err}</div>}
        <button disabled={loading} className="btn-primary w-full cursor-pointer">{loading ? 'Signing in…' : 'Sign In'}</button>
      </form>
    </div>
  );
}



