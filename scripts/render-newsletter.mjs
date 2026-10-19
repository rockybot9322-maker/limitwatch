// Renders a sample weekly issue from the real seed entries: node scripts/render-newsletter.mjs [weekEnd] [outFile]
import { readFileSync, writeFileSync } from "fs";
import { buildWeekly } from "../lib/newsletter.mjs";
const entries = JSON.parse(readFileSync(new URL("../data/entries.json", import.meta.url)));
const vendors = JSON.parse(readFileSync(new URL("../data/vendors.json", import.meta.url)));
const vendorName = (s) => vendors.find((v) => v.slug === s)?.name ?? s;
const end = process.argv[2] || "2026-10-18";
const start = new Date(new Date(end + "T00:00:00Z").getTime() - 6 * 86400000).toISOString().slice(0, 10);
const siteUrl = process.env.SITE_URL || "https://limitwatch.vercel.app";
const out = buildWeekly({ entries, weekStart: start, weekEnd: end, sponsor: null, siteUrl, vendorName });
const file = process.argv[3] || "newsletter-sample.html";
writeFileSync(file, out.html.replace("{{{RESEND_UNSUBSCRIBE_URL}}}", "#unsubscribe-handled-by-resend"));
console.log(out.subject, "->", file, out.picks);
