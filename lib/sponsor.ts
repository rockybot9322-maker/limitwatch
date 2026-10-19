import { hasDb, sql } from "./db";
export type ActiveSponsor = { slug: string; name: string; url: string; tagline: string | null } | null;
export async function currentSponsor(onDate?: string): Promise<ActiveSponsor> {
  if (!hasDb()) return null;
  const d = onDate ?? new Date().toISOString().slice(0, 10);
  const rows = await sql()`SELECT slug, name, url, tagline FROM sponsor_weeks WHERE status <> 'cancelled' AND week_start <= ${d}::date AND week_start + 7 > ${d}::date ORDER BY week_start DESC LIMIT 1`;
  return (rows[0] as unknown as ActiveSponsor) ?? null;
}
