"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Lead = {
  id: string;
  createdAt: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  address?: string | null;
  device?: string | null;
  source?: string | null;
  campaign?: string | null;
  visits?: number | null;
  cartValue?: number | null;
  cartStatus?: string | null;
  coupon?: string | null;
  status?: string | null;
  optIn?: boolean | null;
  returning?: boolean | null;
};

const STATUSES = ["all", "new", "contacted", "converted", "lost", "spam"] as const;
type StatusFilter = typeof STATUSES[number];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [q, setQ] = useState("");
  const [exporting, setExporting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/leads?limit=500", { cache: "no-store" });
      const data = await res.json();
      setLeads(Array.isArray(data.leads) ? data.leads : []);
    } catch (e) {
      console.error("leads load failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (filter !== "all" && (l.status || "new") !== filter) return false;
      if (q) {
        const hay = [
          l.name, l.phone, l.email, l.city, l.state, l.pincode,
          l.address, l.source, l.campaign, l.coupon,
        ].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [leads, filter, q]);

  const stats = useMemo(() => {
    return {
      total: leads.length,
      optIn: leads.filter((l) => l.optIn).length,
      phone: leads.filter((l) => !!l.phone).length,
      email: leads.filter((l) => !!l.email).length,
      address: leads.filter((l) => !!(l.city || l.pincode || l.address)).length,
      returning: leads.filter((l) => l.returning).length,
      abandoned: leads.filter((l) => (l.cartStatus || "").toLowerCase() === "abandoned").length,
      converted: leads.filter((l) => (l.status || "") === "converted").length,
    };
  }, [leads]);

  const exportCSV = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("status", filter);
      if (q) params.set("q", q);
      const url = `/api/admin/leads/export?${params.toString()}`;
      const a = document.createElement("a");
      a.href = url;
      a.download = `rose-and-co-leads-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      setTimeout(() => setExporting(false), 800);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    try {
      await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch (e) {
      console.error("status update failed", e);
    }
  };

  const fmtTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString("en-IN", {
        day: "2-digit", month: "short",
        hour: "2-digit", minute: "2-digit", hour12: true,
      });
    } catch {
      return iso;
    }
  };

  const contactCell = (l: Lead) => {
    const name = (l.name || "").trim();
    const phone = (l.phone || "").trim();
    const email = (l.email || "").trim();
    return (
      <div className="flex flex-col gap-0.5">
        <span className="font-medium text-ivory">
          {name || <span className="italic text-ivory/40">anon</span>}
        </span>
        {phone ? (
          <a href={`tel:${phone}`} className="text-sm text-ivory/80 hover:text-wine transition">
            📞 {phone}
          </a>
        ) : (
          <span className="text-xs text-ivory/40">no phone</span>
        )}
        {email ? (
          <a href={`mailto:${email}`} className="text-xs text-ivory/60 hover:text-wine transition">
            {email}
          </a>
        ) : null}
      </div>
    );
  };

  const addressCell = (l: Lead) => {
    const parts = [l.address, l.city, l.state, l.pincode].filter(Boolean);
    if (parts.length === 0) return <span className="text-ivory/40">—</span>;
    return (
      <div className="text-sm text-ivory/80 leading-snug">
        {parts.join(", ")}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-espresso">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="text-sm text-ivory/60 hover:text-ivory transition">
            ← Back
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="px-3 py-1.5 text-sm bg-blush border border-taupe/40 rounded text-ivory hover:border-wine transition cursor-pointer"
            >
              Refresh
            </button>
            <button
              onClick={exportCSV}
              disabled={exporting || filtered.length === 0}
              className="px-4 py-1.5 text-sm bg-wine text-ivory rounded hover:bg-wine/90 transition cursor-pointer disabled:opacity-50"
            >
              {exporting ? "Exporting…" : `⬇ Export CSV (${filtered.length})`}
            </button>
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-ivory">Leads</h1>
        <p className="text-sm text-ivory/60 mb-4">
          Every visitor. Full contact + address captured.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-4">
          <Stat label="Total" value={stats.total} />
          <Stat label="Opted in" value={stats.optIn} />
          <Stat label="Phone" value={stats.phone} />
          <Stat label="Email" value={stats.email} />
          <Stat label="Address" value={stats.address} />
          <Stat label="Returning" value={stats.returning} />
          <Stat label="Abandoned" value={stats.abandoned} />
          <Stat label="Converted" value={stats.converted} />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 text-sm rounded border cursor-pointer transition ${
                filter === s
                  ? "bg-wine text-ivory border-wine"
                  : "bg-blush text-ivory/80 border-taupe/40 hover:border-wine"
              }`}
            >
              {s}
            </button>
          ))}
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, phone, city, coupon…"
            className="ml-auto px-3 py-1.5 text-sm border border-taupe/40 rounded w-64 bg-blush text-ivory placeholder:text-ivory/40"
          />
        </div>

        {/* Table */}
        <div className="bg-blush border border-taupe/20 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-blush/60 text-ivory/70 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Time</th>
                  <th className="px-3 py-2 font-medium">Contact</th>
                  <th className="px-3 py-2 font-medium">Address</th>
                  <th className="px-3 py-2 font-medium">Device</th>
                  <th className="px-3 py-2 font-medium">Source</th>
                  <th className="px-3 py-2 font-medium">Visits</th>
                  <th className="px-3 py-2 font-medium">Cart</th>
                  <th className="px-3 py-2 font-medium">Coupon</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-8 text-center text-ivory/60">
                      Loading…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-8 text-center text-ivory/60">
                      No leads match this filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((l) => (
                    <tr key={l.id} className="border-t border-taupe/20 hover:bg-blush/40 align-top transition">
                      <td className="px-3 py-2 whitespace-nowrap text-ivory/70">
                        {fmtTime(l.createdAt)}
                      </td>
                      <td className="px-3 py-2 min-w-[200px]">{contactCell(l)}</td>
                      <td className="px-3 py-2 min-w-[220px]">{addressCell(l)}</td>
                      <td className="px-3 py-2 text-ivory/80">{l.device || "—"}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col text-ivory/80">
                          <span>{l.source || "Direct"}</span>
                          {l.campaign ? (
                            <span className="text-xs text-ivory/40">{l.campaign}</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col text-ivory/80">
                          <span>{l.visits ?? 1}</span>
                          {l.returning ? (
                            <span className="text-xs text-wine">Return</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        {l.cartValue ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-ivory">₹{l.cartValue.toLocaleString("en-IN")}</span>
                            <span
                              className={`text-xs ${
                                (l.cartStatus || "").toLowerCase() === "abandoned"
                                  ? "text-glow"
                                  : "text-wine"
                              }`}
                            >
                              {l.cartStatus || "Active"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-ivory/40">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-ivory/80">{l.coupon || "—"}</td>
                      <td className="px-3 py-2">
                        <select
                          value={l.status || "new"}
                          onChange={(e) => updateStatus(l.id, e.target.value)}
                          className="px-2 py-1 text-xs border border-taupe/40 rounded bg-blush text-ivory cursor-pointer"
                        >
                          {STATUSES.filter((s) => s !== "all").map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-blush border border-taupe/20 rounded p-2 text-center">
      <div className="text-lg font-semibold text-ivory">{value}</div>
      <div className="text-xs text-ivory/60">{label}</div>
    </div>
  );
}
