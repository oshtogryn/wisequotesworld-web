# Wise Quotes World — P0 Security Audit

Updated: 2026-09-10
Status: IN PROGRESS — code hardening largely complete; edge rate limits and production verification remain

## Confirmed findings

1. Cloudflare Access is the primary browser/admin identity layer. Browser users must not be required to paste or store `ADMIN_TOKEN`.
2. `ADMIN_TOKEN` remains a legacy backend credential for non-browser automation/fallback and as a temporary server-side compatibility bridge for legacy handlers.
3. `/admin/*`, `/ops/*`, and `/api/admin/*` are protected in Cloudflare Access with an explicit admin policy and MFA.
4. Some historical handlers in `_worker_legacy.js` still contain their own token checks; they are now behind the canonical top-level gate and receive the legacy credential only server-side after successful Access/admin authentication.
5. The repository contains many historical one-off GitHub Actions workflows; cleanup is P1 after P0 is stable.

## Implemented in Cloudflare

- One shared Access application (`Admin Access`) protects both Wise Quotes World and Sweden No Sugar admin surfaces.
- Wise Quotes World destinations are protected for `admin*`, `ops*`, and `api/admin*`.
- Authorized admin identity policy is configured.
- MFA is configured and verified with biometrics / Face ID.
- App Launcher is configured and protected by its own reusable `Launcher` policy.
- Reusable admin policy is named `Admin Only`.

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
- Added a canonical top-level admin/ops gate in `_worker.js` before any sensitive module execution.
- Added a temporary server-side compatibility bridge for legacy handlers: after the canonical gate succeeds, `_worker.js` injects the legacy backend credential internally. The credential is never sent to browser JavaScript or exposed in page storage.
- Removed browser-side `ADMIN_TOKEN` / pseudo-token handling from `admin/console/app.js`.
- Removed the legacy token field and token-storage compatibility script from `admin/console/index.html`.
- Admin Console now uses the Cloudflare Access session with same-origin credentials.
- Added centralized response hardening in `lib/security_headers.js` and applies it at the Worker response boundary:
  - Strict-Transport-Security
  - Content-Security-Policy for HTML
  - X-Content-Type-Options
  - Referrer-Policy
  - Permissions-Policy
  - X-Frame-Options
  - Cross-Origin-Opener-Policy
  - CSP `frame-ancestors 'none'`
- Newsletter subscribe already has application-level input validation, language allow-list, email length/format validation, and a honeypot field.
- Added `.github/workflows/security-scan.yml` with CodeQL JavaScript analysis and minimal workflow permissions.

## Remaining P0 — Cloudflare edge controls

Configure rate limiting / WAF for:

- `/api/newsletter/subscribe`
- `/api/admin/*`
- `/api/admin/media*`
- `/ops/*`

Edge rate limiting is preferred here rather than a D1-backed application limiter because it blocks abuse before Worker/D1/R2 execution.

## Remaining P0 — production verification

Verify after deployment:

1. Anonymous request to `/admin/*` is blocked by Cloudflare Access.
2. Anonymous request to `/ops/*` is blocked by Cloudflare Access.
3. Anonymous request to `/api/admin/*` is blocked by Cloudflare Access.
4. Authenticated Cloudflare Access browser session can use the Admin Console without manually entering or storing `ADMIN_TOKEN`.
5. Non-browser automation without either a valid Access identity or valid legacy backend credential is rejected.
6. Rate limiting is active on abuse-sensitive endpoints.
7. Security headers are visible in real production responses.
8. CodeQL security scan completes successfully.

## P1 after P0 verification

- Remove duplicated legacy auth helpers from `_worker_legacy.js` and retire the temporary compatibility bridge.
- Reduce/remove old one-off GitHub Actions workflows after confirming they are no longer operationally required.
- Minimize public health/status endpoint metadata.

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
