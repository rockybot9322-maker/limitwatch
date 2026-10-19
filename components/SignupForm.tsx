"use client";
import { useState } from "react";

export default function SignupForm({ source = "site" }: { source?: string }) {
  const [state, setState] = useState<{ ok?: boolean; msg?: string; busy?: boolean }>({});
  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    setState({ busy: true });
    const res = await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: fd.get("email"), website: fd.get("website"), source }) });
    const d = await res.json().catch(() => ({}));
    setState({ ok: res.ok, msg: d.message || d.error || (res.ok ? "Subscribed." : "Something went wrong.") });
  }
  return (
    <div className="signup">
      <b>Monday email: what changed this week, by vendor.</b>
      <div className="small" style={{ margin: "2px 0 8px" }}>Five lines, every one linked to its source. Same-day alerts for big changes. Unsubscribe anytime.</div>
      <form onSubmit={onSubmit}>
        <input type="email" name="email" required placeholder="you@company.com" aria-label="Email address" autoComplete="email" />
        <input className="hp" tabIndex={-1} name="website" aria-hidden="true" autoComplete="off" />
        <button className="btn" disabled={state.busy}>{state.busy ? "…" : "Subscribe"}</button>
      </form>
      {state.msg && <div className={`msg ${state.ok ? "ok" : "err"}`}>{state.msg}</div>}
    </div>
  );
}
