import type { Metadata } from "next";
import { SubmitForm } from "@/components/Forms";
import { PLANS, VENDORS } from "@/lib/data";

export const metadata: Metadata = { title: "Report a limit change", description: "Tell LimitWatch about a usage-limit change or how long your usage week really lasted." };

export default function Submit() {
  return (
    <>
      <h1>Report a change</h1>
      <p className="lede">Saw a limit move, or want to log how long your usage week actually lasted? Send it in — we check every report against a source before it goes live.</p>
      <SubmitForm vendors={VENDORS.map(({ slug, name }) => ({ slug, name }))} plans={PLANS.map(({ slug, name, vendor }) => ({ slug, name, vendor }))} />
    </>
  );
}
