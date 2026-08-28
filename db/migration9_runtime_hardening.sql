-- Wise Quotes World migration9 — runtime hardening metadata
-- 2026-08-28
-- Adds machine-readable rules used by Admin/Worker validation.

INSERT OR REPLACE INTO rules(project_id, rule_key, rule_value, is_active, updated_at)
VALUES
('wisequotesworld','adapted_no_attribution','For quote_type=adapted, author_name, source_name, author_source, source_work and source_date must not be rendered or treated as attribution. Publication must not display an author.',1,CURRENT_TIMESTAMP),
('wisequotesworld','verbatim_verification_minimum','A verbatim quote may become verified only when author_name, original_quote, original_language and verified source evidence are present. Verified evidence must include original_text, original_language, source_locator, verification_notes and at least source_title or source_url.',1,CURRENT_TIMESTAMP),
('wisequotesworld','approval_gate','Content approval is explicit. AI generation success is not approval. Scheduling/publishing requires approved content; verbatim content additionally requires verified attribution evidence.',1,CURRENT_TIMESTAMP),
('wisequotesworld','ai_image_dimensions_truth','Do not store target Pinterest dimensions as actual generated media dimensions unless the model/output proves them. Unknown actual width/height must remain NULL until inspected or transformed.',1,CURRENT_TIMESTAMP),
('wisequotesworld','pinterest_text_fidelity','AI-rendered quote text must never be trusted automatically. Pinterest creative remains visual-QA pending until exact localized quote and allowed attribution/branding are verified.',1,CURRENT_TIMESTAMP),
('wisequotesworld','free_ai_budget','Default image generation must use Cloudflare-hosted models that fit the Workers AI free allocation. Do not introduce OpenAI API or another paid AI dependency without explicit approval.',1,CURRENT_TIMESTAMP);
