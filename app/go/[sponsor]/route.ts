import { NextResponse } from "next/server";
import { hasDb, sql, logError } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ sponsor: string }> }) {
  const { sponsor } = await params;
  const fallback = new URL("/sponsor", req.url);
  if (!hasDb()) return NextResponse.redirect(fallback, 302);
  try {
    const rows = await sql()`SELECT url FROM sponsor_weeks WHERE slug = ${sponsor} AND status <> 'cancelled' ORDER BY week_start DESC LIMIT 1`;
    const url = (rows[0] as { url?: string } | undefined)?.url;
    if (!url) return NextResponse.redirect(fallback, 302);
    await sql()`INSERT INTO sponsor_clicks (slug, referer, ua) VALUES (${sponsor}, ${req.headers.get("referer")?.slice(0, 500) ?? null}, ${req.headers.get("user-agent")?.slice(0, 300) ?? null})`;
    return NextResponse.redirect(url, 302);
  } catch (e) {
    await logError("go", e);
    return NextResponse.redirect(fallback, 302);
  }
}
