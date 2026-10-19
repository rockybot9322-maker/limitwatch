import type { Entry } from "./types";
type Sponsor = { slug: string; name: string; tagline?: string | null } | null;
export function buildWeekly(a: { entries: Entry[]; weekStart: string; weekEnd: string; sponsor: Sponsor; siteUrl: string; vendorName: (s: string) => string }): { subject: string; html: string; text: string; picks: string[] };
export function buildAlert(a: { entry: Entry; sponsor: Sponsor; siteUrl: string; vendorName: (s: string) => string }): { subject: string; html: string; text: string };
