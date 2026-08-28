# Wise Quotes World — database-first cutover checklist

## Code/CI gate
- [x] Worker JavaScript passes `node --check`
- [x] D1 schema v2 -> migrations v3-v10 pass SQLite smoke test
- [x] partial-v3 automatic migration replay is blocked
- [x] `projects.id='wisequotesworld'` is required before migration4
- [x] adapted attribution cleanup enforced in Worker + D1
- [x] verbatim verification minimum enforced in Worker + D1
- [x] explicit content approval API/UI implemented
- [x] approval requires all 8 language versions
- [x] publication scheduled/publishing/published states require content approval in D1
- [x] AI target dimensions are not stored as actual media dimensions
- [x] FR website + Pinterest enabled; FR FB/IG/Threads/TikTok/YouTube remain pending until channels exist
- [x] Pinterest visual-QA API/UI supports pending/approved/rejected
- [x] D1 quote-page upsert API/UI implemented
- [x] public `/<locale>/quotes/<slug>/` route renders published D1 quote pages
- [x] dynamic sitemap + hreflang + canonical rendering implemented
- [x] static site remains fallback when a D1 page does not exist

## Preview gate
- [ ] newest automation-v3 deployment is green
- [ ] `/api/health` reports `db=true`, `r2=true`, `ai=true`, `admin_secret=true`
- [ ] `/admin/` loads with noindex/nofollow
- [ ] unauthorized `/api/admin/*` returns 401
- [ ] authorized `/api/admin/schema` reads the actual D1 schema
- [ ] dynamic D1 quote route and sitemap verified against live preview

## Migration gate
- [ ] live D1 base schema v2 exists
- [ ] live schema does not report `partial_v3=true`
- [ ] v3 applies without duplicate columns
- [ ] v4 adds French and database-only rules
- [ ] v5 adds source verification fields/evidence with TEXT content IDs
- [ ] v6 adds quote_pages and content_approvals with NULL-safe approval uniqueness
- [ ] v7 seeds required outputs and hard guardrails
- [ ] v8 adds ai_generation_jobs and Pinterest AI-generation rules
- [ ] v9 adds runtime/cost/text-fidelity rules
- [ ] v10 adds D1 guardrail triggers + final FR website/Pinterest policy
- [ ] schema re-read confirms expected tables/columns/rules/triggers through v10

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
- [x] Admin supports explicit approve/reject/pending workflow
- [x] approval validates 8 language versions and verbatim source state
- [x] no publication can transition to scheduled without approval at D1 level
- [x] Pinterest visual-QA endpoint/UI supports approve/reject after image inspection
- [ ] publisher records external platform ID, status, scheduled time and timezone after write/readback
- [ ] analytics collection can attach platform metrics to the publication record
- [x] FR website + Pinterest policy is explicit; other FR social channels remain disabled until connected

## Website gate
- [x] D1 quote page upsert/API implemented
- [x] public `/<locale>/quotes/<slug>/` reads published quote page from D1
- [x] dynamic sitemap/hreflang/canonical implemented
- [x] static site remains fallback when D1 page does not exist
- [ ] live preview verifies quote-page publishing only after content approval

## Production gate
- [ ] no unresolved preview errors
- [ ] no schema/data loss
- [ ] WQ006 end-to-end test passes
- [ ] WQ007 end-to-end test passes
- [ ] publisher/readback/analytics path validated
- [ ] PR #1 mergeable
- [ ] merge to main
- [ ] production deployment green
- [ ] production health/admin smoke test
- [ ] only after production verification retire Google Sheets from operational workflow
