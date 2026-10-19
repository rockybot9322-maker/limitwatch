import { NextResponse } from "next/server";
import { isAdmin, unauthorized, noDb } from "@/lib/admin";
import { hasDb, sql, logError } from "@/lib/db";

export const dynamic = "force-dynamic";
const DIRS = ["increase", "decrease", "neutral", "unit-change", "not-established", "no-change"];

/**
 * POST /api/admin/approve
 * { id, action: "approve" | "reject", entry?: { id?, date, vendor, plans[], title, summary, before?, after?, announced?,
 *   vendor_framing?, direction, status?, source_url, source_name?, verified? } }
 * Approving a limit_change requires `entry` (checked against a real source). Approving a week_length report needs no entry.
 * POST with no `id` and an `entry` publishes a curated entry directly.
 */
export async function POST(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  if (!hasDb()) return noDb();
  try {
    const b = await req.json();
    const db = sql();
    if (b.action === "reject") {
      await db`UPDATE submissions SET status='rejected', reviewed_at=now() WHERE id=${Number(b.id)}`;
      return NextResponse.json({ ok: true, status: "rejected" });
    }
    let sub: Record<string, unknown> | undefined;
    if (b.id != null) {
      sub = (await db`SELECT * FROM submissions WHERE id=${Number(b.id)}`)[0];
      if (!sub) return NextResponse.json({ error: "submission not found" }, { status: 404 });
    }
    let entryId: string | null = null;
    if (b.entry || (sub && sub.kind === "limit_change")) {
      const e = b.entry;
      if (!e) return NextResponse.json({ error: "limit_change approvals need an entry object" }, { status: 400 });
      for (const k of ["date", "vendor", "title", "summary", "direction", "source_url"]) if (!e[k]) return NextResponse.json({ error: `entry.${k} required` }, { status: 400 });
      if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date)) return NextResponse.json({ error: "entry.date must be YYYY-MM-DD" }, { status: 400 });
      if (!DIRS.includes(e.direction)) return NextResponse.json({ error: `entry.direction must be one of ${DIRS.join(", ")}` }, { status: 400 });
      if (!/^https?:\/\//.test(e.source_url)) return NextResponse.json({ error: "entry.source_url must be a URL" }, { status: 400 });
      entryId = e.id || `${e.vendor}-${e.date}-${String(e.title).toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`;
      await db`INSERT INTO entries (id, date, vendor, plans, title, summary, before, after, announced, vendor_framing, direction, status, source_url, source_name, verified)
        VALUES (${entryId}, ${e.date}, ${e.vendor}, ${e.plans ?? []}, ${e.title}, ${e.summary}, ${e.before ?? null}, ${e.after ?? null}, ${e.announced ?? null}, ${e.vendor_framing ?? null}, ${e.direction}, ${e.status ?? "effective"}, ${e.source_url}, ${e.source_name ?? null}, ${!!e.verified})
        ON CONFLICT (id) DO UPDATE SET date=EXCLUDED.date, vendor=EXCLUDED.vendor, plans=EXCLUDED.plans, title=EXCLUDED.title, summary=EXCLUDED.summary, before=EXCLUDED.before, after=EXCLUDED.after,
          announced=EXCLUDED.announced, vendor_framing=EXCLUDED.vendor_framing, direction=EXCLUDED.direction, status=EXCLUDED.status, source_url=EXCLUDED.source_url, source_name=EXCLUDED.source_name, verified=EXCLUDED.verified`;
    }
    if (sub) await db`UPDATE submissions SET status='approved', reviewed_at=now(), entry_id=${entryId} WHERE id=${Number(b.id)}`;
    return NextResponse.json({ ok: true, status: "approved", entry_id: entryId });
  } catch (e) {
    await logError("admin/approve", e);
    return NextResponse.json({ error: String((e as Error).message) }, { status: 500 });
  }
}
