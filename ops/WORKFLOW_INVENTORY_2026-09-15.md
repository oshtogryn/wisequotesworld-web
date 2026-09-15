# Wise Quotes World — GitHub Actions workflow inventory

Date: 2026-09-15
Rule: keep only current operational/QA workflows. One-off/date-scoped patch, mutation, export and installer workflows are removed only after trigger/dependency inspection and production state/readback confirmation.

## Current persistent / keep

- `automation-v3-check.yml` — current CI syntax + D1/index/visibility regression checks.
- `production-smoke.yml` — live production readback after runtime changes and daily smoke.
- `security-scan.yml` — CodeQL/security scan.
- `newsletter-scheduler.yml` — current runtime visibility/newsletter scheduler. Keep; real `schedule` event still needs observation.
- `p0-production-verification.yml` — explicit P0/security verification; retain until P0/manual Cloudflare hardening is closed.
- `quote-detail-readback.yml` — live quote-detail renderer regression readback.
- `start-pages-readback.yml` — live `/start` page/readback coverage.

## Removed after inspection

The following completed/superseded workflows were removed because their effects are already canonical in D1/repository/current runtime, or they were date-scoped one-shot mutation/readback/install jobs whose accidental retrigger would create risk:

- Cloudflare diagnostics: `diagnose-cloudflare-edge-20260911.yml`, `diagnose-cloudflare-layer-20260911.yml`.
- Migration/runtime one-shots: `apply-migration12-once-20260915.yml`, `build-plain-db-payload.yml`, `validate-db-payload.yml`, `runtime-cleanup-code-once-20260915.yml`.
- WQ017/WQ019/WQ020/WQ021–030 one-shots: `force-wq017-compact-export.yml`, `install-wq017-export.yml`, `split-wq017-schedule.yml`, `apply-wq019-fullquote-20260907.yml`, `apply-wq020-native-copy-fix-20260908.yml`, `capture-wq020-export-20260908.yml`, `split-wq020-readback-20260908.yml`, `export-wq019-schedule-pack-20260907.yml`, `prepare-ten-day-buffer-20260910.yml`, `normalize-wq021-videos-20260910.yml`, `readback-wq019-production-live-20260907.yml`, `readback-wq020-production-live-20260908.yml`, `readback-wq022-production-live-20260911.yml`.
- Manual-social/Pinterest one-shots: `apply-manual-social-019-026-20260907.yml`, `apply-manual-social-019-026-public-once-20260907.yml`, `pinterest-description-native-fix-20260909.yml`, `pinterest-locale-standard-refresh-20260909.yml`, `install-pinterest-domain-verify.yml`.
- Newsletter rollout/repair one-shots: `enable-brevo-newsletter.yml`, `finalize-biweekly-newsletter.yml`, `install-newsletter-admin.yml`, `start-newsletter-python-verification.yml`, `live-newsletter-count.yml`.
- Locale/admin/site rollout one-shots: `expand-to-13-languages.yml`, `fix-13-language-nav.yml`, `finalize-static-start-unification.yml`, `finalize-unify-admin-articles-20260907.yml`, `unify-admin-articles-nativeqa-20260907.yml`, `native-qa-five-locales.yml`.
- Historical fixes/readbacks: `fix-live-visibility-and-followers-20260906.yml`, `follower-refresh-2026-09-09.yml`, `sync-start-runtime-followers.yml`, `fix-media-range-20260910.yml`, `fix-wq017-language-qa.yml`, `hotfix-start-analytics-render.yml`.
- Retired future-preprod path: `future-preprod.yml`; its old WQ017 mutation route and helper module were removed after production readback confirmed the replacement runtime remained healthy.

## Runtime cleanup tied to workflow cleanup

Production worker cleanup removed retired imports/routes for:

- WQ017 schedule export;
- old WQ021/WQ022 correction route;
- old WQ017 future-preprod mutation route.

The corresponding retired modules were removed after current runtime references were eliminated:

- `lib/future_preprod.js`
- `lib/wq017_schedule_export.js`
- `lib/wq021_030_prompt_status_fix_20260911.js`

The sitemap GET path is now read-only and no longer triggers a full IndexNow submission. Production readback observed `x-wqw-sitemap-mode: read-only`.

## Cleanup acceptance rule

A workflow/module is removable only if all are true:

1. It is not scheduled or needed by current production operations.
2. Its required output/state is already canonical in D1/repository/current runtime.
3. No active runtime/workflow depends on it.
4. Current CI/production smoke remains green after removal.

Do not remove current prepared-topic/quality runtime paths merely because they reference older WQ IDs; they may still be the active operational bridge for prepared WQ018–WQ026 until the generic pipeline fully replaces them.
