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
- Worker schema status and controlled migrations cover v3-v10; partial-v3 replay and missing project row are fail-closed.
- Adapted API paths clear attribution fields; verbatim verified evidence requires author/original language/locator/verification notes/source title-or-URL.
- Explicit content approval API/UI requires all 8 language versions and verified evidence for verbatim quotes.
- Pinterest generation stores actual dimensions as unknown until inspected, keeps QA pending, and has explicit pending/approved/rejected QA API/UI.
- D1 website page upsert implemented. Published pages require content approval. Public /<locale>/quotes/<slug>/ renders published D1 content with canonical/hreflang; /sitemap.xml is dynamic; static site remains fallback.
- Native Metricool-replacement data plane started in lib/publication_core.js: publication queue, due-items query, scheduling validation, external publish readback, publication-attempt audit log, analytics snapshots and 30-day-style summaries.
- Native analytics summary uses the latest snapshot per publication and then aggregates per platform, avoiding historical snapshot double-counting.
- FR native publishing guard allows FR Pinterest but blocks FR Facebook/Instagram/Threads/TikTok/YouTube until those accounts exist.
- Initial Pinterest model remains @cf/black-forest-labs/flux-1-schnell; no OpenAI API dependency is required.
- GitHub validation workflow checks _worker.js + lib/publication_core.js syntax and runs SQLite D1 migration/guardrail/publication/analytics smoke tests.
- CI run 33216490595 completed successfully on 2026-08-29. Earlier runs 33215872346, 33216101233 and 33216321553 also passed.
- WQ006 adapted/no-author and WQ007 Nietzsche verbatim test definitions are prepared. WQ007 source research is verified; runtime D1 evidence insertion is pending.

Current gate:
1. verify newest Cloudflare automation-v3 preview and /api/health;
2. confirm live DB, MEDIA, ADMIN_TOKEN and AI bindings;
3. inspect live D1 schema and apply v3-v10 only if preflight is compatible;
4. execute WQ006 end-to-end: 8 versions -> AI Pinterest -> R2/Media Inbox -> visual QA -> 8 D1 website pages -> approval;
5. execute WQ007 end-to-end with verified Nietzsche source evidence and 8 direct-from-German versions;
6. add/configure actual platform OAuth/API adapters for native publishing and analytics collection, while keeping Metricool only as fallback until parity is verified;
7. configure the French Pinterest board ID once that board exists;
8. only after runtime + end-to-end tests pass, merge PR #1 into main.

Production main remains untouched until the full gate passes.
