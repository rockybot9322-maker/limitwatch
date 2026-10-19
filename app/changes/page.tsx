import type { Metadata } from "next";
import Link from "next/link";
import EntryCard from "@/components/EntryCard";
import { getEntries, searchEntries, VENDORS, vendorName } from "@/lib/data";
import { hasDb, sql, logError } from "@/lib/db";

export const dynamic = "force-dynamic";

type SP = Promise<{ q?: string; vendor?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const { vendor } = await searchParams;
  return { title: vendor ? `${vendorName(vendor)} limit change log` : "Full change log", alternates: { canonical: "/changes" } };
}

export default async function Changes({ searchParams }: { searchParams: SP }) {
  const { q = "", vendor = "" } = await searchParams;
  const all = await getEntries();
  const list = searchEntries(all, q, vendor || undefined);
  if (q.trim() && list.length === 0 && hasDb()) {
    try { await sql()`INSERT INTO zero_result_searches (query, vendor) VALUES (${q.trim().slice(0, 200)}, ${vendor || null})`; } catch (e) { await logError("zero_search", e); }
  }
  const qs = (v: string) => { const p = new URLSearchParams(); if (q) p.set("q", q); if (v) p.set("vendor", v); const s = p.toString(); return `/changes${s ? `?${s}` : ""}`; };
  return (
    <>
      <h1>Change log</h1>
      <p className="lede">{list.length} of {all.length} dated changes{vendor ? ` for ${vendorName(vendor)}` : ""}{q ? ` matching “${q}”` : ""}. Newest first.</p>
      <form className="search" action="/changes">
        {vendor && <input type="hidden" name="vendor" value={vendor} />}
        <input name="q" defaultValue={q} placeholder="Search changes" aria-label="Search changes" />
        <button className="btn">Search</button>
      </form>
      <div className="chips">
        <Link className={`chip ${!vendor ? "on" : ""}`} href={qs("")}>All vendors</Link>
        {VENDORS.map((v) => <Link key={v.slug} className={`chip ${vendor === v.slug ? "on" : ""}`} href={qs(v.slug)}>{v.name.split(" (")[0]}</Link>)}
      </div>
      {list.length === 0 ? (
        <div className="card">No changes match. Know of one? <Link href="/submit">Report it</Link>.</div>
      ) : (
        <ul className="list">{list.map((e) => <EntryCard key={e.id} e={e} />)}</ul>
      )}
    </>
  );
}
