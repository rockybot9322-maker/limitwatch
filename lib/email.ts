const DISPOSABLE = new Set([
  "example.com", "example.org", "example.net", "test.com", "test.org", "testing.com", "mailinator.com", "guerrillamail.com",
  "guerrillamail.net", "sharklasers.com", "grr.la", "10minutemail.com", "tempmail.com", "temp-mail.org", "tempmail.net",
  "yopmail.com", "trashmail.com", "getnada.com", "dispostable.com", "maildrop.cc", "throwawaymail.com", "fakeinbox.com",
  "mailnesia.com", "emailondeck.com", "mintemail.com", "spam4.me", "mailcatch.com", "mohmal.com", "tempr.email",
  "discard.email", "burnermail.io", "33mail.com", "moakt.com", "emailfake.com", "fakemail.net", "mytemp.email",
  "temp-mail.io", "tmpmail.org", "tmail.ws", "inboxkitten.com", "byom.de", "trashmail.de", "wegwerfmail.de", "email.com.test",
  "asdf.com", "qwerty.com", "foo.com", "bar.com", "abc.com", "xyz.com", "domain.com", "email.com", "mail.test",
]);
const BAD_TLDS = [".test", ".invalid", ".example", ".localhost", ".local"];
const JUNK_LOCAL = /^(test\d*|testing|tester|asdf+|qwerty|foo|bar|foobar|abc|abcd|xyz|aaa+|noreply|no-reply|fake|spam|null|none|admin|user|sample|dummy)$/i;

export function normalizeEmail(raw: unknown): string {
  return String(raw ?? "").trim().toLowerCase();
}

/** Returns a reason string when the address should be rejected, or null when it looks real. */
export function junkReason(email: string): string | null {
  if (email.length > 254) return "too long";
  const m = /^([a-z0-9._%+-]+)@([a-z0-9-]+(?:\.[a-z0-9-]+)+)$/.exec(email);
  if (!m) return "invalid";
  const [, local, domain] = m;
  if (DISPOSABLE.has(domain)) return "disposable or placeholder domain";
  if (BAD_TLDS.some((t) => domain.endsWith(t))) return "reserved domain";
  if (JUNK_LOCAL.test(local.split("+")[0])) return "placeholder address";
  if (/^(.)\1{3,}$/.test(local)) return "placeholder address";
  if (/(^|\.)(mailinator|guerrillamail|yopmail|tempmail|trashmail|10minutemail)\./.test(domain + ".")) return "disposable domain";
  return null;
}

const RESEND = "https://api.resend.com";

export async function addResendContact(email: string): Promise<{ ok: boolean; id?: string; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: "RESEND_API_KEY not configured" };
  const seg = process.env.RESEND_SEGMENT_ID;
  const body: Record<string, unknown> = { email, unsubscribed: false };
  if (seg) body.segments = [{ id: seg }];
  const res = await fetch(`${RESEND}/contacts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
  if (res.ok) return { ok: true, id: json.id };
  if (res.status === 409 || /exist/i.test(json.message || "")) return { ok: true };
  return { ok: false, error: json.message || `resend ${res.status}` };
}

export async function sendNotification(subject: string, text: string): Promise<{ sent: number; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  const to = [process.env.OWNER_EMAIL, process.env.BOT_INBOX_EMAIL].filter(Boolean) as string[];
  if (!key || !to.length) return { sent: 0, error: "email notifications not configured" };
  const from = process.env.RESEND_FROM || "LimitWatch <onboarding@resend.dev>";
  let sent = 0, error: string | undefined;
  for (const addr of to) {
    const res = await fetch(`${RESEND}/emails`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [addr], subject, text }),
    });
    if (res.ok) sent++;
    else error = `resend ${res.status}: ${(await res.text()).slice(0, 200)}`;
  }
  return { sent, error };
}
