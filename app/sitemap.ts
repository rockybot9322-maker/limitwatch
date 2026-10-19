import type { MetadataRoute } from "next";
import { PLANS, VENDORS, SITE_URL, SEED_ENTRIES } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const latest = SEED_ENTRIES.reduce((m, e) => (e.date > m ? e.date : m), "2026-01-01");
  const u = (p: string, priority = 0.6) => ({ url: `${SITE_URL}${p}`, lastModified: latest, changeFrequency: "daily" as const, priority });
  return [u("/", 1), u("/changes", 0.9), u("/plans", 0.8), u("/submit", 0.4), u("/sponsor", 0.4),
    ...PLANS.map((p) => u(`/plans/${p.slug}`, 0.7)), ...VENDORS.map((v) => u(`/vendors/${v.slug}`, 0.6))];
}
