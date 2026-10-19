import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import EntryCard from "@/components/EntryCard";
import SignupForm from "@/components/SignupForm";
import { getEntries, getPlan, PLANS, vendorName, fmtDate } from "@/lib/data";
import { hasDb, sql } from "@/lib/db";

export const revalidate = 300;
export function generateStaticParams() { return PLANS.map((p) => ({ slug: p.slug })); }

type P = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: P }): Promise<Metadata> {
  const p = getPlan((await params).slug);
  if (!p) return {};
  return { title: `${p.name} usage limits and change history`, description: `Current ${p.name} limits (${p.price}) and every dated change, with sources.` };
}

async function weekReports(slug: string) {
  if (!hasDb()) return null;
  try {
    const r = await sql()`SELECT count(*)::int AS n, percentile_cont(0.5) WITHIN GROUP (ORDER BY week_hours) AS median FROM submissions WHERE kind='week_length' AND status='approved' AND plan=${slug}`;
    return r[0] as unknown as { n: number; median: number | null };
  } catch { return null; }
}

export default async function PlanPage({ params }: { params: P }) {
  const { slug } = await params;
  const plan = getPlan(slug);
  if (!plan) notFound();
  const entries = (await getEntries()).filter((e) => e.plans.includes(slug));
  const wr = await weekReports(slug);
  return (
    <>
      <div className="small" style={{ marginTop: 16 }}><Link href="/plans">Plans</Link> / <Link href={`/vendors/${plan.vendor}`}>{vendorName(plan.vendor)}</Link></div>
      <h1>{plan.name}</h1>
      <p className="lede">{plan.price}</p>
      <div className="card">
        <b>Current limits</b>
        <table className="limits"><tbody>{plan.limits.map(([k, v]) => <tr key={k}><td>{k}</td><td>{v}</td></tr>)}</tbody></table>
        {plan.notes && <p className="small">{plan.notes}</p>}
        <div className="small">Source: <a href={plan.source_url} target="_blank" rel="noopener">{new URL(plan.source_url).hostname}</a> · checked {fmtDate(plan.checked)}</div>
      </div>
      <div className="card">
        <b>How long does the week actually last?</b>
        <p className="small" style={{ margin: "4px 0" }}>
          {wr && wr.n > 0 ? <>From {wr.n} reader report{wr.n === 1 ? "" : "s"}: median {Math.round(Number(wr.median))} hours before hitting the weekly limit.</> : <>No reader reports yet for this plan.</>}
          {" "}<Link href="/submit">Add yours</Link>.
        </p>
      </div>
      <h2>Change history ({entries.length})</h2>
      {entries.length ? <ul className="list">{entries.map((e) => <EntryCard key={e.id} e={e} showVendor={false} />)}</ul> : <p className="small">No dated changes recorded for this plan yet.</p>}
      <SignupForm source={`plan:${slug}`} />
    </>
  );
}
