import postgres from "postgres";

type Sql = ReturnType<typeof postgres>;
let _sql: Sql | null = null;

export function dbUrl(): string | undefined {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || undefined;
}

export function hasDb(): boolean {
  return !!dbUrl();
}

export function sql(): Sql {
  const url = dbUrl();
  if (!url) throw new Error("DATABASE_URL is not configured");
  if (!_sql) _sql = postgres(url, { max: 1, idle_timeout: 20, prepare: false, ssl: url.includes("localhost") ? false : "require" });
  return _sql;
}

export async function logError(route: string, err: unknown) {
  console.error(`[${route}]`, err);
  if (!hasDb()) return;
  try {
    const e = err as Error;
    await sql()`INSERT INTO errors (route, message, detail) VALUES (${route}, ${String(e?.message ?? err).slice(0, 500)}, ${String(e?.stack ?? "").slice(0, 2000)})`;
  } catch {}
}
