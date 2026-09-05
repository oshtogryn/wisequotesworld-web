# Wise Quotes World — SEO implementation

Status: ACTIVE IMPLEMENTATION
Effective: 2026-09-05

## Goal
Build organic search visibility across all 13 website locales by combining indexable long-tail quote articles, author/topic hubs, strong internal links, multilingual signals, structured data, sitemaps and fast search-engine discovery.

## Active locales
`uk`, `ru`, `pl`, `en`, `sv`, `de`, `es`, `fr`, `it`, `pt-BR`, `id`, `tr`, `ar`.

## URL architecture
- Locale home: `/<locale>/`
- Quote archive: `/<locale>/quotes/`
- Quote article: `/<locale>/quotes/<localized-slug>/`
- Topic hub: `/<locale>/category/<category-slug>/`
- Author hub: `/<locale>/author/<localized-author-slug>/`
- Profile funnel: `/<locale>/start/`

## Technical SEO requirements
1. Every public page has a self-canonical URL.
2. Quote articles expose hreflang alternates for all published translations and `x-default`.
3. `pt` is exposed as `pt-BR` in HTML/hreflang/schema language values.
4. Arabic pages use `lang="ar"` and RTL presentation.
5. Quote articles use `Article` structured data plus `BreadcrumbList`.
6. Author/topic/archive pages are indexable collection pages.
7. Quote articles link internally to their archive, topic, verified author when applicable and related quotes.
8. `robots.txt` allows public content and points to `https://wisequotesworld.com/sitemap.xml`; admin/API/ops paths are disallowed.
9. `sitemap.xml` is generated from D1 and contains locale homes, quote archives, start pages, author hubs, topic hubs and all published quote articles. Quote entries include hreflang alternates.
10. Search-engine discovery uses IndexNow for newly published/updated public URLs.

## IndexNow
Key location is served by the production Worker.

Protected submission endpoint:
`POST /api/admin/seo/indexnow`

Authentication: existing `ADMIN_TOKEN` bearer token.

Payload may contain:
`{"urls":["https://wisequotesworld.com/en/quotes/.../"]}`

If `urls` is omitted, the endpoint submits all currently published quote pages from D1, up to the IndexNow batch limit.

Mandatory publication rule: after a new article is made public in D1, its same-language canonical URL must be included in the next IndexNow submission. A 13-language content publication should submit all newly published canonical URLs as one batch after D1 write success.

## Search Console / Webmaster tools
Google Search Console and Bing Webmaster Tools are external account-level services. Their property verification and sitemap registration are a one-time account operation, not stored as source-of-truth content in GitHub.

Required sitemap to register:
`https://wisequotesworld.com/sitemap.xml`

## Optimization loop
Use Google Search Console queries/pages to identify pages receiving impressions at positions roughly 8–40. Improve those pages first by refining localized SEO title/H1/meta, article usefulness and internal links while preserving quote/source accuracy.

Do not keyword-stuff. Prefer native long-tail search intent, for example author + quote + meaning/topic combinations.
