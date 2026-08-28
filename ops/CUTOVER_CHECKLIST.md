# Wise Quotes World — database-first cutover checklist

## Preview gate
- [ ] newest automation-v3 deployment is green
- [ ] `/api/health` reports `db=true`, `r2=true`, `admin_secret=true`
- [ ] `/admin/` loads with noindex/nofollow
- [ ] unauthorized `/api/admin/*` returns 401
- [ ] authorized `/api/admin/schema` reads the actual D1 schema

## Migration gate
- [ ] base schema v2 exists
- [ ] v3 applies without duplicate columns
- [ ] v4 adds French and database-only rules
- [ ] v5 adds source verification fields/evidence with TEXT content IDs
- [ ] v6 adds quote_pages and content_approvals
- [ ] v7 seeds required outputs and hard guardrails
- [ ] schema re-read confirms expected tables/columns

## R2 gate
- [ ] upload test image/video to `MEDIA`
- [ ] D1 `media_inbox` record created
- [ ] failed DB insert rolls R2 object back
- [ ] unknown content ID is rejected before upload
- [ ] public R2 access stays disabled

## WQ006 adapted test
- [ ] no author stored
- [ ] author absent from all outputs
- [ ] 8 language versions present
- [ ] 8 video prompts present
- [ ] 8 Pinterest 2:3 creatives preserve video semantic concept
- [ ] 8 website quote pages prepared
- [ ] approval required before scheduling

## WQ007 verbatim test
- [ ] canonical German original stored
- [ ] Friedrich Nietzsche stored as author
- [ ] source/work/locator/evidence stored
- [ ] `attribution_status=verified` only after evidence verification
- [ ] all 7 translations derived from German original
- [ ] 8 language versions + prompts + Pinterest + website pages prepared
- [ ] publication blocked if verification is removed/unverified

## Production gate
- [ ] no unresolved preview errors
- [ ] no schema/data loss
- [ ] PR #1 mergeable
- [ ] merge to main
- [ ] production deployment green
- [ ] production health/admin smoke test
- [ ] only after production verification retire Google Sheets from operational workflow
