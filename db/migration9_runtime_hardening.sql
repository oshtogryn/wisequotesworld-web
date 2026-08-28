-- Wise Quotes World migration9 — runtime hardening metadata
-- 2026-08-28
-- Adds machine-readable safety rules using the canonical rules-table schema.

INSERT INTO rules(project_id,scope_type,language_code,platform_code,rule_group,rule_key,rule_value,notes,mandatory,status,version,effective_from)
SELECT 'wisequotesworld','project',NULL,NULL,'content_safety','adapted_no_attribution',
'For quote_type=adapted, author_name, source_name, author_source, source_work and source_date must not be rendered or treated as attribution. Publication must not display an author.',
'Adapted/original Wise Quotes content has no author attribution.',1,'approved',1,'2026-08-28'
WHERE NOT EXISTS (SELECT 1 FROM rules WHERE project_id='wisequotesworld' AND rule_key='adapted_no_attribution' AND version=1);

INSERT INTO rules(project_id,scope_type,language_code,platform_code,rule_group,rule_key,rule_value,notes,mandatory,status,version,effective_from)
SELECT 'wisequotesworld','project',NULL,NULL,'source_verification','verbatim_verification_minimum',
'A verbatim quote may become verified only when author_name, original_quote, original_language and verified source evidence are present. Verified evidence must include original_text, original_language, source_locator, verification_notes and at least source_title or source_url.',
'Hard minimum before attribution_status may become verified.',1,'approved',1,'2026-08-28'
WHERE NOT EXISTS (SELECT 1 FROM rules WHERE project_id='wisequotesworld' AND rule_key='verbatim_verification_minimum' AND version=1);

INSERT INTO rules(project_id,scope_type,language_code,platform_code,rule_group,rule_key,rule_value,notes,mandatory,status,version,effective_from)
SELECT 'wisequotesworld','project',NULL,NULL,'approval','approval_gate',
'Content approval is explicit. AI generation success is not approval. Scheduling or publishing requires approved content; verbatim content additionally requires verified attribution evidence.',
'Final publication safety gate.',1,'approved',1,'2026-08-28'
WHERE NOT EXISTS (SELECT 1 FROM rules WHERE project_id='wisequotesworld' AND rule_key='approval_gate' AND version=1);

INSERT INTO rules(project_id,scope_type,language_code,platform_code,rule_group,rule_key,rule_value,notes,mandatory,status,version,effective_from)
SELECT 'wisequotesworld','project',NULL,'pinterest','ai_generation','ai_image_dimensions_truth',
'Do not store target Pinterest dimensions as actual generated media dimensions unless the model output proves them. Unknown actual width and height must remain NULL until inspected or transformed.',
'FLUX.1 Schnell schema does not expose width or height input parameters.',1,'approved',1,'2026-08-28'
WHERE NOT EXISTS (SELECT 1 FROM rules WHERE project_id='wisequotesworld' AND rule_key='ai_image_dimensions_truth' AND version=1);

INSERT INTO rules(project_id,scope_type,language_code,platform_code,rule_group,rule_key,rule_value,notes,mandatory,status,version,effective_from)
SELECT 'wisequotesworld','project',NULL,'pinterest','visual_qa','pinterest_text_fidelity',
'AI-rendered quote text must never be trusted automatically. Pinterest creative remains visual-QA pending until exact localized quote and allowed attribution and branding are verified.',
'Prevents malformed AI text from reaching Pinterest.',1,'approved',1,'2026-08-28'
WHERE NOT EXISTS (SELECT 1 FROM rules WHERE project_id='wisequotesworld' AND rule_key='pinterest_text_fidelity' AND version=1);

INSERT INTO rules(project_id,scope_type,language_code,platform_code,rule_group,rule_key,rule_value,notes,mandatory,status,version,effective_from)
SELECT 'wisequotesworld','project',NULL,NULL,'cost_control','free_ai_budget',
'Default image generation must use Cloudflare-hosted models that fit the Workers AI free allocation. Do not introduce OpenAI API or another paid AI dependency without explicit approval.',
'Cost-control rule for the project.',1,'approved',1,'2026-08-28'
WHERE NOT EXISTS (SELECT 1 FROM rules WHERE project_id='wisequotesworld' AND rule_key='free_ai_budget' AND version=1);
