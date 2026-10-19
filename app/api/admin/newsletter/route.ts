import { NextResponse } from "next/server";
import { isAdmin, unauthorized } from "@/lib/admin";
import { getEntries, vendorName, SITE_URL } from "@/lib/data";
import { currentSponsor } from "@/lib/sponsor";
import { buildWeekly, buildAlert } from "@/lib/newsletter.mjs";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/newsletter?type=weekly&end=YYYY-MM-DD  (week = the 7 days ending on `end`, default yesterday)
 * GET /api/admin/newsletter?type=alert&id=<entry id>
 * Returns { subject, html, text } ready for a Resend Broadcast (html contains {{{RESEND_UNSUBSCRIBE_URL}}}).
 * Add &format=html to preview the HTML directly.
 */
export async function GET(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  const u = new URL(req.url).searchParams;
  const entries = await getEntries();
  const fmt = u.get("format");
  let out: { subject: string; html: string; text: string };
  if (u.get("type") === "alert") {
    const entry = entries.find((e) => e.id === u.get("id"));
    if (!entry) return NextResponse.json({ error: "entry not found" }, { status: 404 });
    const sponsor = await currentSponsor(entry.date).catch(() => null);
    out = buildAlert({ entry, sponsor, siteUrl: SITE_URL, vendorName });
  } else {
    const end = u.get("end") || new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const start = new Date(new Date(end + "T00:00:00Z").getTime() - 6 * 86400000).toISOString().slice(0, 10);
    const sponsor = await currentSponsor(new Date(new Date(end + "T00:00:00Z").getTime() + 86400000).toISOString().slice(0, 10)).catch(() => null);
    out = buildWeekly({ entries, weekStart: start, weekEnd: end, sponsor, siteUrl: SITE_URL, vendorName });
  }
  if (fmt === "html") return new NextResponse(out.html, { headers: { "content-type": "text/html; charset=utf-8" } });
  return NextResponse.json(out);
}
