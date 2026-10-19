// LimitWatch email templates. Plain JS so both the Next app and node scripts can use them.
// Broadcast HTML includes {{{RESEND_UNSUBSCRIBE_URL}}} so Resend handles unsubscribes.

const DIR = {
  increase: ["▲ Increase", "#0a7d38"],
  decrease: ["▼ Decrease", "#b42318"],
  neutral: ["● Neutral", "#555"],
  "unit-change": ["⇄ Unit change", "#7a4cc2"],
  "not-established": ["? Not established", "#8a6100"],
  "no-change": ["● No change in practice", "#555"],
};

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fmt = (iso) => new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

function line(e, siteUrl, vendorName) {
  const [label, color] = DIR[e.direction] || DIR.neutral;
  const url = `${siteUrl}/changes#${e.id}`;
  return `<tr><td style="padding:10px 0;border-bottom:1px solid #eee;font:15px/1.45 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111">
  <span style="color:#666;font-size:13px">${esc(fmt(e.date))} · ${esc(vendorName(e.vendor))}</span>
  <span style="color:${color};font-size:12px;font-weight:600;margin-left:6px">${label}</span><br>
  <a href="${esc(url)}" style="color:#111;font-weight:600;text-decoration:none">${esc(e.title)}</a>
  <a href="${esc(e.source_url)}" style="color:#666;font-size:13px;margin-left:4px">source ↗</a></td></tr>`;
}

function sponsorLine(sponsor, siteUrl) {
  if (sponsor) {
    return `Sponsored by <a href="${esc(`${siteUrl}/go/${sponsor.slug}`)}" style="color:#111;font-weight:600">${esc(sponsor.name)}</a>${sponsor.tagline ? ` — ${esc(sponsor.tagline)}` : ""}`;
  }
  return `Sponsored by: <a href="${esc(`${siteUrl}/sponsor`)}" style="color:#111;font-weight:600">this slot is open — one sponsor per week from $50</a>`;
}

function shell({ title, preheader, body, siteUrl }) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;background:#f4f4f2">
<span style="display:none;max-height:0;overflow:hidden">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f2"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:10px;padding:24px">
<tr><td style="font:700 20px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111;padding-bottom:4px"><a href="${esc(siteUrl)}" style="color:#111;text-decoration:none">LimitWatch</a></td></tr>
${body}
<tr><td style="padding-top:20px;font:12px/1.5 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#888">
Every entry links to its source. Spot a change we missed? <a href="${esc(siteUrl)}/submit" style="color:#888">Report it</a>.<br>
<a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#888">Unsubscribe</a></td></tr>
</table></td></tr></table></body></html>`;
}

/**
 * Weekly Monday issue: up to 5 picks, one line each. Entries from the week come first;
 * if fewer than 5, recent earlier entries fill the rest under an "Earlier" label.
 */
export function buildWeekly({ entries, weekStart, weekEnd, sponsor, siteUrl, vendorName }) {
  const sorted = [...entries].sort((a, b) => (a.date < b.date ? 1 : -1));
  const inWeek = sorted.filter((e) => e.date >= weekStart && e.date <= weekEnd).slice(0, 5);
  const earlier = sorted.filter((e) => e.date < weekStart).slice(0, Math.max(0, 5 - inWeek.length));
  const label = `${fmt(weekStart)}–${fmt(weekEnd)}`;
  const subject = inWeek.length
    ? `LimitWatch: ${inWeek.length} limit change${inWeek.length === 1 ? "" : "s"} this week (${label})`
    : `LimitWatch: no new limit changes this week (${label})`;
  const head = (t) => `<tr><td style="padding:16px 0 2px;font:700 13px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:#666">${t}</td></tr>`;
  let body = `<tr><td style="font:15px/1.5 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#333">What changed in AI coding plan limits, ${esc(label)}.</td></tr>`;
  body += `<tr><td style="padding:12px;margin-top:8px;background:#fafaf7;border:1px solid #eee;border-radius:8px;font:14px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#333">${sponsorLine(sponsor, siteUrl)}</td></tr>`;
  body += head(`This week (${inWeek.length})`);
  body += inWeek.length ? inWeek.map((e) => line(e, siteUrl, vendorName)).join("") : `<tr><td style="padding:8px 0;color:#666;font:14px sans-serif">No dated limit changes this week.</td></tr>`;
  if (earlier.length) {
    body += head("Earlier, still worth knowing");
    body += earlier.map((e) => line(e, siteUrl, vendorName)).join("");
  }
  body += `<tr><td style="padding-top:16px;font:14px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif"><a href="${esc(siteUrl)}/changes" style="color:#111;font-weight:600">Full change log →</a></td></tr>`;
  const text = [
    `LimitWatch — ${label}`, "",
    sponsor ? `Sponsored by ${sponsor.name}: ${siteUrl}/go/${sponsor.slug}` : `Sponsored by: this slot is open — ${siteUrl}/sponsor`, "",
    `This week (${inWeek.length}):`,
    ...inWeek.map((e) => `- ${fmt(e.date)} ${vendorName(e.vendor)}: ${e.title} — ${siteUrl}/changes#${e.id}`),
    ...(earlier.length ? ["", "Earlier:", ...earlier.map((e) => `- ${fmt(e.date)} ${vendorName(e.vendor)}: ${e.title} — ${siteUrl}/changes#${e.id}`)] : []),
    "", `Unsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}`,
  ].join("\n");
  return { subject, html: shell({ title: subject, preheader: inWeek.map((e) => e.title).join(" · ") || "No changes this week", body, siteUrl }), text, picks: [...inWeek, ...earlier].map((e) => e.id) };
}

/** Same-day alert for a single big change. */
export function buildAlert({ entry, sponsor, siteUrl, vendorName }) {
  const [label, color] = DIR[entry.direction] || DIR.neutral;
  const subject = `Limit alert: ${entry.title}`;
  const row = (k, v) => (v ? `<tr><td style="padding:6px 0;font:14px/1.45 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#333"><b>${k}:</b> ${esc(v)}</td></tr>` : "");
  const body = `<tr><td style="padding:8px 0;font:700 13px sans-serif;color:${color}">${label} · ${esc(vendorName(entry.vendor))} · ${esc(fmt(entry.date))}</td></tr>
<tr><td style="font:700 18px/1.3 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111">${esc(entry.title)}</td></tr>
<tr><td style="padding:8px 0;font:15px/1.5 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#333">${esc(entry.summary)}</td></tr>
${row("Before", entry.before)}${row("After", entry.after)}${row("Vendor’s framing", entry.vendor_framing)}
<tr><td style="padding:12px 0;font:14px sans-serif"><a href="${esc(entry.source_url)}" style="color:#111;font-weight:600">Read the source ↗</a> · <a href="${esc(siteUrl)}/changes#${esc(entry.id)}" style="color:#111">On LimitWatch</a></td></tr>
<tr><td style="padding:12px;background:#fafaf7;border:1px solid #eee;border-radius:8px;font:14px sans-serif;color:#333">${sponsorLine(sponsor, siteUrl)}</td></tr>`;
  const text = `${subject}\n\n${entry.summary}\nBefore: ${entry.before || "-"}\nAfter: ${entry.after || "-"}\nSource: ${entry.source_url}\n${siteUrl}/changes#${entry.id}\n\nUnsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}`;
  return { subject, html: shell({ title: subject, preheader: entry.summary, body, siteUrl }), text };
}
