import { NextResponse } from "next/server";
import { isAdmin, unauthorized, noDb } from "@/lib/admin";
import { hasDb, sql } from "@/lib/db";
import { getEntries, PLANS } from "@/lib/data";

export const dynamic = "force-dynamic";

/** GET /api/admin/stats?days=30 */
export async function GET(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  if (!hasDb()) return noDb();
  const days = Math.min(365, Math.max(1, Number(new URL(req.url).searchParams.get("days") || 30)));
  const db = sql();
  const [totals] = await db`SELECT
    (SELECT count(*)::int FROM signups) AS signups_total,
    (SELECT count(*)::int FROM signups WHERE created_at > now() - make_interval(days => ${days})) AS signups_period,
    (SELECT coalesce(sum(views),0)::int FROM pageviews WHERE day > current_date - ${days}::int) AS pageviews_period,
    (SELECT count(*)::int FROM submissions WHERE status='pending') AS queue_pending,
    (SELECT count(*)::int FROM sponsor_clicks WHERE created_at > now() - make_interval(days => ${days})) AS sponsor_clicks_period,
    (SELECT count(*)::int FROM sponsor_inquiries WHERE created_at > now() - make_interval(days => ${days})) AS sponsor_inquiries_period,
    (SELECT count(*)::int FROM zero_result_searches WHERE created_at > now() - make_interval(days => ${days})) AS zero_searches_period,
    (SELECT count(*)::int FROM errors WHERE created_at > now() - make_interval(days => ${days})) AS errors_period`;
  const daily = await db`SELECT to_char(day,'YYYY-MM-DD') AS day, sum(views)::int AS views FROM pageviews WHERE day > current_date - ${days}::int GROUP BY day ORDER BY day`;
  const topPaths = await db`SELECT path, sum(views)::int AS views FROM pageviews WHERE day > current_date - ${days}::int GROUP BY path ORDER BY views DESC LIMIT 20`;
  const errors = await db`SELECT route, message, created_at FROM errors ORDER BY created_at DESC LIMIT 20`;
  const entries = await getEntries();
  return NextResponse.json({ days, entries: entries.length, plans: PLANS.length, latest_entry: entries[0]?.date ?? null, ...totals, daily, top_paths: topPaths, recent_errors: errors });
}
