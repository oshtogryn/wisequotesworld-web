# Wise Quotes World — Technical / UX / Security Audit

Date: 2026-09-15
Status: working audit; MASTER_RULES remains canonical

## Verified production state

The following items have real production readback, not only code inspection:

- Public `https://wisequotesworld.com/en/` returns HTTP 200.
- Production response exposes revision `x-wqw-revision: p0-runtime-20260915`.
- HSTS and CSP are present on HTML responses.
- Anonymous `/admin/` is intercepted by Cloudflare Access (302 on the custom domain).
- Cloudflare Access service-token flow reaches `/api/admin/health` successfully.
- Direct privileged requests to `wisequotesworld-web.pages.dev` return 401 at the application layer for `/admin/`, `/api/admin/health`, and `/ops/`; therefore the Pages hostname does not bypass the backend admin guard.
- D1 runtime lifecycle migration 11 was applied manually in production and read back: `website_publication_schedule`, `newsletter_settings`, and `newsletter_deliveries` exist.
- Public Swedish and Spanish homepage microcopy is localized in production (`Varje dag.`, `Vetenskap`, `Cada día.`, `Ciencia`).
- Retired public prompt-audit endpoint returns 410.
- Sitemap returns 200 and valid `<urlset>` output.
- Latest verified production smoke at the time of this audit: GitHub Actions run `34936767775`, success.
- Latest verified CodeQL Security Scan at the time of this audit: run `34936767750`, success.

## D1 / request-lifecycle stabilization

Completed:

- Removed schema creation and prompt-audit maintenance from public request lifecycle.
- Removed newsletter scheduler execution from ordinary public GET requests.
- Runtime schema lives in explicit migration 11.
- IndexNow bulk submission is disabled; sitemap reads no longer cause real bulk submissions.
- Baseline captured before the full post-fix 24h window: `327.48k rows read`, `0 rows written` (Cloudflare D1 dashboard, 2026-09-15 morning Europe/Stockholm).

Acceptance gate still open:

- Compare a full post-fix 24h D1 window before declaring P0 D1 optimization closed.

Prepared but **not yet applied to production D1**:

- `db/migration12_query_indexes.sql`
  - `idx_quote_pages_project_locale_status`
  - `idx_content_approvals_visibility`
  - `idx_newsletter_deliveries_daily`
- Migration 12 is idempotent and CI-tested by `tests/query_index_smoke.py`.

## Newsletter / scheduler

Verified live settings via protected admin readback:

- enabled: true
- cadence: 14 days
- daily cap: 300
- execution cap: 40
- active real subscribers: 3
- last run observed: `2026-09-14T08:01:38.522Z`

Runtime improvements completed:

- Digest selection excludes editorially hidden articles.
- Failed delivery rows can be reserved again and retried safely.
- Stale `reserved` rows older than 2 hours are recovered to `failed`.
- Hourly batches enforce the aggregate 300/day cap using actual `sent` rows rather than relying on `last_run_at` as a one-run-per-day switch.
- GitHub Runtime scheduler is configured at `17 * * * *` and uses production Cloudflare Access service credentials.

Verification gate still open:

- Do not call scheduled newsletter automation fully verified until at least one real GitHub `schedule` event for `Runtime scheduler` is observed and its production response is successful.

## Security

Completed/verified:

- Cloudflare Access on admin/ops surfaces.
- Backend JWT signature verification through Cloudflare JWKS.
- Service-token automation supported without weakening anonymous access.
- Application-layer protection remains effective on the `pages.dev` hostname.
- HSTS, `nosniff`, referrer policy, restrictive Permissions-Policy, `X-Frame-Options: DENY`, COOP, and CSP.
- CodeQL runs on main and is currently green.
- Bot Fight Mode was disabled because it incorrectly challenged legitimate GitHub automation before Access.

Manual hardening still required as one consolidated Cloudflare session:

1. Restrict Pages preview deployments.
2. Add/confirm `CF_ACCESS_AUD`, then make Access audience validation mandatory in code.
3. Add/confirm `ADMIN_EMAILS`, then remove the hard-coded human-admin fallback from code.
4. Apply migration 12 in D1 Console.

Do not recreate the existing shared Cloudflare service token.

## UX / web design

Completed:

- Localized homepage microcopy/category labels for the primary rendered locale group instead of English fallbacks.
- Added visible keyboard focus treatment and >=44px interactive targets where relevant.
- Added `prefers-reduced-motion` handling.
- Hardened multilingual responsive typography with `overflow-wrap` / hyphenation and fluid mobile hero sizing.
- Added RTL positioning adjustments for the shared stylesheet.

Remaining design/UX work:

- Complete a 13-locale component unification so `it`, `pt`, `id`, `tr`, and `ar` do not depend on parallel legacy locale renderers.
- Run a formal WCAG/contrast pass and browser/device visual QA.
- Add/verify skip-to-content and complete ARIA state handling for toggle menus.
- Consolidate homepage/archive/category/author rendering into one shared locale renderer to prevent translation and visibility-rule drift.

## Important consistency issue still open

The primary `site_v2` discovery queries treat a due `website_publication_schedule` row as immediately visible at/after `scheduled_for`, as required by MASTER_RULES.

The parallel `new_locales_site` / `locale13_site` discovery paths for the remaining locales still depend primarily on the housekeeping `website_visibility` approval. This can create a short visibility delay until the scheduler marks the row released. The architecture should be consolidated or those queries updated so all 13 locales obey the exact same due-schedule condition.

This is not a direct-article/indexability issue; it is a public discovery timing consistency issue.

## Workflow cleanup

Completed:

- Obsolete WQ013 video probe no longer runs on every push; it is manual-only.
- `production-check` now syntax-checks current runtime/security/scheduler modules and executes D1 migration smoke tests.
- `Production smoke` checks production public routes, Access, service auth, pages.dev guard, localized microcopy, sitemap, retired diagnostics, visibility release endpoint, and protected newsletter health.
- ChatGPT daily WQW health summary is scheduled for approximately 08:00 Europe/Stockholm.

Remaining:

- Inventory older one-off WQ-specific workflows and move/remove only after dependency review. Do not bulk-delete blindly.

## Current priority order

1. Wait for/verify a real scheduled `Runtime scheduler` run.
2. Complete the one-session Cloudflare manual hardening + migration12 application.
3. Capture the full 24h D1 post-fix readback and compare against 327.48k baseline.
4. Fix 13-locale discovery visibility parity.
5. Continue legacy route/workflow consolidation.
6. Staging + backup/restore drill.
7. SEO structured-data consolidation, accessibility audit, performance budget and monitoring trends.
