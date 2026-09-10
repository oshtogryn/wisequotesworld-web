# Wise Quotes World — technical audit status

Updated: 2026-09-10
Branch: `audit-hardening-20260910`
Canonical operating rules: `ops/MASTER_RULES.md`

## Executive status

### P0 — critical security

**Implemented in code / confirmed from project evidence**

- Cloudflare Access is the primary browser/admin identity layer for `/admin/*`, `/ops/*`, `/api/admin/*`.
- MFA/biometric sign-in has been exercised in production.
- `ADMIN_TOKEN` remains backend-only fallback for non-browser automation.
- Central admin gate lives in `lib/admin_auth.js`; top-level Worker gate protects admin/ops surfaces.
- Central security headers are emitted by `lib/security_headers.js`.
- Cloudflare edge protections already configured: HTTPS enforcement, TLS 1.2 minimum, TLS 1.3, Bot Fight Mode, WAF rules, newsletter POST rate limit.
- Public health output is minimized; detailed binding diagnostics are admin-only.
- CodeQL workflow exists.

**Still requires production/account readback before P0 can be marked complete**

1. Anonymous/private-browser proof that admin/ops/API content is never exposed before Cloudflare Access or the Worker gate.
2. Real-browser response-header proof for HSTS/CSP/nosniff/referrer/permissions/frame protection.
3. Protect Pages preview deployments as well as the public admin custom-domain routes. Preview deployment URLs are public by default unless Access is enabled for previews.
4. GitHub `main` is currently unprotected and repository rulesets are empty. Add branch/ruleset protection in GitHub UI or through an admin-capable integration.
5. Secret values cannot be enumerated by the current GitHub connector. Confirm Cloudflare/GitHub secret stores and rotate anything found in history/logs.

Do not weaken Bot Fight/WAF to make synthetic curl checks pass.

### P1 — backend/platform

**Already present / partially present**

- D1 is canonical operational data.
- R2 is canonical binary media storage; D1 stores media metadata.
- Content workflow/readiness logic, explicit approvals and database publication guardrails already exist.
- `audit_log` exists in schema v2, but it is generic and does not yet provide complete status-transition history with verification/source semantics.
- `media_inbox` already stores R2 key, MIME, size, dimensions/duration fields and SHA-256 slot, but manual upload did not calculate the hash or reject duplicate binaries.
- Publication attempts and analytics snapshots exist.
- Newsletter has subscriber status, cadence, duplicate-reservation semantics, delivery log and masked-email admin output.
- Website publication and social scheduling are correctly separate concepts.
- Author/category pages and multilingual taxonomy SEO already exist in partial form.

**Not complete**

- Staging environment with separate D1/R2/secrets and Access protection.
- Formal daily/weekly/monthly encrypted backup pipeline and restore drill.
- Cleanup of historical one-off GitHub Actions and replacement with a small canonical workflow set.
- Queue-based newsletter execution. Current scheduler can run from normal request traffic and sends within that request execution path.
- Bounce/complaint suppression lifecycle.
- Full status-transition audit trail.
- Automatic media metadata/profile validation and duplicate hashing on manual upload.
- Unified job-run/health observability and alerts.
- Expanded quote provenance model with source quality/confidence, translation/public-domain metadata and explicit verbatim/paraphrase/attributed/original-reflection classification.
- Full modular source-tree migration (`src/routes`, `src/db`, `src/services`, `src/jobs`, middleware) and utility deduplication.

### P2 — discovery/SEO/product quality

**Already present / partial**

- 13 website locales are implemented.
- Quote detail pages, archive/taxonomy surfaces, canonical URLs, language-specific metadata and hreflang/x-default exist for important dynamic surfaces.
- Dynamic sitemap includes quote pages and taxonomy URLs; quote alternates are emitted.
- Author/category collection pages exist, but URL taxonomy and discovery UX do not yet match the target `/authors/` + `/topics/` information architecture.
- `/xx/start/` is server-rendered by the Worker rather than being JS-only; localized text, links, newsletter and social surfaces are rendered in HTML.
- GA4 + Metricool are integrated.

**Not complete**

- Discovery navigation: Discover / Authors / Topics / Latest / Popular / Random Quote.
- Standardized topic set and dedicated topic index pages.
- Quote of the day and random quote.
- Related/recommendation engine beyond current taxonomy links.
- Per-locale sitemap files + sitemap index.
- Complete structured-data audit across every page type.
- Lighthouse CI and Core Web Vitals budgets.
- Formal GDPR retention/deletion policy and newsletter privacy artifacts audit.
- WCAG 2.2 AA audit.
- End-to-end topic → social publication → website traffic → follower/subscriber attribution model.

## Work started in this audit branch

1. Add a non-destructive P1 schema migration for status history, provenance, media validation, newsletter events/suppression, job runs and health snapshots.
2. Add shared HTTP/validation helpers for new code and begin retiring repeated response helpers incrementally.
3. Add deterministic media hashing + duplicate detection to manual R2 uploads.
4. Add a canonical CI workflow that performs syntax/security hygiene checks without deploying production.
5. Keep production unchanged until P0 manual/account checks are resolved and the branch is reviewed.

## Infrastructure actions that cannot be completed from this connector

- Cloudflare Pages: protect preview deployments with Access; create staging project/bindings/queue/consumer Worker; configure Cron; configure backup bucket/lifecycle; create alerts.
- GitHub repository administration: branch protection/ruleset, secret scanning/push protection settings if not already enabled, Dependabot security configuration if repository UI permissions are required.
- Secret-value audit/rotation: secret stores are intentionally not readable through this connector.

## Promotion gate

Do not merge this hardening branch to `main` until:

1. CI passes.
2. P0 anonymous/header browser readback is captured.
3. Preview deployment Access is enabled.
4. Database migration is first validated against a staging D1 database, not production.
5. The Cloudflare Pages production-branch deployment policy is changed so production is not deployed on every incidental commit.
