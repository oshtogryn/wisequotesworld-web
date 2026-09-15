# Wise Quotes World — GitHub Actions workflow inventory

Date: 2026-09-15
Rule: do not bulk-delete. Persistent workflows are kept; one-off/date-scoped workflows are removed only after trigger/dependency review.

## Persistent / keep

- `automation-v3-check.yml` — current CI syntax + D1/index/visibility regression checks.
- `production-smoke.yml` — live production readback after runtime changes and daily smoke.
- `security-scan.yml` — CodeQL/security scan.
- `newsletter-scheduler.yml` — current runtime visibility/newsletter scheduler; keep until a real scheduled event is verified and thereafter as the operational scheduler.
- `follower-refresh-2026-09-09.yml` — potentially recurring operational follower refresh; retain pending separate dependency review.
- `future-preprod.yml` — current pre-production preparation path; retain while prepared-topic flow exists.

## Removed after inspection

- `diagnose-cloudflare-edge-20260911.yml` — superseded by `production-smoke.yml`.
- `diagnose-cloudflare-layer-20260911.yml` — superseded after Bot Fight Mode root cause resolution and production smoke coverage.
- `apply-migration12-once-20260915.yml` — deleted after successful production apply + independent readback.
- `apply-wq019-fullquote-20260907.yml` — completed date-scoped mutation workflow that temporarily modified `_worker.js`; removed to eliminate accidental retrigger risk.
- `apply-wq020-native-copy-fix-20260908.yml` — completed self-triggered one-off fix/readback workflow.
- `apply-manual-social-019-026-20260907.yml` — completed date-scoped temporary-route/D1 mutation workflow.
- `apply-manual-social-019-026-public-once-20260907.yml` — completed date-scoped public one-time route/D1 mutation workflow.

## One-off/date-scoped candidates for later removal after inspection

These names strongly indicate completed migration, correction, export, readback, or installation jobs. They must not be deleted merely from the filename; inspect trigger + current code dependency first.

- `build-plain-db-payload.yml`
- `capture-wq020-export-20260908.yml`
- `enable-brevo-newsletter.yml`
- `expand-to-13-languages.yml`
- `export-wq019-schedule-pack-20260907.yml`
- `finalize-biweekly-newsletter.yml`
- `finalize-static-start-unification.yml`
- `finalize-unify-admin-articles-20260907.yml`
- `fix-13-language-nav.yml`
- `fix-live-visibility-and-followers-20260906.yml`
- `fix-media-range-20260910.yml`
- `fix-wq017-language-qa.yml`
- `force-wq017-compact-export.yml`
- `hotfix-start-analytics-render.yml`
- `install-newsletter-admin.yml`
- `install-pinterest-domain-verify.yml`
- `install-wq017-export.yml`
- `live-newsletter-count.yml`
- `native-qa-five-locales.yml`
- `normalize-wq021-videos-20260910.yml`
- `p0-production-verification.yml`
- `pinterest-description-native-fix-20260909.yml`
- `pinterest-locale-standard-refresh-20260909.yml`
- `prepare-ten-day-buffer-20260910.yml`
- `quote-detail-readback.yml`
- `readback-wq019-production-live-20260907.yml`
- `readback-wq020-production-live-20260908.yml`
- `readback-wq022-production-live-20260911.yml`

## Cleanup acceptance rule

A workflow can be deleted only if all are true:

1. It is not scheduled or needed by current production operations.
2. Its output/state is already canonical in D1/repository/current runtime.
3. No active workflow or runtime module depends on its artifact/side effect.
4. Current CI + production smoke remain green after deletion.

This inventory is intentionally conservative. The goal is to reduce legacy operational surface without deleting recovery/history paths blindly.
