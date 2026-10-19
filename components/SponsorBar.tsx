"use client";
import { useEffect, useState } from "react";

type S = { slug: string; name: string; tagline?: string | null } | null;

export default function SponsorBar() {
  const [sponsor, setSponsor] = useState<S>(null);
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    const key = "lw_bar_closed";
    const closed = localStorage.getItem(key);
    fetch("/api/sponsor-current").then((r) => r.json()).then((d) => {
      const s: S = d?.sponsor ?? null;
      setSponsor(s);
      setHidden(closed === (s?.slug ?? "open"));
    }).catch(() => setHidden(closed === "open"));
  }, []);
  if (hidden) return null;
  const close = () => { localStorage.setItem("lw_bar_closed", sponsor?.slug ?? "open"); setHidden(true); };
  return (
    <div className="sbar" role="complementary" aria-label="Sponsor">
      <div className="wrap">
        {sponsor ? (
          <span>Sponsored by <a href={`/go/${sponsor.slug}`} rel="sponsored noopener"><b>{sponsor.name}</b></a>{sponsor.tagline ? ` — ${sponsor.tagline}` : ""}</span>
        ) : (
          <span>Reach developers watching their AI plan limits. <a href="/sponsor"><b>Sponsor LimitWatch</b></a> from $50/week.</span>
        )}
        <button onClick={close} aria-label="Close sponsor bar">×</button>
      </div>
    </div>
  );
}
