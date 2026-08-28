# Wise Quotes World — database-first cutover checklist

## Preview gate
- [ ] newest automation-v3 deployment is green
- [ ] `/api/health` reports `db=true`, `r2=true`, `ai=true`, `admin_secret=true`
- [ ] `/admin/` loads with noindex/nofollow
- [ ] unauthorized `/api/admin/*` returns 401
- [ ] authorized `/api/admin/schema` reads the actual D1 schema

## Migration gate
- [ ] base schema v2 exists
- [ ] migration preflight rejects unsafe partially-applied v3 instead of blindly rerunning ALTER TABLE statements
- [ ] `projects.id='wisequotesworld'` exists before migration4 seeds project_languages
- [ ] v3 applies without duplicate columns
- [ ] v4 adds French and database-only rules
- [ ] v5 adds source verification fields/evidence with TEXT content IDs
- [ ] v6 adds quote_pages and content_approvals with NULL-safe approval uniqueness
- [ ] v7 seeds required outputs and hard guardrails
- [ ] v8 adds ai_generation_jobs and Pinterest AI-generation rules
- [ ] v9 seeds runtime, attribution, visual-QA and free-AI cost-control rules
- [ ] v10 installs D1 triggers for attribution cleanup, verbatim verification, 8-language approval and publication approval
- [ ] schema/rule/trigger re-read confirms expected state through v10

## D1 hard-guardrail gate
- [ ] adapted insert/update cannot retain author_name/source_name/author_source/source_work/source_date
- [ ] adapted attribution_status resolves to `not_required`
- [ ] verbatim cannot transition to `verified` without complete verified source evidence
- [ ] content approval cannot become `approved` before all 8 language versions exist
- [ ] verbatim content approval additionally requires verified attribution + evidence
- [ ] publication INSERT with status scheduled/publishing/published fails without approved content
- [ ] publication UPDATE to scheduled/publishing/published fails without approved content
- [ ] approved content permits publication state transition

## R2 + Workers AI gate
- [ ] `MEDIA` R2 binding is present and public R2 access stays disabled
- [ ] `AI` Workers AI binding is present
- [ ] Pinterest model resolves without paid OpenAI API dependency
- [ ] upload test image/video to `MEDIA`
- [ ] D1 `media_inbox` record created
- [ ] failed DB insert rolls R2 object back
- [ ] unknown content ID is rejected before upload
- [ ] AI generation job is recorded before/while generation runs
- [ ] successful Pinterest generation writes media to R2 and links `media_inbox` + `pinterest_creatives`
- [ ] generated creative remains `qa_status=pending`; generation success never auto-approves publication
- [ ] actual generated image dimensions are inspected/stored accurately; target Pinterest format remains 2:3 (1000x1500 target)
- [ ] exact quote text is visually checked; unreliable AI-rendered text cannot pass QA automatically

## WQ006 adapted test
- [ ] no author or attribution source-name stored/rendered
- [ ] author absent from all outputs
- [ ] 8 language versions present
- [ ] 8 video prompts present
- [ ] 8 Pinterest 2:3 creatives preserve video semantic concept
- [ ] 8 Pinterest AI jobs complete into R2/Media Inbox and remain pending visual QA until checked
- [ ] 8 website quote pages prepared, including FR
- [ ] approval required before scheduling

## WQ007 verbatim test
- [ ] canonical German original stored
- [ ] Friedrich Nietzsche stored as author
- [ ] source/work/locator/evidence stored
- [ ] verification cannot be approved without author, original language, original text, source metadata and locator
- [ ] `attribution_status=verified` only after evidence verification
- [ ] all 7 translations derived from German original
- [ ] 8 language versions + prompts + Pinterest + website pages prepared
- [ ] 8 Pinterest AI jobs complete and remain pending visual QA until checked
- [ ] publication blocked if verification is removed/unverified

## Approval + publication gate
- [ ] Admin supports explicit approve/reject/pending workflow
- [ ] final approval validates required content/source/media state
- [ ] no publication can transition to scheduled without approval
- [ ] publisher records external platform ID, status, scheduled time and timezone after write/readback
- [ ] analytics collection can attach platform metrics to the publication record
- [ ] FR website + Pinterest enabled; FR Facebook/Instagram/Threads/TikTok/YouTube remain disabled until their channels exist

## Production gate
- [ ] no unresolved preview errors
- [ ] no schema/data loss
- [ ] WQ006 end-to-end test passes
- [ ] WQ007 end-to-end test passes
- [ ] PR #1 mergeable
- [ ] merge to main
- [ ] production deployment green
- [ ] production health/admin smoke test
- [ ] only after production verification retire Google Sheets from operational workflow
