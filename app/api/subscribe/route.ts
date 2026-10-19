import { NextResponse } from "next/server";
import { junkReason, normalizeEmail, addResendContact } from "@/lib/email";
import { hasDb, sql, logError } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    if (body.website) return NextResponse.json({ message: "Subscribed." });
    const email = normalizeEmail(body.email);
    const reason = junkReason(email);
    if (reason) return NextResponse.json({ error: reason === "invalid" ? "That doesn’t look like a valid email." : "Please use a real, permanent email address." }, { status: 400 });
    const r = await addResendContact(email);
    if (!r.ok) {
      await logError("subscribe", new Error(r.error));
      return NextResponse.json({ error: "Signup is not available right now. Please try again later." }, { status: 503 });
    }
    if (hasDb()) {
      await sql()`INSERT INTO signups (email, source, resend_contact_id) VALUES (${email}, ${String(body.source ?? "site").slice(0, 60)}, ${r.id ?? null}) ON CONFLICT (email) DO NOTHING`;
    }
    return NextResponse.json({ message: "You’re in. First issue arrives Monday morning." });
  } catch (e) {
    await logError("subscribe", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
