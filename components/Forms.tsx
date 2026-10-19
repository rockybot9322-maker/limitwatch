"use client";
import { useState } from "react";

function useSubmit(url: string) {
  const [state, setState] = useState<{ ok?: boolean; msg?: string; busy?: boolean }>({});
  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState({ busy: true });
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const d = await res.json().catch(() => ({}));
    setState({ ok: res.ok, msg: d.message || d.error || (res.ok ? "Thanks!" : "Something went wrong.") });
    if (res.ok) form.reset();
  }
  return { state, onSubmit };
}

export function SubmitForm({ vendors, plans }: { vendors: { slug: string; name: string }[]; plans: { slug: string; name: string; vendor: string }[] }) {
  const { state, onSubmit } = useSubmit("/api/submit");
  const [kind, setKind] = useState("limit_change");
  return (
    <form className="stack card" onSubmit={onSubmit}>
      <label>What are you reporting?
        <select name="kind" value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="limit_change">A limit or pricing change</option>
          <option value="week_length">How long my usage week actually lasted</option>
        </select>
      </label>
      <label>Vendor
        <select name="vendor" required defaultValue="">
          <option value="" disabled>Choose…</option>
          {vendors.map((v) => <option key={v.slug} value={v.slug}>{v.name}</option>)}
          <option value="other">Other</option>
        </select>
      </label>
      <label>Plan
        <select name="plan" defaultValue="">
          <option value="">Not sure / other</option>
          {plans.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
        </select>
      </label>
      {kind === "week_length" && (
        <label>Hours until you hit the weekly limit (from the start of your usage week)
          <input name="week_hours" type="number" min="0" max="168" step="0.5" required placeholder="e.g. 52" />
        </label>
      )}
      <label>{kind === "week_length" ? "What were you doing? (model, kind of work)" : "What changed?"}
        <textarea name="details" required rows={4} maxLength={2000} />
      </label>
      <label>Source link {kind === "limit_change" ? "(vendor page, changelog, post)" : "(optional)"}
        <input name="source_url" type="url" required={kind === "limit_change"} placeholder="https://" />
      </label>
      <label>Your email (optional, only if we need to ask)
        <input name="email" type="email" autoComplete="email" />
      </label>
      <input className="hp" tabIndex={-1} name="website" aria-hidden="true" autoComplete="off" />
      <button className="btn" disabled={state.busy}>{state.busy ? "Sending…" : "Send for review"}</button>
      {state.msg && <div className={`msg ${state.ok ? "ok" : "err"}`}>{state.msg}</div>}
      <div className="small">Reports go to a review queue. Nothing is published until it is checked against a source.</div>
    </form>
  );
}

export function SponsorForm() {
  const { state, onSubmit } = useSubmit("/api/sponsor-inquiry");
  return (
    <form className="stack card" onSubmit={onSubmit}>
      <label>Name<input name="name" required maxLength={120} autoComplete="name" /></label>
      <label>Work email<input name="email" type="email" required autoComplete="email" /></label>
      <label>Company / product<input name="company" maxLength={160} /></label>
      <label>Message (which week, what you want to promote)<textarea name="message" rows={4} maxLength={2000} /></label>
      <input className="hp" tabIndex={-1} name="website" aria-hidden="true" autoComplete="off" />
      <button className="btn" disabled={state.busy}>{state.busy ? "Sending…" : "Get in touch"}</button>
      {state.msg && <div className={`msg ${state.ok ? "ok" : "err"}`}>{state.msg}</div>}
    </form>
  );
}
