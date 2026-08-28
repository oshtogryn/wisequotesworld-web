Automation-v3 active checkpoint — 2026-08-28 Europe/Stockholm.

Completed:
- Cloudflare architecture prepared for DB, MEDIA, ADMIN_TOKEN and AI bindings.
- Preview deployment path previously confirmed working on automation-v3; newest head still requires runtime verification.
- schema_v2 compatibility reviewed; content IDs are TEXT.
- migration5 corrected for TEXT FK compatibility and duplicate-column risk.
- migration6 adds quote_pages + content_approvals; NULL-language approval uniqueness fixed with expression unique index.
- migration7 adds required-output matrix and hard publication/source/media guardrails.
- migration8 adds ai_generation_jobs and automatic Pinterest-generation rules.
- Worker/Admin API supports schema inspection, controlled migrations, adapted/verbatim content, source evidence, localized versions, R2 Media Inbox and automatic Pinterest generation through Cloudflare Workers AI.
- Pinterest AI flow: content_version -> Workers AI -> R2 MEDIA -> media_inbox -> pinterest_creatives -> visual QA pending. AI generation success never equals approval.
- Initial Pinterest model: @cf/black-forest-labs/flux-1-schnell. No OpenAI API dependency is required.
- French is a first-class prepared locale. Website + Pinterest are intended to operate in FR; other FR social publishing remains disabled until channels exist.
- WQ006 adapted/no-author and WQ007 Nietzsche verbatim test definitions are prepared. WQ007 original/source has been externally verified; runtime D1 evidence insertion is still pending.

Current gate:
1. harden Worker migration preflight against partially applied v3 and verify wisequotesworld project row before migration4;
2. harden adapted content so attribution fields cannot leak when quote_type=adapted;
3. harden verbatim verification requirements and implement final approval gate;
4. verify newest preview exposes current /api/health and /admin;
5. confirm DB, MEDIA, ADMIN_TOKEN and AI bindings in preview;
6. run schema preflight and apply v3-v8 in order only when compatible;
7. create WQ006 + 8 versions, generate 8 Pinterest jobs, verify R2/Media Inbox/QA/quote pages;
8. create WQ007 + verified source evidence + 8 direct-from-German versions, generate Pinterest jobs and verify approval gate;
9. validate publisher/readback/analytics path before production cutover;
10. only then merge PR #1 into main.

Production main remains untouched until the full gate passes.
