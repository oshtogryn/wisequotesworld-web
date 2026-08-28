Automation-v3 active checkpoint — 2026-08-28 21:xx Europe/Stockholm.

Completed:
- Cloudflare project bindings prepared: DB, MEDIA, ADMIN_TOKEN.
- Preview deployment path confirmed working on automation-v3.
- schema_v2 compatibility reviewed; content IDs are TEXT.
- migration5 corrected for TEXT FK compatibility and duplicate-column risk.
- migration6 added quote_pages + content_approvals.
- migration7 added required-output matrix and hard publication/source/media guardrails.
- Worker/Admin API supports schema inspection, controlled migrations, adapted/verbatim content, source evidence, localized versions, approvals groundwork, and R2 Media Inbox.
- French is a first-class prepared locale but remains social-publishing disabled until channels exist.

Current gate:
1. newest preview must expose /api/health and /admin with current branch code;
2. run schema preflight;
3. apply v3-v7 in order only if preflight is compatible;
4. create WQ006 adapted/no-author and WQ007 verified verbatim test records;
5. verify 8 language versions, source rules, website pages, media, approvals;
6. only then merge PR #1 into main.

Production main remains untouched until the gate passes.
