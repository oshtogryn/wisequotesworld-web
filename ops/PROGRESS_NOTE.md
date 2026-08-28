Automation-v3 active checkpoint — 2026-08-29 Europe/Stockholm.

Completed:
- Cloudflare architecture prepared for DB, MEDIA, ADMIN_TOKEN and AI bindings.
- Preview deployment path previously confirmed working on automation-v3; newest head still requires runtime verification.
- schema_v2 compatibility reviewed; content IDs are TEXT.
- migration5 corrected for TEXT FK compatibility and duplicate-column risk.
- migration6 adds quote_pages + content_approvals; NULL-language approval uniqueness fixed with expression unique index.
- migration7 adds required-output matrix and hard publication/source/media guardrails.
- migration8 adds ai_generation_jobs and automatic Pinterest-generation rules.
- migration9 adds machine-readable runtime/cost/text-fidelity rules using the canonical rules schema.
- migration10 adds D1 triggers enforcing adapted attribution cleanup, complete verbatim evidence, eight-language content approval and publication approval gates; it also finalizes FR website + Pinterest enabled while FR FB/IG/Threads/TikTok/YouTube remain pending.
- Worker schema status and controlled migrations now cover v3-v10.
- Worker refuses automatic migration when partial v3 is detected and refuses migration4 if the wisequotesworld project row is missing.
- Adapted API paths clear author attribution fields; verbatim verified evidence requires author/original language/locator/verification notes/source title-or-URL.
- Explicit content approval API/UI added; approval requires all 8 language versions and complete verified evidence for verbatim quotes.
- Pinterest AI no longer stores target 1000x1500 as actual generated dimensions; actual width/height remain NULL until inspected/transformed.
- Pinterest AI flow remains content_version -> Workers AI -> R2 MEDIA -> media_inbox -> pinterest_creatives -> visual QA pending. AI generation success never equals approval.
- Initial Pinterest model: @cf/black-forest-labs/flux-1-schnell. No OpenAI API dependency is required.
- GitHub validation workflow added: node --check _worker.js + Python SQLite migration/guardrail smoke tests.
- CI run 33215872346 completed successfully on 2026-08-29: Worker syntax PASS and D1 v2->v10/guardrail smoke tests PASS.
- WQ006 adapted/no-author and WQ007 Nietzsche verbatim test definitions are prepared. WQ007 original/source has been externally verified; runtime D1 evidence insertion is still pending.

Current gate:
1. verify newest Cloudflare preview exposes current /api/health and /admin;
2. confirm DB, MEDIA, ADMIN_TOKEN and AI bindings in that preview;
3. read live schema preflight; apply v3-v10 only if compatible;
4. create WQ006 + 8 versions, generate 8 Pinterest jobs, verify R2/Media Inbox/visual QA/quote pages;
5. create WQ007 + verified source evidence + 8 direct-from-German versions, generate Pinterest jobs and verify approval gate;
6. complete/validate dynamic D1 website quote-page delivery and publisher/readback/analytics path;
7. only then merge PR #1 into main.

Production main remains untouched until the full gate passes.
