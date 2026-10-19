import { ImageResponse } from "next/og";
import { SEED_ENTRIES } from "@/lib/data";

export const alt = "LimitWatch — AI coding plan limits, dated and sourced";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  const n = SEED_ENTRIES.length;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#fbfbf8", padding: 70, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", fontSize: 56, fontWeight: 800, color: "#141414" }}>Limit<span style={{ color: "#b42318" }}>Watch</span></div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 68, fontWeight: 800, color: "#141414", lineHeight: 1.1 }}>AI coding plan limits, dated.</div>
          <div style={{ fontSize: 32, color: "#555", marginTop: 20 }}>Claude Code · Cursor · Copilot · Codex · Windsurf · Gemini</div>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#555" }}>{n} sourced changes · weekly email every Monday</div>
      </div>
    ),
    size,
  );
}
