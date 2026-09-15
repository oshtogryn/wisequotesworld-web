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
- Locale homepages `sv`, `es`, `it`, `pt`, `id`, `tr`, and `ar` all return HTTP 200 with locale-specific visible copy.
- Retired public prompt-audit endpoint returns 410.
- Sitemap returns 200, valid `<urlset>`, and `x-default` hreflang.
- Latest verified expanded production smoke: run `34943720152`, success.
- Production-check including D1/index/visibility regression tests is green.
- Latest verified CodeQL scan before this refresh: run `34936767750`, success.

## D1 / request-lifecycle stabilization

Completed:

- Removed schema creation and prompt-audit maintenance from public request lifecycle.
- Removed newsletter scheduler execution from ordinary public GET requests.
- Runtime schema lives in explicit migration 11.
- IndexNow bulk submission is disabled; sitemap reads no longer cause real bulk submissions.
- Public discovery visibility now uses the same semantic rule across all renderer groups: legacy WQ001–WQ015 OR explicit `website_visibility` approval OR a due `website_publication_schedule` row.
- Direct technically published article URLs remain available/indexable independently from editorial discovery visibility.
- Visibility semantics are regression-tested by `tests/visibility_schedule_smoke.py`.
- Baseline before the full post-fix 24h window: `327.48k rows read`, `0 rows written` (Cloudflare D1 dashboard, 2026-09-15 morning Europe/Stockholm).

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
- Hourly batches enforce the aggregate 300/day cap using actual `sent` rows.
- GitHub Runtime scheduler is configured at `17 * * * *` and uses production Cloudflare Access service credentials.

Verification gate still open:

- Do not call scheduled newsletter automation fully verified until at least one real GitHub `schedule` event for `Runtime scheduler` is observed and its production response is successful.

## Security

Completed/verified:

- Cloudflare Access on admin/ops surfaces.
- Backend JWT signature verification through Cloudflare JWKS.
- Service-token automation works without weakening anonymous access.
- Application-layer protection remains effective on the `pages.dev` hostname.
- HSTS, `nosniff`, referrer policy, restrictive Permissions-Policy, `X-Frame-Options: DENY`, COOP, and CSP.
- CodeQL runs on main and is green.
- Bot Fight Mode was disabled because it incorrectly challenged legitimate GitHub automation before Access.
- A protected runtime-config readback was added; it exposes only presence booleans, never secret values.

Live production configuration readback on 2026-09-15:

- `CF_ACCESS_AUD` / `ACCESS_AUD`: **not configured**.
- `ADMIN_EMAILS` / `ADMIN_EMAIL`: **not configured**.
- `CF_ACCESS_TEAM_DOMAIN` / `ACCESS_TEAM_DOMAIN`: **not configured**.
- `ADMIN_TOKEN`: configured.

Therefore the current code still necessarily relies on the existing hard-coded human-admin and Access-issuer fallbacks. These fallbacks must not be removed until the Cloudflare variables are present and read back successfully.

Manual hardening still required as one consolidated Cloudflare session:

1. Restrict Pages preview deployments.
2. Configure exact `CF_ACCESS_AUD`.
3. Configure explicit `ADMIN_EMAILS`.
4. Configure explicit `CF_ACCESS_TEAM_DOMAIN`.
5. Apply migration 12 in D1 Console.
6. Re-read production configuration; only then remove/fail-close the code fallbacks and make audience validation mandatory.

Do not recreate the existing shared Cloudflare service token.

## UX / web design

Completed:

- Localized homepage microcopy/category labels across the currently active renderer groups.
- Added visible keyboard focus treatment and >=44px interactive targets where relevant.
- Added `prefers-reduced-motion` handling.
- Hardened multilingual responsive typography with overflow wrapping/hyphenation and fluid mobile hero sizing.
- Added RTL positioning adjustments for the shared stylesheet.
- Added production smoke coverage for `sv`, `es`, `it`, `pt`, `id`, `tr`, and `ar` home renderers.

Remaining design/UX work:

- Complete 13-locale component unification so `it`, `pt`, `id`, `tr`, and `ar` no longer depend on parallel renderer modules.
- Run a formal WCAG/contrast and browser/device visual QA pass.
- Add/verify skip-to-content and complete ARIA state handling for toggle menus.
- Consolidate homepage/archive/category/author rendering into one shared locale renderer to eliminate future translation/visibility drift.

## Visibility consistency issue

**Fixed.** `site_v2`, `new_locales_site`, and `locale13_site` now treat a due `website_publication_schedule` row as immediately discovery-visible at/after `scheduled_for`, as required by MASTER_RULES. Direct article/indexability behavior remains independent. CI contains an explicit regression test for this contract.

## Workflow cleanup

Completed:

- Obsolete WQ013 video probe no longer runs on every push; it is manual-only.
- `production-check` syntax-checks current runtime/security/renderer modules and executes D1 migration/index/visibility smoke tests.
- `Production smoke` checks production public routes, multiple locale renderers, Access, service auth, pages.dev guard, sitemap/hreflang, retired diagnostics, visibility release endpoint, protected newsletter health, and protected runtime configuration readback.
- ChatGPT daily WQW health summary is scheduled for approximately 08:00 Europe/Stockholm.

Remaining:

- Inventory older one-off WQ-specific workflows and remove/archive only after dependency review. Do not bulk-delete blindly.

## Current priority order

1. Verify a real scheduled `Runtime scheduler` run.
2. Complete the one-session Cloudflare manual hardening + migration12 application.
3. Capture the full 24h D1 post-fix readback and compare against the `327.48k` baseline.
4. Accessibility hardening and formal visual QA.
5. Renderer/legacy workflow consolidation.
6. Staging + backup/restore drill.
7. SEO structured-data consolidation, performance budget and monitoring trends.
