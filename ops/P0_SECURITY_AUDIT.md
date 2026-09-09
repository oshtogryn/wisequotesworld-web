# Wise Quotes World — P0 Security Audit

Updated: 2026-09-09
Status: IN PROGRESS

## Confirmed findings

1. `_worker.js` currently contains route-level admin/ops authentication logic inline instead of one canonical middleware.
2. Several admin API modules historically implemented their own local `auth()` / `adminOk()` helpers.
3. `ADMIN_TOKEN` is used as backend authentication. It must remain a secondary backend layer after Cloudflare Access, not the only perimeter control.
4. `/admin/*`, `/ops/*`, and `/api/admin/*` must be protected by Cloudflare Access with MFA.
5. The repository contains many historical one-off GitHub Actions workflows; cleanup is P1 after P0 is stable.

## Implemented in code

- Added `lib/admin_auth.js` as the canonical backend admin authentication helper.
- `requireAdmin(request, env)` returns a 401 response on failure and accepts the legacy Bearer / `x-admin-token` transport while centralizing validation.
- Token comparison is performed on SHA-256 digests and avoids direct plain string comparison in the shared helper.
- Migrated `lib/admin_topics_api.js` to `requireAdmin()`.
- Migrated `lib/newsletter_admin.js` to `requireAdmin()`.
- Migrated `lib/publication_api.js` to `requireAdmin()`.
- Added `.github/workflows/security-scan.yml` with CodeQL JavaScript analysis and minimal workflow permissions.

## Still required — code

- Migrate `lib/production_console_api_v2.js` to `requireAdmin()`.
- Migrate `lib/site_visibility_api.js` to `requireAdmin()`.
- Audit every route handler reachable from `/api/admin/*` and `/ops/*`.
- Move the final admin/ops gate to the top-level Worker before any sensitive module execution.
- Add centralized security response headers.
- Add application-level validation/rate-limit helpers where Cloudflare edge rules are not sufficient.

## Still required — Cloudflare account

Protect these application paths with Cloudflare Access:

- `wisequotesworld.com/admin/*`
- `wisequotesworld.com/ops/*`
- `wisequotesworld.com/api/admin/*`

Access policy:

- Allow only explicitly authorized admin identity/identities.
- Require MFA.
- Short session duration for admin tools.

Then configure WAF / rate limiting for:

- newsletter subscribe/unsubscribe
- admin APIs
- media upload
- production/ops APIs

Add response security headers:

- Strict-Transport-Security
- Content-Security-Policy
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- `frame-ancestors` through CSP

## Secrets audit checklist

The following must exist only as Cloudflare Worker Secrets and/or GitHub Actions Secrets, never committed in source:

- ADMIN_TOKEN
- Cloudflare API credentials
- Brevo API key
- OpenAI API key
- Metricool credentials/tokens
- Telegram credentials
- GitHub tokens
- social API credentials

Rotate immediately if any secret is discovered in repository history, logs, artifacts, or workflow output.

## Verification gate

P0 is not complete until all of the following are verified from production:

1. Anonymous request to `/admin/*` is blocked by Cloudflare Access.
2. Anonymous request to `/ops/*` is blocked by Cloudflare Access.
3. Anonymous request to `/api/admin/*` is blocked by Cloudflare Access.
4. Authenticated Access session without valid backend admin token cannot mutate protected admin/ops APIs.
5. Valid admin session + valid backend token succeeds.
6. Rate limiting is active on abuse-sensitive endpoints.
7. Security headers are visible in real production responses.
8. CodeQL security scan completes successfully.
