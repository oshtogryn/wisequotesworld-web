# Wise Quotes World — staging bootstrap

Updated: 2026-09-10
Status: infrastructure action required before P1 migrations are promoted

## Goal

Create a true staging environment that never uses production D1/R2/secrets for migration or integration testing.

## Required Cloudflare resources

- hostname: `staging.wisequotesworld.com`
- staging Pages/Worker deployment separated from production
- D1: `wisequotesworld-staging`
- R2: `wisequotesworld-media-staging`
- Cloudflare Access application protecting the entire staging hostname
- staging-only secrets/variables for any external providers used during tests
- no production Metricool/Brevo mutation credentials unless a test is explicitly designed and isolated

## Binding contract

Application code should keep the same binding names across environments so code does not branch by environment:

- `DB` → staging D1 in staging, production D1 in production
- `MEDIA` → staging R2 in staging, production R2 in production
- `AI` → environment-appropriate Workers AI binding if enabled
- future queue binding: `NEWSLETTER_QUEUE`

Environment identity must be explicit, e.g. `APP_ENV=staging` or `APP_ENV=production`.

## Access policy

Protect all of `staging.wisequotesworld.com/*` with Cloudflare Access. Staging must not be publicly crawlable or indexable. Add `X-Robots-Tag: noindex, nofollow` or equivalent staging response policy in addition to Access.

## Database validation sequence

1. Create a fresh staging D1 database.
2. Apply the current production schema/migrations to reproduce production structure.
3. Apply `db/migration11_platform_hardening.sql`.
4. Apply `db/migration12_delivery_configuration.sql`.
5. Run integrity/readiness checks.
6. Exercise Admin topic/media/newsletter read paths against staging only.
7. Test rollback/restore procedure.
8. Only after successful staging readback may the migrations be considered for production.

## Media validation test

Upload one known valid 9:16 video and one known valid 2:3 Pinterest image through staging Admin. Confirm:

- binary is in staging R2 only;
- D1 `media_inbox.sha256` is populated;
- duplicate upload returns `duplicate_media` and does not create a second R2 object;
- `media_validation` contains automated QA metadata;
- manual QA remains pending until explicitly reviewed.

## Production safety gate

Do not point a staging deployment at production D1 or production R2 even temporarily. Do not run database migrations from a generic Pages preview whose bindings are inherited from production.

## Promotion evidence

Before merge/promotion record:

- staging deployment URL/hostname;
- staging D1 identifier/name;
- staging R2 identifier/name;
- Access protection readback;
- migration 11 success;
- migration 12 success;
- media duplicate/QA readback;
- restore test result.
