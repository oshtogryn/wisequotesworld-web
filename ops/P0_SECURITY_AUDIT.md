# Wise Quotes World — P0 Security Audit

Updated: 2026-09-10
Status: IN PROGRESS — code hardening and Cloudflare edge hardening complete; final production readback remains

## Confirmed findings

1. Cloudflare Access is the primary browser/admin identity layer. Browser users must not be required to paste or store `ADMIN_TOKEN`.
2. `ADMIN_TOKEN` remains a legacy backend credential for non-browser automation/fallback and as a temporary server-side compatibility bridge for legacy handlers.
3. `/admin/*`, `/ops/*`, and `/api/admin/*` are protected in Cloudflare Access with an explicit admin policy and MFA.
4. Some historical handlers in `_worker_legacy.js` still contain their own token checks; they are now behind the canonical top-level gate and receive the legacy credential only server-side after successful Access/admin authentication.
5. The repository contains many historical one-off GitHub Actions workflows; cleanup is P1 after P0 is stable.

## Implemented in Cloudflare Access

- One shared Access application (`Admin Access`) protects both Wise Quotes World and Sweden No Sugar admin surfaces.
- Wise Quotes World destinations are protected for `admin*`, `ops*`, and `api/admin*`.
- Authorized admin identity policy is configured.
- MFA is configured and verified with biometrics / Face ID.
- App Launcher is configured and protected by its own reusable `Launcher` policy.
- Reusable admin policy is named `Admin Only`.

## Implemented at the Cloudflare zone edge

Verified/configured manually on 2026-09-10:

- Universal SSL is active and a backup certificate has been issued for `wisequotesworld.com` / `*.wisequotesworld.com`.
- `Always Use HTTPS` is enabled.
- Minimum TLS version is TLS 1.2.
- TLS 1.3 is enabled.
- Automatic HTTPS Rewrites are enabled.
- Bot Fight Mode is enabled.
- Certificate Transparency Monitoring is enabled with an active notification recipient.
- Newsletter subscribe edge rate limiting is active for `POST /api/newsletter/subscribe`: 5 requests / 10 seconds, Block for 10 seconds.
- Custom WAF rule protects the newsletter endpoint method surface.
- Custom WAF rule blocks suspicious methods on `/admin*`, `/ops*`, and `/api/admin*` while preserving the methods required by the application.
- Custom WAF rule blocks sensitive-file probes.

The Worker also emits HSTS centrally (`max-age=31536000; includeSubDomains`). Cloudflare's separate HSTS UI toggle is therefore not required merely to obtain HSTS and should not be enabled blindly until all current/future subdomains are confirmed HTTPS-safe.

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
- CodeQL run 18 for commit `62c0752e6aaa509c779ea3936a2acdcfcd71330e` completed successfully: checkout, initialization, JavaScript analysis, and post-analysis all passed.
- Added `.github/workflows/p0-production-verification.yml` to probe public HTTPS/security headers and anonymous admin gates from GitHub Actions.

## Production verification status

Verified / strong evidence:

1. Cloudflare Access authentication + MFA flow works in the browser. ✅
2. Access rules exist for `/admin/*`, `/ops/*`, `/api/admin/*`. ✅
3. Edge newsletter rate limit is deployed. ✅
4. Custom WAF protections are deployed. ✅
5. CodeQL security scan completes successfully. ✅
6. Cloudflare Pages deploy for commit `38fef34fb65c06f19faa50cd73ec34d5fa8a0498` completed successfully. ✅

Still requiring deterministic production readback:

1. Authenticated Cloudflare Access browser session can use every Admin Console function without manually entering or storing `ADMIN_TOKEN`.
2. Non-browser automation without either a valid Access identity or valid legacy backend credential is rejected by the Worker gate.
3. Security headers are visible in a real production Worker response.
4. Anonymous probes to `/admin/*`, `/ops/*`, and `/api/admin/*` return only an Access gate / denial and never application content.

### Automated probe note

The first GitHub Actions production probe on 2026-09-10 received HTTP 403 for the public homepage before it reached the Worker. This is consistent with Cloudflare edge bot/WAF protection blocking a datacenter `curl` client. That demonstrates edge mitigation is active, but it prevents that runner from being used as proof of Worker response headers. The workflow must therefore use an approved browser/Access-aware probe path or a separate readback method for the remaining header checks; do not weaken Bot Fight Mode merely to make the probe pass.

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

## 2026-09-10 follow-up hardening

- Legacy ADMIN_TOKEN injection bridge retired. The top-level canonical admin gate strips any client-supplied internal marker, authenticates the request, then adds a server-only `x-wqw-canonical-admin` marker for legacy handlers.
- Public `/api/health` metadata minimized to `{"ok":true}`; binding diagnostics moved to protected `/api/admin/health`.
- D1 website publication scheduling added independently of social scheduling.
- Remaining P0 evidence is operational: authenticated Admin Console browser readback, anonymous/private-window denial readback, and production security-header readback.
