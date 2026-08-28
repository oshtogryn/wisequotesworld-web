# Wise Quotes World automation-v3 — Cloudflare requirements

Required runtime bindings for the new Worker:

- `DB` — existing Wise Quotes World Cloudflare D1 database.
- `ASSETS` — existing Pages static assets binding.
- `MEDIA` — Cloudflare R2 bucket for canonical Wise Quotes World media.
- `ADMIN_TOKEN` — secret used by `/admin/` and `/api/admin/*`.

Planned later secrets/bindings:
- AI provider binding/key for multilingual Ask Wise Quotes.
- Telegram bot token + webhook secret for private admin uploader and public multilingual bot.
- Metricool integration credentials if scheduling is moved behind Worker orchestration.

Security:
- Never commit tokens/secrets to GitHub.
- Admin API returns 401 unless exact Bearer `ADMIN_TOKEN` is supplied.
- Public chatbot and admin/upload bot are separate surfaces.

Current branch: `automation-v3`.
Do not merge/deploy to production until DB migrations and bindings are confirmed in a preview/test deployment.
