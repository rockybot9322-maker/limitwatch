import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

export function isAdmin(req: Request): boolean {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return false;
  const h = req.headers.get("authorization") || "";
  const given = h.startsWith("Bearer ") ? h.slice(7) : req.headers.get("x-admin-token") || "";
  const a = Buffer.from(given);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

export function noDb() {
  return NextResponse.json({ error: "database not configured (set DATABASE_URL)" }, { status: 503 });
}
