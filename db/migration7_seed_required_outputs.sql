-- Wise Quotes World migration7 — required outputs + workflow guardrails
-- 2026-08-28
PRAGMA foreign_keys=ON;

-- Seed required output matrix for every prepared locale.
INSERT OR IGNORE INTO required_outputs(project_id,output_key,platform_key,language_code,required,active)
SELECT 'wisequotesworld',o.output_key,o.platform_key,l.code,1,1
FROM languages l
JOIN (
  SELECT 'localized_quote' AS output_key,NULL AS platform_key UNION ALL
  SELECT 'video_prompt',NULL UNION ALL
  SELECT 'voiceover',NULL UNION ALL
  SELECT 'website_page','website' UNION ALL
  SELECT 'pinterest_image','pinterest' UNION ALL
  SELECT 'pinterest_copy','pinterest' UNION ALL
  SELECT 'facebook_copy','facebook' UNION ALL
  SELECT 'instagram_copy','instagram' UNION ALL
  SELECT 'threads_copy','threads' UNION ALL
  SELECT 'tiktok_copy','tiktok' UNION ALL
  SELECT 'youtube_copy','youtube'
) o
WHERE l.code IN ('uk','ru','pl','en','sv','de','es','fr');

-- Critical machine-readable publishing rules.
INSERT INTO rules(project_id,scope_type,rule_group,rule_key,rule_value,notes,mandatory,status,version,effective_from)
SELECT 'wisequotesworld','project','approval','no_publish_without_approval',
'No social scheduling or publication is allowed unless the content-level approval status is approved.',
'Hard publication gate.',1,'approved',1,'2026-08-28'
WHERE NOT EXISTS(SELECT 1 FROM rules WHERE project_id='wisequotesworld' AND rule_key='no_publish_without_approval');

INSERT INTO rules(project_id,scope_type,rule_group,rule_key,rule_value,notes,mandatory,status,version,effective_from)
SELECT 'wisequotesworld','project','source','verbatim_requires_verified_source',
'Verbatim attributed quotes require verified source evidence and attribution_status=verified before approval or publication.',
'Prevents misattribution.',1,'approved',1,'2026-08-28'
WHERE NOT EXISTS(SELECT 1 FROM rules WHERE project_id='wisequotesworld' AND rule_key='verbatim_requires_verified_source');

INSERT INTO rules(project_id,scope_type,rule_group,rule_key,rule_value,notes,mandatory,status,version,effective_from)
SELECT 'wisequotesworld','project','media','pinterest_semantic_continuity',
'Pinterest creative must preserve the semantic visual concept of the corresponding video prompt and use portrait 2:3 format.',
'Canonical Pinterest rule.',1,'approved',1,'2026-08-28'
WHERE NOT EXISTS(SELECT 1 FROM rules WHERE project_id='wisequotesworld' AND rule_key='pinterest_semantic_continuity');

INSERT INTO rules(project_id,scope_type,rule_group,rule_key,rule_value,notes,mandatory,status,version,effective_from)
SELECT 'wisequotesworld','project','publishing','fr_social_disabled_until_connected',
'French content is prepared in D1 but external French social scheduling remains disabled until FR accounts are connected and enabled.',
'Prepared eighth locale without premature publishing.',1,'approved',1,'2026-08-28'
WHERE NOT EXISTS(SELECT 1 FROM rules WHERE project_id='wisequotesworld' AND rule_key='fr_social_disabled_until_connected');
