# Wise Quotes World — Generic website publication engine

Status: ACTIVE
Effective from: WQ016

## Purpose
Publish prepared Wise Quotes World website content from D1 without topic-specific deploy code.

## Scope
Website publication only. It does not mark social posts as scheduled/published and does not bypass Metricool/Planner or media QA gates.

## Canonical flow
`D1 content + 13 localizations -> website readiness -> quote_pages published -> dynamic /xx/start/ -> sitemap -> IndexNow`

## Readiness endpoint
`GET /api/admin/publication/<content_id>/website/readiness`

Requires existing `ADMIN_TOKEN` bearer authentication.

Checks all 13 website locales:
- latest content version exists;
- localized title/text exists;
- `language_check_status = native_qa_pass`;
- quote page exists;
- valid slug;
- SEO title;
- meta description;
- substantive reflection floor;
- for `verbatim`: verified attribution, author, original wording and source URL.

## Publication endpoint
`POST /api/admin/publication/<content_id>/website`

Publication is blocked with a readiness report if any locale fails its gate.

On success:
- all 13 `quote_pages` become `published`;
- `published_at` is preserved when already set, otherwise created;
- website versions are retained as website-ready without falsely marking social scheduling complete;
- dynamic start pages automatically resolve the latest published content from D1;
- dynamic sitemap automatically includes the new article/taxonomy URLs;
- the Worker schedules IndexNow submission after the successful admin mutation.

## Hard rule
Do not create `wq016_finalize.js`, `wq017_finalize.js`, etc. for ordinary future topics. Topic-specific publication code is allowed only for an exceptional migration and must not become the normal path.

## Existing topics
WQ011–WQ015 remain untouched for historical/readback compatibility. Do not migrate them destructively just to make old files disappear.
