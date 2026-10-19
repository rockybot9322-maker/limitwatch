import type { Metadata } from "next";
import { SponsorForm } from "@/components/Forms";
import { getEntries, PLANS, VENDORS, SPONSOR_PRICE } from "@/lib/data";
import { hasDb, sql } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sponsor LimitWatch", description: "One sponsor per week: the Monday newsletter slot plus the site bar, from $50/week." };

async function liveStats() {
  if (!hasDb()) return null;
  try {
    const [s] = await sql()`SELECT (SELECT count(*)::int FROM signups) AS subscribers,
      (SELECT coalesce(sum(views),0)::int FROM pageviews WHERE day > current_date - 30) AS views30`;
    return s as unknown as { subscribers: number; views30: number };
  } catch { return null; }
}

export default async function Sponsor() {
  const entries = await getEntries();
  const s = await liveStats();
  return (
    <>
      <h1>Sponsor LimitWatch</h1>
      <p className="lede">One sponsor per week. You get the “Sponsored by” line in the Monday email and the bar across the top of every page. Starting at <b>${SPONSOR_PRICE}/week</b>.</p>
      <div className="stats">
        <div className="stat"><b>{entries.length}</b><span>dated, sourced changes</span></div>
        <div className="stat"><b>{PLANS.length}</b><span>plans tracked across {VENDORS.length} vendors</span></div>
        <div className="stat"><b>{s ? s.subscribers : "—"}</b><span>newsletter subscribers{s ? "" : " (not tracked yet)"}</span></div>
        <div className="stat"><b>{s ? s.views30 : "—"}</b><span>page views, last 30 days{s ? "" : " (not tracked yet)"}</span></div>
      </div>
      <p className="small">Numbers are live counts from our own database, not estimates. Sponsor links go through a click-logging redirect so you get a real click count at the end of your week.</p>
      <h2>What you get</h2>
      <ul>
        <li>“Sponsored by” line with your link in the Monday issue (and any same-day alerts that week)</li>
        <li>The closable bar at the top of every LimitWatch page for 7 days</li>
        <li>A click report at the end of the week</li>
      </ul>
      <h2>Get in touch</h2>
      <SponsorForm />
    </>
  );
}
