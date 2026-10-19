import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import EntryCard from "@/components/EntryCard";
import { getEntries, getVendor, PLANS, VENDORS } from "@/lib/data";

export const revalidate = 300;
export function generateStaticParams() { return VENDORS.map((v) => ({ slug: v.slug })); }
type P = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: P }): Promise<Metadata> {
  const v = getVendor((await params).slug);
  return v ? { title: `${v.name} usage limit changes`, description: `Dated, sourced history of ${v.name} plan limit changes.` } : {};
}

export default async function VendorPage({ params }: { params: P }) {
  const { slug } = await params;
  const v = getVendor(slug);
  if (!v) notFound();
  const entries = (await getEntries()).filter((e) => e.vendor === slug);
  const plans = PLANS.filter((p) => p.vendor === slug);
  return (
    <>
      <h1>{v.name}</h1>
      <p className="lede">{entries.length} dated limit changes. Vendor page: <a href={v.url} target="_blank" rel="noopener">{new URL(v.url).hostname}</a></p>
      {plans.length > 0 && <div className="chips">{plans.map((p) => <Link key={p.slug} className="chip" href={`/plans/${p.slug}`}>{p.name}</Link>)}</div>}
      {entries.length ? <ul className="list">{entries.map((e) => <EntryCard key={e.id} e={e} showVendor={false} />)}</ul> : <div className="card">No qualifying changes recorded.</div>}
    </>
  );
}
