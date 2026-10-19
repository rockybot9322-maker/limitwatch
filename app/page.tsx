import Link from "next/link";
import EntryCard from "@/components/EntryCard";
import SignupForm from "@/components/SignupForm";
import { getEntries, VENDORS } from "@/lib/data";

export const revalidate = 300;

export default async function Home() {
  const entries = await getEntries();
  const latest = entries.slice(0, 8);
  return (
    <>
      <h1>AI coding plan limits, dated.</h1>
      <p className="lede">Every change to usage limits on Claude Code, Cursor, Copilot, Codex, Windsurf, Gemini and more — newest first, each with a source. {entries.length} changes tracked.</p>
      <form className="search" action="/changes">
        <input name="q" placeholder="Search changes, e.g. weekly limit, Pro+, credits" aria-label="Search changes" />
        <button className="btn">Search</button>
      </form>
      <div className="chips">
        {VENDORS.map((v) => <Link key={v.slug} className="chip" href={`/vendors/${v.slug}`}>{v.name.split(" (")[0]}</Link>)}
      </div>
      <h2 style={{ marginTop: 12 }}>Latest limit changes</h2>
      <ul className="list">{latest.map((e) => <EntryCard key={e.id} e={e} />)}</ul>
      <p><Link className="btn" href="/changes">See all {entries.length} changes →</Link></p>
      <SignupForm source="home" />
    </>
  );
}
