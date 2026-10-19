import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import SponsorBar from "@/components/SponsorBar";
import PageView from "@/components/PageView";
import { SITE_URL } from "@/lib/data";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "LimitWatch — dated tracker of AI coding plan limits", template: "%s · LimitWatch" },
  description: "Every usage-limit and pricing change to AI coding plans — Claude Code, Cursor, GitHub Copilot, Codex, Windsurf, Gemini and more — dated, with a source link.",
  openGraph: { type: "website", siteName: "LimitWatch", title: "LimitWatch — AI coding plan limits, dated and sourced" },
  twitter: { card: "summary_large_image" },
  robots: process.env.VERCEL_ENV === "production" ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ffffff" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SponsorBar />
        <header className="site">
          <div className="wrap">
            <Link href="/" className="logo">Limit<span>Watch</span></Link>
            <nav className="main">
              <Link href="/changes">Change log</Link>
              <Link href="/plans">Plans</Link>
              <Link href="/submit">Report</Link>
              <Link href="/sponsor">Sponsor</Link>
            </nav>
          </div>
        </header>
        <main className="wrap">{children}</main>
        <footer className="site">
          <div className="wrap">
            LimitWatch tracks published usage limits on AI coding plans. Every entry has a date and a source; vendor framing is quoted, not endorsed.
            {" "}<Link href="/submit">Report a change</Link> · <Link href="/sponsor">Sponsor</Link> · <Link href="/changes">All changes</Link>
          </div>
        </footer>
        <PageView />
      </body>
    </html>
  );
}
