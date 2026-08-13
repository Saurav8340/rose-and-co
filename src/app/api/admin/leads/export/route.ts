import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; import { verifyAdminSession } from "@/lib/session";



// CSV escape: wrap in quotes, escape internal quotes
function csv(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v).replace(/"/g, '""').replace(/\r?\n/g, " ");
  return `"${s}"`;
}

export async function GET(req: NextRequest) { if (!(await verifyAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); if (!(await verifyAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const q = (searchParams.get("q") || "").trim();

    const where: any = {};
    if (status && status !== "all") where.status = status;
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
        { email: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { pincode: { contains: q } },
        { coupon: { contains: q, mode: "insensitive" } },
        { campaign: { contains: q, mode: "insensitive" } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 5000,
    });

    const headers = [
      "Created At", "Name", "Phone", "Email",
      "Address", "City", "State", "Pincode",
      "Device", "Source", "Campaign", "Referrer",
      "Visits", "Cart Value (INR)", "Cart Status", "Coupon",
      "Status", "Opt-In", "Returning", "IP", "User Agent",
    ];

    const rows = leads.map((l: any) => [
      new Date(l.createdAt).toISOString(),
      l.name || "",
      l.phone || "",
      l.email || "",
      l.address || "",
      l.city || "",
      l.state || "",
      l.pincode || "",
      l.device || "",
      l.source || "",
      l.campaign || "",
      l.referrer || "",
      l.visits ?? "",
      l.cartValue ?? "",
      l.cartStatus || "",
      l.coupon || "",
      l.status || "new",
      l.optIn ? "yes" : "no",
      l.returning ? "yes" : "no",
      l.ip || "",
      l.userAgent || "",
    ]);

    const csvBody =
      headers.map(csv).join(",") + "\n" +
      rows.map((r) => r.map(csv).join(",")).join("\n");

    // BOM for Excel UTF-8 compatibility
    const body = "\uFEFF" + csvBody;

    const stamp = new Date().toISOString().slice(0, 10);
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="rose-and-co-leads-${stamp}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    console.error("export failed", e);
    return NextResponse.json({ error: "export_failed", message: e?.message }, { status: 500 });
  }
}



