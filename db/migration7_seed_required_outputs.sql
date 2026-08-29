-- Wise Quotes World migration7 — required outputs + workflow guardrails
-- 2026-08-28
-- D1-safe version: avoid large compound SELECT/UNION chains.

-- Seed required output matrix for every prepared locale using simple statements.
INSERT OR IGNORE INTO required_outputs(project_id,output_key,platform_key,language_code,required,active)
SELECT 'wisequotesworld','localized_quote',NULL,code,1,1 FROM languages WHERE code IN ('uk','ru','pl','en','sv','de','es','fr');

INSERT OR IGNORE INTO required_outputs(project_id,output_key,platform_key,language_code,required,active)
SELECT 'wisequotesworld','video_prompt',NULL,code,1,1 FROM languages WHERE code IN ('uk','ru','pl','en','sv','de','es','fr');

INSERT OR IGNORE INTO required_outputs(project_id,output_key,platform_key,language_code,required,active)
SELECT 'wisequotesworld','voiceover',NULL,code,1,1 FROM languages WHERE code IN ('uk','ru','pl','en','sv','de','es','fr');

INSERT OR IGNORE INTO required_outputs(project_id,output_key,platform_key,language_code,required,active)
SELECT 'wisequotesworld','website_page','website',code,1,1 FROM languages WHERE code IN ('uk','ru','pl','en','sv','de','es','fr');

INSERT OR IGNORE INTO required_outputs(project_id,output_key,platform_key,language_code,required,active)
SELECT 'wisequotesworld','pinterest_image','pinterest',code,1,1 FROM languages WHERE code IN ('uk','ru','pl','en','sv','de','es','fr');

INSERT OR IGNORE INTO required_outputs(project_id,output_key,platform_key,language_code,required,active)
SELECT 'wisequotesworld','pinterest_copy','pinterest',code,1,1 FROM languages WHERE code IN ('uk','ru','pl','en','sv','de','es','fr');

INSERT OR IGNORE INTO required_outputs(project_id,output_key,platform_key,language_code,required,active)
SELECT 'wisequotesworld','facebook_copy','facebook',code,1,1 FROM languages WHERE code IN ('uk','ru','pl','en','sv','de','es','fr');

INSERT OR IGNORE INTO required_outputs(project_id,output_key,platform_key,language_code,required,active)
SELECT 'wisequotesworld','instagram_copy','instagram',code,1,1 FROM languages WHERE code IN ('uk','ru','pl','en','sv','de','es','fr');

INSERT OR IGNORE INTO required_outputs(project_id,output_key,platform_key,language_code,required,active)
SELECT 'wisequotesworld','threads_copy','threads',code,1,1 FROM languages WHERE code IN ('uk','ru','pl','en','sv','de','es','fr');

INSERT OR IGNORE INTO required_outputs(project_id,output_key,platform_key,language_code,required,active)
SELECT 'wisequotesworld','tiktok_copy','tiktok',code,1,1 FROM languages WHERE code IN ('uk','ru','pl','en','sv','de','es','fr');

INSERT OR IGNORE INTO required_outputs(project_id,output_key,platform_key,language_code,required,active)
SELECT 'wisequotesworld','youtube_copy','youtube',code,1,1 FROM languages WHERE code IN ('uk','ru','pl','en','sv','de','es','fr');

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
