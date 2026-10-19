# LimitWatch

Dated, sourced tracker of usage limits and pricing changes on AI coding plans.

Next.js (App Router) + Postgres + Resend. Deployed on Vercel.

## Content
- `data/entries.json` — curated change-log entries. Every entry has a date and a `source_url`; `verified: true` means the source page was loaded and checked; otherwise the row is carried from the Digital Applied ledger (`via_url`).
- `data/plans.json` — current-limit records per plan (with source and checked date).
- New entries arrive via `/submit` → review queue → `POST /api/admin/approve`.

## Environment
| Var | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres (Neon via Vercel Marketplace). Without it the site serves seed data read-only. |
| `ADMIN_TOKEN` | Bearer token for `/api/admin/*`. |
| `RESEND_API_KEY` | Contacts (signup) and notification emails. |
| `RESEND_SEGMENT_ID` | Segment that new signups join. |
| `RESEND_FROM` | Sender, e.g. `LimitWatch <news@yourdomain>` (needs a verified Resend domain). |
| `OWNER_EMAIL`, `BOT_INBOX_EMAIL` | Recipients of sponsor inquiries. |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL. |

## Admin API (Authorization: Bearer $ADMIN_TOKEN)
- `POST /api/admin/migrate` — create tables, seed entries.
- `GET /api/admin/queue?status=pending`
- `POST /api/admin/approve` — `{id, action:"approve"|"reject", entry?}`; or `{entry}` to publish directly.
- `GET /api/admin/stats?days=30`
- `GET /api/admin/searches?days=30` — zero-result searches.
- `GET|POST /api/admin/sponsors` — sponsor weeks, clicks, inquiries; book a week.
- `GET /api/admin/newsletter?type=weekly&end=YYYY-MM-DD` / `?type=alert&id=` — Broadcast-ready subject/html/text.

Sponsor links always go through `/go/<slug>` (click logged in `sponsor_clicks`).
