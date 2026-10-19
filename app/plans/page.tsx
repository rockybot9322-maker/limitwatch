import type { Metadata } from "next";
import Link from "next/link";
import { PLANS, VENDORS } from "@/lib/data";

export const metadata: Metadata = { title: "Current limits by plan" };

export default function Plans() {
  return (
    <>
      <h1>Plans</h1>
      <p className="lede">Current published limits for each plan, with the dated history of how they got there.</p>
      {VENDORS.map((v) => {
        const ps = PLANS.filter((p) => p.vendor === v.slug);
        if (!ps.length) return null;
        return (
          <section key={v.slug}>
            <h2><Link href={`/vendors/${v.slug}`}>{v.name}</Link></h2>
            <div className="grid">
              {ps.map((p) => (
                <Link key={p.slug} href={`/plans/${p.slug}`} className="card" style={{ textDecoration: "none" }}>
                  <b>{p.name}</b><div className="small">{p.price}</div>
                  <div className="small" style={{ marginTop: 4 }}>{p.limits[0]?.[1]}</div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
