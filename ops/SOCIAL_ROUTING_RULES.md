# Wise Quotes World — Social Routing Rules

Status: CANONICAL
Effective: 2026-08-29

## Core CTA rule
Wise Quotes World currently has no Telegram destination. Every social post that needs a deeper-reading CTA must lead directly to the corresponding Wise Quotes World article on `https://wisequotesworld.com` in the SAME language as the post.

Never send a user to the generic homepage when a localized quote/article page exists.
Never send a Ukrainian post to an English article, etc.

Canonical article URL pattern:
`https://wisequotesworld.com/<locale>/quotes/<localized-slug>/`

Locales: `uk`, `ru`, `pl`, `en`, `sv`, `de`, `es`, `fr`.

## Platform style
Facebook: quote + natural reflection/context + one engagement question when appropriate + localized article CTA/link + compact hashtags. Avoid hashtag walls.
Instagram: shorter emotional/editorial copy + localized article CTA/link + up to 5 relevant hashtags including the language brand hashtag.
Threads: natural conversational text; usually no hashtag wall; localized article link when useful. Keep it human, not SEO-looking.
TikTok: concise hook/quote + localized article CTA/link when clickable destination is supported by the publishing surface; compact hashtags.
YouTube Shorts: localized title; description contains context + localized article URL + compact hashtags including `#Shorts`.
Pinterest: localized SEO title + natural SEO description + destination URL MUST be the corresponding localized article page. Pin image and destination language must match.

## Brand hashtags
uk `#WiseQuotesWorldUA`
ru `#WiseQuotesWorldRU`
pl `#WiseQuotesWorldPL`
en `#WiseQuotesWorldEN`
sv `#WiseQuotesWorldSV`
de `#WiseQuotesWorldDE`
es `#WiseQuotesWorldES`
fr `#WiseQuotesWorldFR`

## Hashtag policy
Use only relevant localized hashtags. Prefer 3–5 on Facebook/Instagram/TikTok/YouTube descriptions where appropriate. Threads should normally use zero or very few hashtags. Pinterest keywords belong primarily in natural title/description rather than hashtag stuffing.

## Link generation
Article links are generated from `quote_pages` in D1, not hard-coded as an operational source. Platform copy stores or resolves the matching `language_code` article URL. If an article page is not yet published, the content package is NOT publication-ready.

## Publication readiness gate
A language is ready for Metricool only when:
1. localized quote passed semantic + native-naturalness QA;
2. full Gemini prompt exists;
3. Pinterest image prompt exists;
4. required platform copy exists;
5. localized article page exists in D1 and has a canonical URL;
6. social copy points to that same-language article URL where the platform supports/benefits from a link;
7. video and Pinterest image are uploaded and QA-approved;
8. content approval is approved.

FR remains active for website + Pinterest. FR social copy is prepared and stored, but FB/IG/Threads/TikTok/YouTube external scheduling stays disabled until FR accounts are connected.