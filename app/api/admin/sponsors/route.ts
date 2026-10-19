import { NextResponse } from "next/server";
import { isAdmin, unauthorized, noDb } from "@/lib/admin";
import { hasDb, sql, logError } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET: sponsor weeks with click counts, plus recent inquiries. */
export async function GET(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  if (!hasDb()) return noDb();
  const db = sql();
  const weeks = await db`SELECT w.*, to_char(w.week_start,'YYYY-MM-DD') AS week_start,
    (SELECT count(*)::int FROM sponsor_clicks c WHERE c.slug = w.slug AND c.created_at >= w.week_start AND c.created_at < w.week_start + 7) AS clicks_in_week,
    (SELECT count(*)::int FROM sponsor_clicks c WHERE c.slug = w.slug) AS clicks_total
    FROM sponsor_weeks w ORDER BY w.week_start DESC LIMIT 100`;
  const inquiries = await db`SELECT id, name, email, company, message, created_at FROM sponsor_inquiries ORDER BY created_at DESC LIMIT 50`;
  return NextResponse.json({ weeks, inquiries });
}

/** POST { slug, name, url, tagline?, week_start: "YYYY-MM-DD" (a Monday), price_usd?, status? } — book or update a week. */
export async function POST(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  if (!hasDb()) return noDb();
  try {
    const b = await req.json();
    if (!/^[a-z0-9-]{2,40}$/.test(b.slug || "")) return NextResponse.json({ error: "slug must be lowercase letters, digits, dashes" }, { status: 400 });
    if (!/^https?:\/\//.test(b.url || "")) return NextResponse.json({ error: "url required" }, { status: 400 });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(b.week_start || "")) return NextResponse.json({ error: "week_start must be YYYY-MM-DD" }, { status: 400 });
    if (!b.name) return NextResponse.json({ error: "name required" }, { status: 400 });
    const db = sql();
    const clash = await db`SELECT id FROM sponsor_weeks WHERE week_start=${b.week_start} AND status <> 'cancelled' AND slug <> ${b.slug}`;
    if (clash.length) return NextResponse.json({ error: "that week already has a sponsor" }, { status: 409 });
    const [row] = await db`INSERT INTO sponsor_weeks (slug, name, url, tagline, week_start, price_usd, status)
      VALUES (${b.slug}, ${b.name}, ${b.url}, ${b.tagline ?? null}, ${b.week_start}, ${Number(b.price_usd ?? 50)}, ${b.status ?? "booked"}) RETURNING *`;
    return NextResponse.json({ ok: true, week: row });
  } catch (e) {
    await logError("admin/sponsors", e);
    return NextResponse.json({ error: String((e as Error).message) }, { status: 500 });
  }
}
