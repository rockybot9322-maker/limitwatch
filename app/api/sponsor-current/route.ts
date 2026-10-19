import { NextResponse } from "next/server";
import { currentSponsor } from "@/lib/sponsor";

export const revalidate = 300;

export async function GET() {
  try {
    const s = await currentSponsor();
    return NextResponse.json({ sponsor: s ? { slug: s.slug, name: s.name, tagline: s.tagline } : null });
  } catch {
    return NextResponse.json({ sponsor: null });
  }
}
