import { NextResponse } from "next/server";
import { isAdmin, unauthorized, noDb } from "@/lib/admin";
import { hasDb, sql } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET /api/admin/queue?status=pending — submissions awaiting review. */
export async function GET(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  if (!hasDb()) return noDb();
  const status = new URL(req.url).searchParams.get("status") || "pending";
  const rows = await sql()`SELECT id, kind, vendor, plan, details, source_url, week_hours, email, status, entry_id, created_at FROM submissions WHERE status = ${status} ORDER BY created_at ASC LIMIT 200`;
  return NextResponse.json({ count: rows.length, items: rows });
}
