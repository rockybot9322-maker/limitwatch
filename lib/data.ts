import entriesJson from "@/data/entries.json";
import plansJson from "@/data/plans.json";
import vendorsJson from "@/data/vendors.json";
import { hasDb, sql, logError } from "./db";
import type { Entry, Plan, Vendor } from "./types";

export const SEED_ENTRIES = entriesJson as unknown as Entry[];
export const PLANS = plansJson as unknown as Plan[];
export const VENDORS = vendorsJson as Vendor[];

export const vendorName = (slug: string) => VENDORS.find((v) => v.slug === slug)?.name ?? slug;
export const getPlan = (slug: string) => PLANS.find((p) => p.slug === slug);
export const getVendor = (slug: string) => VENDORS.find((v) => v.slug === slug);

function sortEntries(list: Entry[]) {
  return [...list].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id < b.id ? 1 : -1));
}

/** All published entries: seed file plus approved entries stored in Postgres. */
export async function getEntries(): Promise<Entry[]> {
  if (!hasDb()) return sortEntries(SEED_ENTRIES);
  try {
    const rows = await sql()`SELECT id, to_char(date, 'YYYY-MM-DD') AS date, vendor, plans, title, summary, before, after, announced, vendor_framing, direction, status, source_url, source_name, via_url, verified FROM entries`;
    const byId = new Map<string, Entry>();
    for (const e of SEED_ENTRIES) byId.set(e.id, e);
    for (const r of rows as unknown as Entry[]) byId.set(r.id, r);
    return sortEntries([...byId.values()]);
  } catch (err) {
    await logError("getEntries", err);
    return sortEntries(SEED_ENTRIES);
  }
}

export function searchEntries(list: Entry[], q?: string, vendor?: string) {
  const terms = (q ?? "").toLowerCase().split(/\s+/).filter(Boolean);
  return list.filter((e) => {
    if (vendor && e.vendor !== vendor) return false;
    if (!terms.length) return true;
    const hay = [e.title, e.summary, e.before, e.after, e.vendor, vendorName(e.vendor), e.plans.join(" "), e.vendor_framing].join(" ").toLowerCase();
    return terms.every((t) => hay.includes(t));
  });
}

export const DIRECTION_LABEL: Record<string, string> = {
  increase: "Increase",
  decrease: "Decrease",
  neutral: "Neutral",
  "unit-change": "Unit change",
  "not-established": "Not established",
  "no-change": "No change in practice",
};

export function fmtDate(iso: string) {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")).replace(/\/$/, "");
export const SPONSOR_PRICE = 50;
