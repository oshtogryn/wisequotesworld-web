# Wise Quotes World — P0 Security Audit

Updated: 2026-09-10
Status: CODE/EDGE HARDENING COMPLETE — final anonymous/header production readback remains

## Confirmed security model

1. Cloudflare Access is the primary browser/admin identity layer. Browser users never paste or store `ADMIN_TOKEN`.
2. `ADMIN_TOKEN` may remain only as a legacy non-browser fallback accepted by the canonical `lib/admin_auth.js`; it is no longer injected into browser/admin requests for legacy handlers.
3. `/admin/*`, `/ops/*`, and `/api/admin/*` are protected by the canonical Worker gate and Cloudflare Access policy/MFA.
4. Legacy handlers in `_worker_legacy.js` no longer perform their own `ADMIN_TOKEN` comparison. They accept only the server-only internal marker written after the canonical top-level gate succeeds.
5. The top-level gate first strips any client-supplied `x-wqw-canonical-admin` header, authenticates the request, then writes that marker internally. A client cannot self-assert the legacy bridge.

## Cloudflare Access / zone edge

Verified/configured 2026-09-10:

- Shared Access application `Admin Access` protects the Wise Quotes World admin surfaces.
- Wise destinations cover `admin*`, `ops*`, and `api/admin*`.
- Reusable admin policy `Admin Only`; MFA verified with biometric/Face ID flow.
- App Launcher protected by reusable `Launcher` policy.
- Universal SSL active, including backup certificate for the apex/wildcard.
- Always Use HTTPS enabled.
- Minimum TLS 1.2; TLS 1.3 enabled.
- Automatic HTTPS Rewrites enabled.
- Bot Fight Mode enabled.
- Certificate Transparency Monitoring enabled with active recipient.
- Newsletter edge rate limit: `POST /api/newsletter/subscribe`, 5 requests / 10 seconds, Block for 10 seconds.
- Custom WAF rules protect newsletter method surface, suspicious admin/ops methods, and sensitive-file probes.
- Worker emits HSTS centrally: `max-age=31536000; includeSubDomains`.
- Cloudflare HSTS UI is intentionally not enabled merely to duplicate the Worker header.
- Leaked-credentials mitigation was not enabled because the Free-plan rate-limit quota is already used; do not replace the newsletter rate-limit rule just to enable it.

## Code hardening completed

- Canonical backend auth helper: `lib/admin_auth.js`.
- Shared `requireAdmin()` gate used by admin topics, newsletter admin, publication API, production console, and site visibility API.
- Canonical top-level admin/ops gate executes before sensitive module execution.
- Legacy browser token field/storage removed from Admin Console.
- Legacy server-side `ADMIN_TOKEN` injection bridge retired.
- `_worker_legacy.js` now trusts only the canonical server-internal marker after the top-level gate.
- Public `/api/health` minimized to `{"ok":true}`.
- Binding/system diagnostics moved to protected `/api/admin/health`.
- Admin Console connects through the protected health endpoint and same-origin Access session.
- Central `lib/security_headers.js` adds HSTS, HTML CSP, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-Frame-Options, Cross-Origin-Opener-Policy and CSP `frame-ancestors 'none'`.
- Newsletter application validation includes allow-listed languages, email format/length validation and honeypot protection.
- CodeQL JavaScript workflow runs with minimal permissions (`contents: read`, `security-events: write`).
- Production probe workflow exists, but Cloudflare Bot Fight/WAF can deliberately return 403 to datacenter curl; protections must not be weakened to satisfy that synthetic probe.
- D1 website-publication scheduling was added independently of social scheduling.
- D1 scheduler schema creation now uses one prepared statement per DDL command instead of multi-statement `DB.exec()`, fixing the production `SQLITE_ERROR: incomplete input` observed from the Admin Console.
- Completed temporary scheduler/security patch workflows created on 2026-09-10 were removed after deployment.
- Obsolete one-off repair workflows removed in this audit pass include old newsletter/start repair actions and the obsolete ten-language rules updater.

## Deployment / production evidence

- Website scheduler/navigation/admin UI patch `73ba9bb5a4fa16f8f84de83a49cb6c3a768752d8` deployed successfully to Cloudflare Pages.
- Runtime hardening patch `193544730b7f0a7ec0bad562f0e4382ebf8a6422` deployed successfully to Cloudflare Pages.
- Authenticated production Safari readback captured 2026-09-10: `/admin/console/` loads the complete **Wise Quotes World — Editorial & Production** interface and shows `● online` without any browser token field or `unauthorized` response. ✅
- A production Admin Console readback exposed `D1_EXEC_ERROR ... CREATE TABLE ... incomplete input`; root cause was the scheduler schema initialization method and the code was corrected in commit `965cb1c0c6657cfad4e56fb9f3a5ec9e634cc379`.
- `node --check` passed in the one-off hardening workflow for `_worker.js`, `_worker_legacy.js`, Admin Console JavaScript, and scheduler modules before the hardening commit was pushed.
- Security Scan / CodeQL remains the canonical code-scanning workflow.

## Remaining P0 production evidence — manual/browser only

These are operational verification items, not unresolved implementation defects:

1. In a private/anonymous window, open `/admin/console/` and confirm Cloudflare Access login/denial appears and application content is not exposed.
2. Confirm a real browser production HTML response carries the expected security headers. Datacenter curl is not accepted as authoritative because Bot Fight/WAF intentionally blocks it.
3. After deployment of commit `965cb1c0c6657cfad4e56fb9f3a5ec9e634cc379`, confirm the Admin → Planning panel loads website visibility state without a D1 schema error and can create/read back a future website schedule for a 13/13-ready topic.

Do not mark P0 `COMPLETE` until those production readbacks are captured.

## Remaining repository/security governance

- GitHub repository currently has no repository ruleset returned by the GitHub rulesets API. Add protection for `main` (pull request or explicit controlled-bypass policy, prevent deletion/force-push, and require the canonical validation/security checks as appropriate). This requires repository administration capability not exposed by the current connector.
- Continue retiring historical one-off workflows only after confirming they are no longer operationally required; preserve canonical security/production workflows.
- If Cloudflare Access JWT cryptographic verification is later moved into application code, configure the exact Access issuer/team domain and application AUD first. Do not implement permissive or guessed JWT verification.

## Secrets audit checklist

The following must exist only as Cloudflare Worker/GitHub/connector secrets, never committed in source:

- ADMIN_TOKEN
- Cloudflare API credentials
- Brevo API key
- OpenAI API key, if ever explicitly enabled
- Metricool credentials/tokens
- Telegram credentials
- GitHub tokens
- social API credentials

Rotate any secret immediately if it is discovered in repository history, logs or artifacts.
