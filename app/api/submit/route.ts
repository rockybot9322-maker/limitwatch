import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { hasDb, sql, logError } from "@/lib/db";
import { normalizeEmail, junkReason } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}));
    if (b.website) return NextResponse.json({ message: "Thanks — queued for review." });
    const kind = b.kind === "week_length" ? "week_length" : "limit_change";
    const details = String(b.details ?? "").trim().slice(0, 2000);
    const source = String(b.source_url ?? "").trim().slice(0, 500);
    if (details.length < 10) return NextResponse.json({ error: "Please add a bit more detail." }, { status: 400 });
    if (kind === "limit_change" && !/^https?:\/\//.test(source)) return NextResponse.json({ error: "Please include a source link." }, { status: 400 });
    let hours: number | null = null;
    if (kind === "week_length") {
      hours = Number(b.week_hours);
      if (!Number.isFinite(hours) || hours < 0 || hours > 168) return NextResponse.json({ error: "Hours must be between 0 and 168." }, { status: 400 });
    }
    const email = normalizeEmail(b.email);
    if (email && junkReason(email)) return NextResponse.json({ error: "Please use a real email or leave it blank." }, { status: 400 });
    if (!hasDb()) return NextResponse.json({ error: "Reports are not open yet. Please check back soon." }, { status: 503 });
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
    const ipHash = ip ? createHash("sha256").update(ip + (process.env.ADMIN_TOKEN ?? "")).digest("hex").slice(0, 16) : null;
    await sql()`INSERT INTO submissions (kind, vendor, plan, details, source_url, week_hours, email, ip_hash)
      VALUES (${kind}, ${String(b.vendor ?? "").slice(0, 40) || null}, ${String(b.plan ?? "").slice(0, 60) || null}, ${details}, ${source || null}, ${hours}, ${email || null}, ${ipHash})`;
    return NextResponse.json({ message: "Thanks — queued for review." });
  } catch (e) {
    await logError("submit", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
