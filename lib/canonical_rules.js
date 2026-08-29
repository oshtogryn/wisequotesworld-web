const PROJECT_ID='wisequotesworld';

const RULES=[
 ['content_strategy','content_mix_adapted_verbatim','Content mix must deliberately alternate Wise Quotes World adapted/original thoughts with verified verbatim quotations from notable people, philosophers, writers and thinkers. Do not let one type dominate the feed for long stretches.'],
 ['localization','natural_localization_not_literal','Every language version must be naturally adapted for a native speaker while preserving the meaning, tone and force of the canonical quote. Never use mechanical word-for-word translation. For verbatim quotes, translations are derived from the verified original-language source, not from another translation.'],
 ['video','gemini_max_duration','Video prompts target the maximum useful Gemini generation duration, currently up to 10 seconds. Do not hard-code 8 seconds. Use up to 10 seconds when the scene, quote, voiceover and pacing benefit from it; never exceed the model limit available at generation time.'],
 ['video','production_prompt_depth','Every Gemini video prompt must be a full production prompt: exact duration/maximum duration, vertical 9:16 format, immediate first-frame hook, scene and setting, character/subject, camera framing and movement, action/timeline across the clip, lighting, mood, exact localized quote text, two sequential text moments when appropriate, safe text area, native-language voiceover, music below voice, allowed branding and explicit negative constraints. Short generic prompts are not production-ready.'],
 ['video','verbatim_author_visual_strategy','Verified quotations by notable people use a distinct premium visual strategy when appropriate: tasteful cinematic representation, animated statue/bust/sculpture/engraving, archival-inspired environment without false documentary claims, or symbolic scene. A statue or figure may subtly rotate or appear to speak while exact quote text and native voiceover are presented. Keep the treatment respectful, non-kitsch and subordinate to the quote.'],
 ['pinterest','pinterest_ai_frozen','Automatic AI generation of Pinterest images is frozen until explicitly re-enabled. Standard workflow is manual image generation from the prepared Pinterest prompt, then Admin upload to R2, QA and approval.'],
 ['scheduling','metricool_primary_now','Metricool remains the primary scheduler during the current stabilization phase. Native scheduling development is deferred until Admin, database-first website, media ingestion and content workflow are stable.'],
 ['website','website_full_archive_categories','The public website must expose the full published quote archive from D1 for every locale, not only the latest three items. Category pages are live D1 queries and must show all published quotes in that category. French is an active website locale alongside uk, ru, pl, en, sv, de and es.']
];

export async function syncCanonicalRules(env){
 if(!env?.DB)return;
 const t=new Date().toISOString().slice(0,10);
 for(const [group,key,value] of RULES){
   await env.DB.prepare(`INSERT INTO rules(project_id,scope_type,language_code,platform_code,rule_group,rule_key,rule_value,notes,mandatory,status,version,effective_from)
   SELECT ?, 'project', NULL, NULL, ?, ?, ?, 'Canonical runtime rule synchronized from code/MASTER_RULES.', 1, 'approved', 1, ?
   WHERE NOT EXISTS (SELECT 1 FROM rules WHERE project_id=? AND rule_key=? AND version=1)`)
   .bind(PROJECT_ID,group,key,value,t,PROJECT_ID,key).run();
 }
}
