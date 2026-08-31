const PROJECT_ID='wisequotesworld';

const RULES=[
 ['content_strategy','content_mix_adapted_verbatim','Content mix must deliberately alternate Wise Quotes World adapted/original thoughts with verified verbatim quotations from notable people, philosophers, writers and thinkers. Do not let one type dominate the feed for long stretches.'],
 ['localization','natural_localization_not_literal','Every language version must be naturally adapted for a native speaker while preserving the meaning, tone and force of the canonical quote. Never use mechanical word-for-word translation. For verbatim quotes, translations are derived from the verified original-language source, not from another translation.'],
 ['languages','all_eight_social_locales_active','All eight locales uk, ru, pl, en, sv, de, es and fr are active for website, Pinterest, Facebook, Instagram, Threads, TikTok and YouTube. French no longer has a website/Pinterest-only exception.'],
 ['video','quote_length_gate','Before prompts and copy, verify the quote can be read naturally within the actual current Gemini/Veo interface/model duration. Do not hard-code a universal 10 seconds, rush voiceover, or shorten verified verbatim wording under the guise of exact quotation.'],
 ['video','production_prompt_v45','Production prompts follow MASTER_RULES v4.6: premium vertical 9:16, one coherent cinematic concept, immediate meaningful frame, exact localized stable text card(s), clean large upper-middle typography, natural native narration, restrained music below voice, one concise negative line and a clean final shot. QA diagnostics stay outside the generation prompt.'],
 ['video','verbatim_author_visual_strategy','Verified verbatim quotations use a distinct premium author-specific micro-film: dignified recognizable author treatment appropriate to the person/period, quote-specific cinematic metaphor and progression, no fake historical-footage implication, no generic superhero/motivational-ad treatment, exact quote wording and explicit attribution.'],
 ['video','adapted_visual_strategy','Adapted/original Wise Quotes World thoughts keep the established cinematic human/symbolic storytelling family. Do not convert adapted quotes into philosopher busts, museum portraits or author cards, and do not add an author.'],
 ['pinterest','pinterest_ai_frozen','Automatic AI generation of Pinterest images is frozen until explicitly re-enabled. Standard workflow is manual image generation from the prepared Pinterest prompt, then Admin upload to R2, QA and approval.'],
 ['pinterest','pinterest_eight_of_eight','Pinterest is mandatory for every approved topic in all eight locales uk, ru, pl, en, sv, de, es and fr, with the approved locale image, localized SEO title/description, correct locale board and exact same-language article URL.'],
 ['social_copy','social_to_local_article','Every social post is self-contained and substantive and funnels toward the same-language Wise Quotes World destination according to platform link behavior. Never send a locale to another language when a localized destination exists.'],
 ['social_copy','platform_link_policy','Facebook and Threads copy must include the exact clickable same-language article URL. Instagram and YouTube video descriptions omit raw article URLs and use a natural localized profile-link CTA. TikTok keeps the locale website address visibly in the caption as plain text even when it is not clickable; never falsely call it clickable or say link in profile when no TikTok profile website link exists. Pinterest uses the exact same-language article as the destination link.'],
 ['scheduling','metricool_primary_now','Metricool remains the primary scheduler during the current stabilization phase. No item is considered scheduled until Planner readback confirms the planned publication.'],
 ['scheduling','all_eight_social_locales','Scheduling readiness for Wise Quotes World social publishing requires all eight active locales, including French, plus Pinterest 8/8, media QA and final approval.'],
 ['website','website_full_archive_categories','The public website must expose the full published quote archive from D1 for every locale. Category and verified-author pages are live D1 queries. All eight locales uk, ru, pl, en, sv, de, es and fr are active.']
];

async function applyConfirmedOperationalState(env){
  const ts=new Date().toISOString();
  const rows=(await env.DB.prepare(`SELECT id FROM media_inbox WHERE project_id=? AND content_item_id='WQ011'`).bind(PROJECT_ID).all()).results||[];
  for(const r of rows){
    const current=await env.DB.prepare(`SELECT qa_status FROM media_reviews WHERE media_inbox_id=?`).bind(r.id).first();
    if(current?.qa_status==='rejected')continue;
    await env.DB.prepare(`INSERT INTO media_reviews(media_inbox_id,qa_status,notes,reviewed_at,updated_at) VALUES(?,'approved','User manually verified media on 2026-08-30.',?,?) ON CONFLICT(media_inbox_id) DO UPDATE SET qa_status='approved',notes='User manually verified media on 2026-08-30.',reviewed_at=excluded.reviewed_at,updated_at=excluded.updated_at`).bind(r.id,ts,ts).run();
  }
  await env.DB.prepare(`UPDATE content_items SET status='published' WHERE project_id=? AND id='WQ011'`).bind(PROJECT_ID).run();
  await env.DB.prepare(`UPDATE quote_pages SET status='published',published_at=COALESCE(published_at,'2026-08-30'),updated_at=? WHERE project_id=? AND content_item_id='WQ011'`).bind(ts,PROJECT_ID).run();
  await env.DB.prepare(`UPDATE content_items SET status='published' WHERE project_id=? AND id='WQ006'`).bind(PROJECT_ID).run();
  await env.DB.prepare(`UPDATE quote_pages SET status='published',published_at='2026-08-29',updated_at=? WHERE project_id=? AND content_item_id='WQ006'`).bind(ts,PROJECT_ID).run();
}

export async function syncCanonicalRules(env){
 if(!env?.DB)return;
 const t=new Date().toISOString().slice(0,10);
 for(const [group,key,value] of RULES){
   const existing=await env.DB.prepare(`SELECT id FROM rules WHERE project_id=? AND rule_key=? AND status='approved' ORDER BY version DESC,id DESC LIMIT 1`).bind(PROJECT_ID,key).first();
   if(existing?.id){
     await env.DB.prepare(`UPDATE rules SET rule_group=?,rule_value=?,notes='Canonical runtime rule synchronized from code/MASTER_RULES v4.6 + latest explicit decisions.',mandatory=1,status='approved',effective_from=? WHERE id=?`).bind(group,value,t,existing.id).run();
   }else{
     await env.DB.prepare(`INSERT INTO rules(project_id,scope_type,language_code,platform_code,rule_group,rule_key,rule_value,notes,mandatory,status,version,effective_from) VALUES(?, 'project', NULL, NULL, ?, ?, ?, 'Canonical runtime rule synchronized from code/MASTER_RULES v4.6 + latest explicit decisions.', 1, 'approved', 1, ?)`).bind(PROJECT_ID,group,key,value,t).run();
   }
 }
 await applyConfirmedOperationalState(env);
}

export async function readCanonicalRules(env){
 if(!env?.DB)return {ok:false,error:'DB binding unavailable'};
 const keys=RULES.map(x=>x[1]);
 const rows=(await env.DB.prepare(`SELECT rule_key,rule_group,rule_value,status,mandatory,version,effective_from FROM rules WHERE project_id=? AND status='approved' ORDER BY rule_key,version DESC`).bind(PROJECT_ID).all()).results||[];
 const latest={};for(const r of rows)if(!latest[r.rule_key])latest[r.rule_key]=r;
 const items=(await env.DB.prepare(`SELECT id,status FROM content_items WHERE project_id=? AND id IN ('WQ006','WQ011') ORDER BY id`).bind(PROJECT_ID).all()).results||[];
 const wq006Pages=(await env.DB.prepare(`SELECT COUNT(*) total,SUM(CASE WHEN status='published' THEN 1 ELSE 0 END) published,MIN(published_at) first_published_at,MAX(published_at) last_published_at FROM quote_pages WHERE project_id=? AND content_item_id='WQ006'`).bind(PROJECT_ID).first())||{};
 const wq011Pages=(await env.DB.prepare(`SELECT COUNT(*) total,SUM(CASE WHEN status='published' THEN 1 ELSE 0 END) published,MIN(published_at) first_published_at,MAX(published_at) last_published_at FROM quote_pages WHERE project_id=? AND content_item_id='WQ011'`).bind(PROJECT_ID).first())||{};
 return {ok:true,expected:keys.length,present:keys.filter(k=>latest[k]).length,missing:keys.filter(k=>!latest[k]),rules:keys.map(k=>latest[k]||{rule_key:k,missing:true}),operational:{items,wq006_pages:wq006Pages,wq011_pages:wq011Pages}};
}
