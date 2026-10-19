import { NextResponse } from "next/server";
import { isAdmin, unauthorized, noDb } from "@/lib/admin";
import { hasDb, sql } from "@/lib/db";
import { SEED_ENTRIES } from "@/lib/data";
import { SCHEMA } from "@/lib/schema";

export const dynamic = "force-dynamic";

/** POST /api/admin/migrate — create tables (idempotent) and upsert the seed entries. */
export async function POST(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  if (!hasDb()) return noDb();
  const db = sql();
  await db.unsafe(SCHEMA);
  let n = 0;
  for (const e of SEED_ENTRIES) {
    await db`INSERT INTO entries (id, date, vendor, plans, title, summary, before, after, announced, vendor_framing, direction, status, source_url, source_name, via_url, verified)
      VALUES (${e.id}, ${e.date}, ${e.vendor}, ${e.plans}, ${e.title}, ${e.summary}, ${e.before ?? null}, ${e.after ?? null}, ${e.announced ?? null}, ${e.vendor_framing ?? null}, ${e.direction}, ${e.status}, ${e.source_url}, ${e.source_name ?? null}, ${e.via_url ?? null}, ${e.verified})
      ON CONFLICT (id) DO NOTHING`;
    n++;
  }
  return NextResponse.json({ ok: true, seeded: n });
}
