-- Wise Quotes World migration4 — FR preparation + full database-first cutover
-- 2026-08-28
PRAGMA foreign_keys=ON;

INSERT INTO languages(code,name,native_name,active)
VALUES('fr','French','Français',1)
ON CONFLICT(code) DO UPDATE SET name='French',native_name='Français',active=1;

INSERT INTO project_languages(project_id,language_code,active)
VALUES('wisequotesworld','fr',1)
ON CONFLICT(project_id,language_code) DO UPDATE SET active=1;

INSERT INTO rules(project_id,scope_type,language_code,platform_code,rule_group,rule_key,rule_value,notes,mandatory,status,version,effective_from)
SELECT 'wisequotesworld','project',NULL,NULL,'workflow','database_only_no_sheets',
'After controlled cutover, Wise Quotes World does not use Google Sheets in operational workflow. D1 and MASTER_RULES are the only canonical operational sources. Sheets may remain only as a frozen migration/archive artifact and must never be read automatically for current rules/status.',
'Full Google Sheets retirement requested 2026-08-28.',1,'approved',2,'2026-08-28'
WHERE NOT EXISTS(
 SELECT 1 FROM rules WHERE project_id='wisequotesworld' AND rule_group='workflow' AND rule_key='database_only_no_sheets' AND version=2
);

INSERT INTO rules(project_id,scope_type,language_code,platform_code,rule_group,rule_key,rule_value,notes,mandatory,status,version,effective_from)
SELECT 'wisequotesworld','language','fr',NULL,'localization','fr_prepared_inactive_social',
'French is a first-class prepared locale for database, Admin, website, prompts, Pinterest, SEO and analytics. Prepare every new content item in French. Do not schedule to French social networks until corresponding social accounts are connected and explicitly enabled.',
'Future eighth Wise Quotes World language.',1,'approved',1,'2026-08-28'
WHERE NOT EXISTS(
 SELECT 1 FROM rules WHERE project_id='wisequotesworld' AND language_code='fr' AND rule_key='fr_prepared_inactive_social'
);

INSERT INTO language_style_profiles(project_id,language_code,profile_json,version,active)
SELECT 'wisequotesworld','fr',
'{"locale":"fr-FR","tone":"natural, concise, reflective, contemporary","translation_policy":"adapt from canonical original meaning; avoid literal calques; preserve quotation status and attribution","punctuation":"French native punctuation and typography","social_status":"prepared_inactive"}',1,1
WHERE NOT EXISTS(
 SELECT 1 FROM language_style_profiles WHERE project_id='wisequotesworld' AND language_code='fr' AND version=1
);

INSERT INTO automation_integrations(id,project_id,provider,channel,status,config_json,notes)
VALUES('metricool_fr_future','wisequotesworld','metricool','fr_social','prepared','{"language":"fr","publishing_enabled":false}','Enable only after FR channels are created and connected.')
ON CONFLICT(id) DO UPDATE SET status='prepared',config_json='{"language":"fr","publishing_enabled":false}';
