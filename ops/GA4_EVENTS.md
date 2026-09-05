# Wise Quotes World — GA4 funnel events

Status: ACTIVE
Effective: 2026-09-05
Measurement ID: `G-WP83P40P2R`

## Runtime
All public locale HTML responses are instrumented centrally by `_worker.js` via `lib/analytics_runtime.js`.
No e-mail address, form contents, or other subscriber PII is sent to GA4.

## Custom events

- `start_to_article`
  - Fires when a visitor clicks from `/<locale>/start/` to a localized quote article.
  - Params: `locale`, `source_path`, `destination_path`.

- `social_click`
  - Fires on outbound clicks to recognized social networks (Facebook, Instagram, Threads, TikTok, YouTube, Pinterest, Telegram, X/Twitter).
  - Params: `locale`, `source_path`, `network`, `destination_host`.

- `newsletter_signup`
  - Fires only after `/api/newsletter/subscribe` returns a successful JSON response with `ok: true`.
  - Fires at most once per page load.
  - Params: `locale`, `source_path`.
  - Never send subscriber e-mail to GA4.

- `related_quote_click`
  - Fires when a visitor on a localized quote article clicks another localized quote article.
  - Params: `locale`, `source_path`, `destination_path`.

- `author_hub_click`
  - Fires on internal clicks to `/<locale>/author/<slug>/`.
  - Params: `locale`, `source_path`, `destination_path`.

- `topic_hub_click`
  - Fires on internal clicks to `/<locale>/category/<slug>/`.
  - Params: `locale`, `source_path`, `destination_path`.

## Reporting intent
Use these events to evaluate the funnel:
`social/profile traffic -> /<locale>/start/ -> article -> author/topic/related content -> newsletter`.

Break down by locale and source path where useful. Do not mark every click as a conversion. Newsletter signup is the strongest current on-site conversion event; other events are engagement/funnel diagnostics.
