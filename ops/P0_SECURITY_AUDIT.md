# Wise Quotes World — P0 Security Audit

Updated: 2026-09-10
Status: IN PROGRESS

## Confirmed findings

1. `_worker.js` still contains some route-level admin/ops authentication logic inline instead of one canonical top-level gate.
2. Several admin API modules historically implemented their own local `auth()` / `adminOk()` helpers.
3. Cloudflare Access is now the primary browser/admin identity layer. Browser users must not be required to paste or store `ADMIN_TOKEN`.
4. `ADMIN_TOKEN` remains a legacy backend credential for non-browser automation/fallback while migration is completed.
5. `/admin/*`, `/ops/*`, and `/api/admin/*` are protected in Cloudflare Access with an explicit admin policy and MFA.
6. The repository contains many historical one-off GitHub Actions workflows; cleanup is P1 after P0 is stable.

## Implemented in Cloudflare

- One shared Access application (`Admin Access`) protects both Wise Quotes World and Sweden No Sugar admin surfaces.
- Wise Quotes World destinations are protected for `admin*`, `ops*`, and `api/admin*`.
- Authorized admin identity policy is configured.
- MFA is configured and verified with biometrics / Face ID.
- App Launcher is configured and protected by its own reusable Launcher policy.

## Implemented in code

- Added `lib/admin_auth.js` as the canonical backend admin authentication helper.
- `requireAdmin(request, env)` returns a 401 response on failure.
- Browser requests authenticated by Cloudflare Access are accepted using Access identity headers/assertion.
- Legacy Bearer / `x-admin-token` transport remains accepted for non-browser automation/fallback.
- Token comparison is performed on SHA-256 digests and avoids direct plain string comparison in the shared helper.
- Migrated `lib/admin_topics_api.js` to `requireAdmin()`.
- Migrated `lib/newsletter_admin.js` to `requireAdmin()`.
- Migrated `lib/publication_api.js` to `requireAdmin()`.
- Migrated `lib/production_console_api_v2.js` to `requireAdmin()`.
- Migrated `lib/site_visibility_api.js` to `requireAdmin()`.
- Added `.github/workflows/security-scan.yml` with CodeQL JavaScript analysis and minimal workflow permissions.

## Still required — code

- Audit every route handler reachable from `/api/admin/*` and `/ops/*`.
- Move the final admin/ops gate to the top-level Worker before any sensitive module execution.
- Remove the browser-side pseudo-token / legacy token dependency from Admin Console JavaScript and rely on the Cloudflare Access session.
- Add centralized security response headers.
- Add application-level validation/rate-limit helpers where Cloudflare edge rules are not sufficient.

## Still required — Cloudflare account

Configure WAF / rate limiting for:

- newsletter subscribe/unsubscribe
- admin APIs
- media upload
- production/ops APIs

Confirm response security headers in production:

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
4. Authenticated Cloudflare Access browser session can use the Admin Console without manually entering or storing `ADMIN_TOKEN`.
5. Non-browser automation without either a valid Access identity or valid legacy backend credential is rejected.
6. Rate limiting is active on abuse-sensitive endpoints.
7. Security headers are visible in real production responses.
8. CodeQL security scan completes successfully.
