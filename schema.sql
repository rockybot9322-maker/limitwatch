-- LimitWatch schema (Postgres). Applied by POST /api/admin/migrate.
CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  vendor TEXT NOT NULL,
  plans TEXT[] NOT NULL DEFAULT '{}',
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  before TEXT, after TEXT, announced TEXT, vendor_framing TEXT,
  direction TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'effective',
  source_url TEXT NOT NULL,
  source_name TEXT,
  via_url TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS submissions (
  id SERIAL PRIMARY KEY,
  kind TEXT NOT NULL,              -- 'limit_change' | 'week_length'
  vendor TEXT, plan TEXT,
  details TEXT NOT NULL,
  source_url TEXT,
  week_hours NUMERIC,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  entry_id TEXT,
  ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS signups (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  source TEXT,
  resend_contact_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS zero_result_searches (
  id SERIAL PRIMARY KEY,
  query TEXT NOT NULL,
  vendor TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS pageviews (
  day DATE NOT NULL,
  path TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, path)
);
CREATE TABLE IF NOT EXISTS sponsor_weeks (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  tagline TEXT,
  week_start DATE NOT NULL,
  price_usd INTEGER NOT NULL DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'booked', -- booked | paid | cancelled
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sponsor_clicks (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL,
  referer TEXT,
  ua TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sponsor_inquiries (
  id SERIAL PRIMARY KEY,
  name TEXT, email TEXT NOT NULL, company TEXT, message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS errors (
  id SERIAL PRIMARY KEY,
  route TEXT, message TEXT, detail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
