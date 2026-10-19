import Link from "next/link";
import type { Entry } from "@/lib/types";
import { DIRECTION_LABEL, fmtDate, vendorName, getPlan } from "@/lib/data";

export default function EntryCard({ e, showVendor = true }: { e: Entry; showVendor?: boolean }) {
  return (
    <li className="entry" id={e.id}>
      <div className="meta">
        <time dateTime={e.date}><b>{fmtDate(e.date)}</b></time>
        {showVendor && <Link href={`/vendors/${e.vendor}`}>{vendorName(e.vendor)}</Link>}
        <span className={`dir ${e.direction}`}>{DIRECTION_LABEL[e.direction] ?? e.direction}</span>
        {e.status === "scheduled" && <span className="sched">Scheduled</span>}
      </div>
      <h3>{e.title}</h3>
      <p>{e.summary}</p>
      {(e.before || e.after) && (
        <div className="ba">
          {e.before && <div><b>Before:</b> {e.before}</div>}
          {e.after && <div><b>After:</b> {e.after}</div>}
        </div>
      )}
      {e.vendor_framing && <p className="small">Vendor’s framing: {e.vendor_framing}</p>}
      <div className="src">
        Source: <a href={e.source_url} target="_blank" rel="noopener">{e.source_name || new URL(e.source_url).hostname}</a>
        {e.announced ? <> · Announced: {e.announced}</> : null}
        {e.plans.length > 0 && <> · Plans: {e.plans.map((p, i) => (<span key={p}>{i ? ", " : ""}<Link href={`/plans/${p}`}>{getPlan(p)?.name ?? p}</Link></span>))}</>}
      </div>
    </li>
  );
}
