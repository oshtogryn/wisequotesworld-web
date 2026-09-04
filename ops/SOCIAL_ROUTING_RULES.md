# Wise Quotes World — Social Routing Rules

Status: CANONICAL
Effective: 2026-09-04

## Core funnel
Wise Quotes World uses the localized `/start/` page as the permanent profile/bio destination for platforms where a post/Short/Reel cannot reliably carry a clickable external article link.

Canonical profile URL pattern:
`https://wisequotesworld.com/<locale>/start/`

Every localized `/start/` page must keep this order:
1. primary CTA → latest full same-language article;
2. secondary CTA → all quotes/reflections in that language;
3. official website/social channels;
4. newsletter/contact/language switcher.

The primary article button must always be updated to the newest published same-language article. Never point it to another language. The `/start/` URL itself remains stable in social profiles, so profile links do not need to be changed for each new topic.

Locales: `uk`, `ru`, `pl`, `en`, `sv`, `de`, `es`, `fr`, `it`, `pt` (pt-BR), `id`, `tr`, `ar`.

## Platform routing — HARD
- Facebook: include the exact same-language article URL directly in the post. It is the clickable article funnel.
- Threads: include the exact same-language article URL directly in the post when appropriate. It is the clickable article funnel.
- Instagram Reels: do not put the raw article URL in the caption. Use a natural localized CTA equivalent to “Read the full article — link in profile”. Instagram profile link = `https://wisequotesworld.com/<locale>/start/`.
- YouTube Shorts: do not put the raw article URL in the Shorts description. Use a natural localized CTA equivalent to “Read the full article — link in profile”. YouTube channel profile link = `https://wisequotesworld.com/<locale>/start/`.
- TikTok: if the account supports a clickable website/profile link, profile link = `https://wisequotesworld.com/<locale>/start/` and copy may use the localized “link in profile” CTA. If the account does not support a clickable website link, never falsely claim that it does; keep a short visible Wise Quotes World locale address/manual visit CTA instead.
- Pinterest: destination link remains the exact same-language article URL, not `/start/`.
- Never send a locale to the generic homepage or another language when the correct localized destination exists.

## Start-page follower counters — HARD
For connected social locales, `/xx/start/` displays current follower/subscriber counts under Facebook, Instagram, Threads, TikTok and YouTube buttons. Pinterest is excluded from per-button follower text. Counts are refreshed by the existing Metricool follower-sync workflow and must not be removed when editing the start-page layout. New/prepared locales without connected social accounts show the platform as in preparation instead of a fake zero count.

## Social copy style
Facebook: substantive localized post + direct same-language article link + compact relevant hashtags.
Instagram: localized emotional/editorial copy + profile-link CTA + up to 5 relevant hashtags.
Threads: natural conversational copy + direct localized article link when useful; avoid hashtag walls.
TikTok: concise localized copy; profile-link CTA only when the account actually has a clickable website link, otherwise visible manual locale address.
YouTube Shorts: localized title and substantive description + profile-link CTA; no raw external article URL in Shorts description.
Pinterest: localized SEO title + natural description + exact localized article destination.

## Hashtag policy
Maximum 5 hashtags in any social post/caption. Use only relevant localized hashtags. `#WiseQuotesWorld` may be retained when appropriate. Avoid hashtag walls.

## Link generation
Exact article links come from D1 `quote_pages`; do not hard-code article URLs as the operational source. `/start/` profile URLs are stable by locale. When a new article becomes the newest published item, the primary CTA on all 13 localized start pages must resolve to that newest same-language article.

## Publication readiness gate
A connected social locale is ready for Metricool only when:
1. localized quote passed semantic + native-naturalness QA;
2. full Gemini prompt exists;
3. Pinterest image prompt exists where Pinterest is connected;
4. required platform copy exists;
5. localized article page exists in D1 and has a canonical URL;
6. platform routing follows the rules above;
7. video/Pinterest media are uploaded and QA-approved;
8. content approval is approved;
9. the locale `/start/` profile funnel remains valid and points its primary CTA to the latest same-language published article.
