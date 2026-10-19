import { NextResponse } from "next/server";
import { hasDb, sql } from "@/lib/db";

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse/i;

export async function POST(req: Request) {
  if (!hasDb() || BOT.test(req.headers.get("user-agent") || "")) return new NextResponse(null, { status: 204 });
  try {
    const b = await req.json().catch(() => ({}));
    const path = String(b.path ?? "/").split("?")[0].slice(0, 200);
    if (!path.startsWith("/")) return new NextResponse(null, { status: 204 });
    await sql()`INSERT INTO pageviews (day, path, views) VALUES (current_date, ${path}, 1) ON CONFLICT (day, path) DO UPDATE SET views = pageviews.views + 1`;
  } catch {}
  return new NextResponse(null, { status: 204 });
}
