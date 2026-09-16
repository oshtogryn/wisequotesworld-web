const PROJECT_ID='wisequotesworld';

const RULES=[
 ['content_strategy','content_mix_adapted_verbatim','Content mix must deliberately alternate Wise Quotes World adapted/original thoughts with verified verbatim quotations from notable people, philosophers, writers and thinkers. Do not let one type dominate the feed for long stretches.'],
 ['localization','natural_localization_not_literal','Every language version must be naturally adapted for a native speaker while preserving the meaning, tone and force of the canonical quote. Never use mechanical word-for-word translation. For verbatim quotes, translations are derived from the verified original-language source, not from another translation.'],
 ['languages','all_eight_social_locales_active','All eight locales uk, ru, pl, en, sv, de, es and fr are active social locales for Pinterest, Facebook, Instagram, Threads, TikTok and YouTube. Website locales additionally include it, pt-BR/pt, id, tr and ar; these five remain manual/inactive social and outside the Metricool gate until their accounts are actually connected.'],
 ['languages','pt_br_locale_alias','Brazilian Portuguese is canonically pt-BR for language semantics, HTML and hreflang. Existing D1 and URL code pt is retained as the backward-compatible internal/route alias. Do not destructively rename historical pt rows or URLs.'],
 ['video','quote_length_gate','Before prompts and copy, verify the quote can be read naturally within the actual current Gemini/Veo interface/model duration. Do not hard-code a universal 10 seconds, rush voiceover, or shorten verified verbatim wording under the guise of exact quotation.'],
 ['video','production_prompt_v45','Production prompts follow MASTER_RULES: premium vertical 9:16, one coherent cinematic concept, immediate meaningful frame, exact localized stable text card(s), clean large upper-middle typography, natural native narration, restrained music below voice, one concise negative line and a clean final shot. QA diagnostics stay outside the generation prompt.'],
 ['video','verbatim_author_visual_strategy','Verified verbatim quotations use a distinct premium author-specific micro-film: dignified treatment appropriate to the person/period or a safe symbolic alternative, quote-specific cinematic metaphor and progression, no fake historical-footage implication, no generic superhero/motivational-ad treatment, exact quote wording and explicit attribution.'],
 ['video','adapted_visual_strategy','Adapted/original Wise Quotes World thoughts keep the established cinematic human/symbolic storytelling family. Do not convert adapted quotes into philosopher busts, museum portraits or author cards, and do not add an author.'],
 ['video','normalized_social_video_required','A raw upload is never social-delivery-ready merely because it exists in R2 or has a video MIME type. Before new social scheduling, video must be normalized and validated as an MP4 delivery master using H.264 video, AAC audio, yuv420p and faststart, then pass media QA. Raw MOV/HEVC and unvalidated files remain source assets only.'],
 ['video','video_normalization_flow','Canonical media flow is original immutable R2 upload -> protected source download/probe -> ffmpeg normalized derivative -> ffprobe delivery validation -> normalized MP4 registered in D1/R2 -> visual/media QA -> canonical social derivative -> scheduler. Failures must be retryable without requiring the original upload again.'],
 ['video','no_mime_extension_spoofing','Changing a URL suffix, filename or Content-Type does not constitute video conversion. A .mov/HEVC object must never be treated as a compatible MP4 merely by serving it from a .mp4-looking URL.'],
 ['pinterest','pinterest_ai_frozen','Automatic AI generation of Pinterest images is frozen until explicitly re-enabled. Standard workflow is manual image generation from the prepared Pinterest prompt, then Admin upload to R2, QA and approval.'],
 ['pinterest','pinterest_eight_of_eight','Pinterest is mandatory for every approved topic in all eight connected social locales uk, ru, pl, en, sv, de, es and fr. Each locale requires both an approved 2:3 Image Pin and an approved 9:16 Video Pin, each with localized title/description, correct locale board and exact same-language article URL.'],
 ['pinterest','pinterest_two_formats_per_locale','Each connected social locale must have two distinct Pinterest posts per topic: one Image Pin from the approved 2:3 image and one Video Pin from the approved 9:16 topic video. They must not publish simultaneously; default placement is image during the day and video in the evening. Drafts or duplicates do not count.'],
 ['pinterest','pinterest_clean_saveable_image','Pinterest Image Pins must remain clean, save-worthy editorial assets: only the exact localized quote and, for verbatim content, author attribution may be readable on the image. Never add CTA/read-more/helper/promotional text to the image.'],
 ['pinterest','pinterest_locale_creative_differentiation','For the same topic, Pinterest locale images must preserve meaning and premium WQW tone while varying composition, visual details, lighting and subtle locale-aware color mood. Locale palettes are editorial cues, never flag-based or stereotypical nationality treatments. Pinterest titles/descriptions must be native and SEO-natural but not mechanical translations of one fixed template; vary hooks and phrasing without keyword stuffing.'],
 ['pinterest','pinterest_utm_attribution','Pinterest destination URLs may add analytics query parameters while preserving the exact same-language canonical article destination. Standard organic attribution uses utm_source=pinterest, utm_medium=organic, utm_campaign=<content_id>, and utm_content=<locale>_<image|video>. Canonical and hreflang URLs remain clean without UTM parameters.'],
 ['social_copy','social_to_local_article','Every social post is self-contained and substantive and funnels toward the same-language Wise Quotes World destination according to platform link behavior. Never send a locale to another language when a localized destination exists.'],
 ['social_copy','social_hashtag_limit','Use no more than 5 hashtags in any social post or caption. Prefer relevant hashtags over quantity and retain #WiseQuotesWorld when appropriate.'],
 ['social_copy','platform_link_policy','Facebook and Threads copy must include the exact clickable same-language article URL. Instagram and YouTube video descriptions omit raw article URLs and use a natural localized profile-link CTA. TikTok keeps the locale website address visibly in the caption as plain text even when it is not clickable; never falsely call it clickable or say link in profile when no TikTok profile website link exists. Pinterest uses the exact same-language article as the destination link.'],
 ['social_copy','three_threads_distinct_roles','For new production topics, the three Threads posts are distinct editorial assets rather than paraphrases: one quote/core-interpretation post, one nuance/counterpoint post, and one practical question/application post. Near-duplicate Threads fail automated copy QA.'],
 ['social_copy','v2_output_contract_wq027_plus','WQ027 and later use the v2 social-output contract: separate threads_1/threads_2/threads_3 plus separate Pinterest Image and Pinterest Video titles/descriptions. WQ001-WQ026 retain legacy-compatible readback so historical records are not destructively rewritten.'],
 ['website','article_information_gain','Website reflections target 250-500 substantive native words and must add quote-specific information rather than template filler. Under 180 words is a technical readiness failure; 180-249 is an editorial warning requiring deliberate acceptance; duplicate/template-heavy passages are QA warnings.'],
 ['scheduling','metricool_primary_now','Metricool remains the primary scheduler during the current stabilization phase. Until the official Metricool API plan is explicitly enabled after purchase, the existing authorized production bridge/token workflow remains the transport. Do not weaken Cloudflare Access or bypass D1/Planner readback to make scheduling easier. No item is considered scheduled until live Planner readback confirms the planned publication.'],
 ['scheduling','all_eight_social_locales','Scheduling readiness requires all eight connected social locales uk, ru, pl, en, sv, de, es and fr, media QA, final approval, both Pinterest formats for every locale and live Metricool Planner readback. it, pt-BR/pt, id, tr and ar remain manual/inactive social and are excluded from the Metricool gate until connected.'],
 ['scheduling','topic_schedule_72_gate','Current standard is 72 active scheduled posts per topic across eight connected social locales: 24 Threads, 8 Facebook Reels, 8 Instagram Reels, 8 TikTok posts, 8 YouTube Shorts, 8 Pinterest Image Pins and 8 Pinterest Video Pins. Each locale has 9 posts: 3 Threads plus one of each other format. Drafts and duplicates do not count; same-platform cross-locale posts must be spaced by at least 15 minutes.'],
 ['scheduling','delivery_failure_ledger','Every scheduler attempt must be idempotent and tracked by content_id + locale + network + slot. Failed deliveries are written to the publication failure ledger with attempt/error data. Retry only the failed/missing slots; never recreate already confirmed scheduled or published slots.'],
 ['website','website_full_archive_categories','The public website must expose the full published quote archive from D1 for every website locale. Category and verified-author pages are live D1 queries. Website locales are uk, ru, pl, en, sv, de, es, fr, it, pt-BR/pt, id, tr and ar.']
];

async function applyConfirmedOperationalState(env){
  // Historical publication state is preserved, but media is never auto-approved here.
  // Media QA must reflect the actual reviewed asset and the current delivery policy.
  const ts=new Date().toISOString();
  await env.DB.prepare(`UPDATE content_items SET status='published' WHERE project_id=? AND id='WQ011' AND status<>'published'`).bind(PROJECT_ID).run();
  await env.DB.prepare(`UPDATE quote_pages SET status='published',published_at=COALESCE(published_at,'2026-08-30'),updated_at=? WHERE project_id=? AND content_item_id='WQ011' AND status<>'published'`).bind(ts,PROJECT_ID).run();
  await env.DB.prepare(`UPDATE content_items SET status='published' WHERE project_id=? AND id='WQ006' AND status<>'published'`).bind(PROJECT_ID).run();
  await env.DB.prepare(`UPDATE quote_pages SET status='published',published_at=COALESCE(published_at,'2026-08-29'),updated_at=? WHERE project_id=? AND content_item_id='WQ006' AND status<>'published'`).bind(ts,PROJECT_ID).run();
}

async function upsertCanonicalRules(env){
 if(!env?.DB)return;
 const t=new Date().toISOString().slice(0,10);
 for(const [group,key,value] of RULES){
   const existing=await env.DB.prepare(`SELECT id FROM rules WHERE project_id=? AND rule_key=? AND status='approved' ORDER BY version DESC,id DESC LIMIT 1`).bind(PROJECT_ID,key).first();
   if(existing?.id){
     await env.DB.prepare(`UPDATE rules SET rule_group=?,rule_value=?,notes='Canonical runtime rule synchronized from code/MASTER_RULES v4.15 + latest explicit decisions.',mandatory=1,status='approved',effective_from=? WHERE id=?`).bind(group,value,t,existing.id).run();
   }else{
     await env.DB.prepare(`INSERT INTO rules(project_id,scope_type,language_code,platform_code,rule_group,rule_key,rule_value,notes,mandatory,status,version,effective_from) VALUES(?, 'project', NULL, NULL, ?, ?, ?, 'Canonical runtime rule synchronized from code/MASTER_RULES v4.15 + latest explicit decisions.', 1, 'approved', 1, ?)`).bind(PROJECT_ID,group,key,value,t).run();
   }
 }
}

export async function syncCanonicalRules(env){
 if(!env?.DB)return;
 await upsertCanonicalRules(env);
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
