# Wise Quotes World — Technical / UX / Security Audit

Date: 2026-09-15
Status: working audit; MASTER_RULES remains canonical

## Verified production state

The following items have real production readback, not only code inspection:

- Public `https://wisequotesworld.com/en/` returns HTTP 200.
- Production responses expose the WQW revision/security headers.
- HSTS and CSP are present on HTML responses.
- Anonymous `/admin/` is intercepted by Cloudflare Access on the custom domain.
- Cloudflare Access service-token flow reaches `/api/admin/health` successfully.
- Direct privileged requests to `wisequotesworld-web.pages.dev` return 401 at the application layer for `/admin/`, `/api/admin/health`, and `/ops/`; the Pages hostname does not bypass backend admin protection.
- D1 runtime lifecycle migration 11 is present in production: `website_publication_schedule`, `newsletter_settings`, and `newsletter_deliveries` exist.
- D1 query-index migration 12 is applied and independently read back in production.
- Locale homepages `sv`, `es`, `it`, `pt`, `id`, `tr`, and `ar` return HTTP 200 with locale-specific visible copy.
- Retired public prompt-audit endpoint returns 410.
- Sitemap returns HTTP 200, valid `<urlset>`, and `x-default` hreflang.
- Production smoke run `34944416981` succeeded with locale checks, Access/service auth, runtime security config, migration12 indexes, newsletter health, pages.dev guard, visibility release endpoint, retired diagnostic endpoint and sitemap.
- Production-check including D1/index/visibility regression tests is green.
- Runtime cleanup run `34947140115` succeeded. Production sitemap readback observed `x-wqw-sitemap-mode: read-only` on attempt 2, proving the deployed sitemap GET path no longer performs the old full IndexNow submission side effect.

## D1 / request-lifecycle stabilization

Completed:

- Removed schema creation and prompt-audit maintenance from public request lifecycle.
- Removed newsletter scheduler execution from ordinary public GET requests.
- Runtime schema lives in explicit migration 11.
- Public discovery visibility uses the same semantic rule across renderer groups: legacy WQ001–WQ015 OR explicit `website_visibility` approval OR a due `website_publication_schedule` row.
- Direct technically published article URLs remain available/indexable independently from editorial discovery visibility.
- Visibility semantics are regression-tested by `tests/visibility_schedule_smoke.py`.
- Migration 12 is applied in production and contains:
  - `idx_quote_pages_project_locale_status`
  - `idx_content_approvals_visibility`
  - `idx_newsletter_deliveries_daily`
- Migration 12 is idempotent and CI-tested by `tests/query_index_smoke.py`.
- One-time migration mutation route/workflow were removed after successful production readback.
- Sitemap reads are now truly read-only in production; the former `submitAllPublished()` call on every sitemap GET was removed and independently verified live.
- Retired WQ017 future-preprod/export and WQ021/WQ022 correction mutation routes were removed from the production worker after their historical jobs were completed.
- Corresponding retired helper modules were removed after runtime references were eliminated.
- Baseline before the full post-fix 24h window: `327.48k rows read`, `0 rows written` (Cloudflare D1 dashboard, 2026-09-15 morning Europe/Stockholm).

Acceptance gate still open:

- Compare a full post-fix 24h D1 window before declaring P0 D1 optimization closed.

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

- Do not call scheduled newsletter automation fully verified until at least one real GitHub `schedule` event for `Runtime scheduler` is observed and both production POSTs succeed.

## Security

Completed/verified:

- Cloudflare Access on admin/ops surfaces.
- Backend JWT signature verification through Cloudflare JWKS.
- Service-token automation works without weakening anonymous access.
- Application-layer protection remains effective on the `pages.dev` hostname.
- HSTS, `nosniff`, referrer policy, restrictive Permissions-Policy, `X-Frame-Options: DENY`, COOP, and CSP.
- CodeQL runs on main and has been green in verified runs.
- Bot Fight Mode was disabled because it incorrectly challenged legitimate GitHub automation before Access.
- Protected runtime-config readback exposes only presence booleans, never secret values.

Live production configuration readback on 2026-09-15:

- `CF_ACCESS_AUD` / `ACCESS_AUD`: **not configured**.
- `ADMIN_EMAILS` / `ADMIN_EMAIL`: **not configured**.
- `CF_ACCESS_TEAM_DOMAIN` / `ACCESS_TEAM_DOMAIN`: **not configured**.
- `ADMIN_TOKEN`: configured.

Therefore current code still necessarily relies on the existing human-admin and Access-issuer fallbacks. These fallbacks must not be removed until the Cloudflare variables are present and read back successfully.

Manual hardening still required as one consolidated Cloudflare session:

1. Restrict Pages preview deployments.
2. Configure exact `CF_ACCESS_AUD`.
3. Configure explicit `ADMIN_EMAILS`.
4. Configure explicit `CF_ACCESS_TEAM_DOMAIN`.
5. Re-read production configuration; only then remove/fail-close code fallbacks and make audience validation mandatory.

Do not recreate the existing shared Cloudflare service token.

## UX / web design

Completed:

- Localized homepage microcopy/category labels across current renderer groups.
- Visible keyboard focus treatment and >=44px interactive targets where relevant.
- `prefers-reduced-motion` handling.
- Multilingual responsive typography with overflow wrapping/hyphenation and fluid mobile hero sizing.
- RTL positioning adjustments in the shared stylesheet.
- Production smoke coverage for `sv`, `es`, `it`, `pt`, `id`, `tr`, and `ar` home renderers.

Remaining design/UX work:

- Complete 13-locale component unification so `it`, `pt`, `id`, `tr`, and `ar` no longer depend on parallel renderer modules.
- Run a formal WCAG/contrast and browser/device visual QA pass.
- Add/verify skip-to-content and complete ARIA state handling for toggle menus.
- Consolidate homepage/archive/category/author rendering into one shared locale renderer to eliminate future translation/visibility drift.

## Visibility consistency

**Fixed.** `site_v2`, `new_locales_site`, and `locale13_site` treat a due `website_publication_schedule` row as discovery-visible at/after `scheduled_for`, as required by MASTER_RULES. Direct article/indexability behavior remains independent. CI contains an explicit regression test for this contract.

## Workflow / legacy cleanup

Completed:

- Obsolete WQ013 video probe no longer runs on every push; it is manual-only.
- Superseded Cloudflare diagnostic workflows were removed after production smoke covered their probes.
- A large set of completed one-off WQ-specific mutation/export/readback/install workflows was inspected and removed rather than left retriggerable.
- Historical hard-coded follower sync jobs were removed to prevent stale metrics from overwriting current values.
- Old newsletter installer/repair jobs that could reintroduce request-lifecycle behavior were removed.
- Retired `future-preprod.yml` and its WQ017 mutation path were removed.
- Current persistent set and deletion rationale are documented in `ops/WORKFLOW_INVENTORY_2026-09-15.md`.

Still retained deliberately:

- `automation-v3-check.yml`
- `production-smoke.yml`
- `security-scan.yml`
- `newsletter-scheduler.yml`
- `p0-production-verification.yml`
- `quote-detail-readback.yml`
- `start-pages-readback.yml`

Do not remove current prepared-topic/quality routes for WQ018–WQ026 until the generic production pipeline fully replaces them and D1 readback confirms no dependency.

## Current priority order

1. Verify a real scheduled `Runtime scheduler` run.
2. Complete the one-session Cloudflare manual hardening for preview restrictions + explicit Access/admin variables.
3. Capture the full 24h D1 post-fix readback and compare against the `327.48k` baseline.
4. Accessibility hardening and formal visual QA.
5. Renderer consolidation / generic production-pipeline cleanup.
6. Staging + backup/restore drill.
7. SEO structured-data consolidation, performance budget and monitoring trends.
