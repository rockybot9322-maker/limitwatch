import { NextResponse } from "next/server";
import { isAdmin, unauthorized, noDb } from "@/lib/admin";
import { hasDb, sql } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET /api/admin/searches?days=30 — zero-result searches grouped by query. */
export async function GET(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  if (!hasDb()) return noDb();
  const days = Math.min(365, Math.max(1, Number(new URL(req.url).searchParams.get("days") || 30)));
  const rows = await sql()`SELECT lower(query) AS query, count(*)::int AS times, max(created_at) AS last_seen FROM zero_result_searches
    WHERE created_at > now() - make_interval(days => ${days}) GROUP BY lower(query) ORDER BY times DESC, last_seen DESC LIMIT 100`;
  return NextResponse.json({ days, items: rows });
}
