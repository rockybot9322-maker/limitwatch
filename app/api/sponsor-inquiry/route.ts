import { NextResponse } from "next/server";
import { hasDb, sql, logError } from "@/lib/db";
import { normalizeEmail, junkReason, sendNotification } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}));
    if (b.website) return NextResponse.json({ message: "Thanks — we’ll reply soon." });
    const email = normalizeEmail(b.email);
    if (junkReason(email)) return NextResponse.json({ error: "Please use a real work email." }, { status: 400 });
    const name = String(b.name ?? "").trim().slice(0, 120);
    const company = String(b.company ?? "").trim().slice(0, 160);
    const message = String(b.message ?? "").trim().slice(0, 2000);
    let saved = false;
    if (hasDb()) {
      await sql()`INSERT INTO sponsor_inquiries (name, email, company, message) VALUES (${name}, ${email}, ${company}, ${message})`;
      saved = true;
    }
    const n = await sendNotification(`LimitWatch sponsor inquiry: ${company || name || email}`, `Name: ${name}\nEmail: ${email}\nCompany: ${company}\n\n${message}`);
    if (n.error) await logError("sponsor-inquiry-email", new Error(n.error));
    if (!saved && n.sent === 0) return NextResponse.json({ error: "Inquiries are not open yet. Please check back soon." }, { status: 503 });
    return NextResponse.json({ message: "Thanks — we’ll reply soon." });
  } catch (e) {
    await logError("sponsor-inquiry", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
