"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function PageView() {
  const path = usePathname();
  useEffect(() => {
    if (!path) return;
    const body = JSON.stringify({ path });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/pv", new Blob([body], { type: "application/json" }));
    else fetch("/api/pv", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
  }, [path]);
  return null;
}
