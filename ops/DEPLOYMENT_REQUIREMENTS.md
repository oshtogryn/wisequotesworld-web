# Wise Quotes World automation-v3 — Cloudflare requirements

Required runtime bindings for the new Worker:

- `DB` — existing Wise Quotes World Cloudflare D1 database.
- `ASSETS` — existing Pages static assets binding.
- `MEDIA` — Cloudflare R2 bucket `wisequotesworld-media` for canonical Wise Quotes World media.
- `ADMIN_TOKEN` — encrypted secret used by `/admin/` and `/api/admin/*`.
- `AI` — Cloudflare Workers AI binding. It is required for automatic Pinterest image generation and later multilingual AI features.

## AI image generation

Primary automatic Pinterest image path:

`D1 content_version -> pinterest_creatives -> ai_generation_jobs -> env.AI -> R2 MEDIA -> media_inbox -> visual QA -> approval`

Initial image model: `@cf/black-forest-labs/flux-1-schnell` for low-cost/fast generation. The model is configurable and may later be upgraded to a higher-quality Workers AI image model after quality/cost testing.

Rules:
- Pinterest creative is portrait 2:3, target 1000x1500.
- Prompt must preserve the same semantic scene/story as the corresponding video concept.
- Exact localized quote and verified author attribution rules remain mandatory.
- Generated image is stored in R2 and linked in D1.
- Generation success does not mean approval: `qa_status` remains pending until visual QA.
- If AI generation fails, the job is retained with error state and can be retried; no fake success state is written.

## Planned later integrations

- Public multilingual `Ask Wise Quotes` using Workers AI / AI Gateway after database-first website cutover.
- Telegram bot token + webhook secret for private admin uploader and public multilingual bot.
- Metricool integration credentials only if scheduling is moved behind Worker orchestration.

## Security

- Never commit tokens/secrets to GitHub.
- Admin API returns 401 unless exact Bearer `ADMIN_TOKEN` is supplied.
- Public chatbot and admin/upload bot are separate surfaces.
- R2 public access remains disabled; public delivery should go through controlled Worker routes or approved website assets.

Current branch: `automation-v3`.
Do not merge/deploy to production until D1 migrations, AI/R2 bindings, and two-content validation are confirmed in preview/test deployment.
