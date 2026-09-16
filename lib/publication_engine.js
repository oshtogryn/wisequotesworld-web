import {WEBSITE_LOCALES,localeConfig} from './locale_registry.js';

const PROJECT='wisequotesworld';
const LANGS=WEBSITE_LOCALES;

function words(v){return String(v||'').trim().split(/\s+/u).filter(Boolean).length}
function validSlug(v){return /^[^/\s]+$/u.test(String(v||''))}
function paragraphs(v){return String(v||'').split(/\n\s*\n/u).map(x=>x.replace(/\s+/gu,' ').trim()).filter(Boolean)}
function normalizedText(v){return String(v||'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').replace(/\s+/gu,' ').trim()}
function duplicateParagraphWarning(v){
 const ps=paragraphs(v).map(normalizedText).filter(x=>x.length>=80),seen=new Set();
 for(const p of ps){if(seen.has(p))return true;seen.add(p)}
 return false;
}

async function latestVersions(env,id){
 return (await env.DB.prepare(`SELECT cv.* FROM content_versions cv JOIN (SELECT language_code,MAX(version) v FROM content_versions WHERE content_id=? GROUP BY language_code) x ON x.language_code=cv.language_code AND x.v=cv.version WHERE cv.content_id=? ORDER BY cv.language_code`).bind(id,id).all()).results||[];
}

async function pages(env,id){
 return (await env.DB.prepare(`SELECT * FROM quote_pages WHERE project_id=? AND content_item_id=? ORDER BY language_code`).bind(PROJECT,id).all()).results||[];
}

export async function websitePublicationReadiness(env,id){
 if(!env?.DB)return{ok:false,error:'DB unavailable'};
 const item=await env.DB.prepare(`SELECT * FROM content_items WHERE project_id=? AND id=?`).bind(PROJECT,id).first();
 if(!item)return{ok:false,error:'content not found',id};
 const versions=await latestVersions(env,id),ps=await pages(env,id),vm=new Map(versions.map(v=>[v.language_code,v])),pm=new Map(ps.map(p=>[p.language_code,p]));
 const sourceOk=item.quote_type!=='verbatim'||(
   item.attribution_status==='verified'&&String(item.author_name||'').trim()&&String(item.original_quote||'').trim()&&String(item.source_url||'').trim()
 );
 const languages=LANGS.map(language=>{
   const v=vm.get(language),p=pm.get(language),issues=[],warnings=[];
   if(!v)issues.push('missing_version');
   else{
     if(!String(v.title||'').trim())issues.push('missing_title');
     if(!String(v.adapted_text||'').trim())issues.push('missing_localized_text');
     if(v.language_check_status!=='native_qa_pass')issues.push('native_qa_not_passed');
   }
   let reflectionWords=0;
   if(!p)issues.push('missing_quote_page');
   else{
     if(!validSlug(p.slug))issues.push('invalid_slug');
     if(!String(p.seo_title||'').trim())issues.push('missing_seo_title');
     if(!String(p.meta_description||'').trim())issues.push('missing_meta_description');
     reflectionWords=words(p.reflection_body);
     // Editorial standard is 250–500 words. We hard-stop clearly thin pages while
     // keeping 180–249 as an explicit warning so strong concise editorial copy is not blocked mechanically.
     if(reflectionWords<180)issues.push('reflection_too_short');
     else if(reflectionWords<250)warnings.push('reflection_below_editorial_target');
     if(reflectionWords>650)warnings.push('reflection_above_editorial_target');
     if(duplicateParagraphWarning(p.reflection_body))warnings.push('duplicate_reflection_paragraph');
   }
   const cfg=localeConfig(language);
   return{language,canonical_locale:cfg?.canonical||language,ready:issues.length===0,issues,warnings,page_status:p?.status||null,slug:p?.slug||null,reflection_words:reflectionWords};
 });
 return{ok:true,id,quote_type:item.quote_type||null,source_ok:!!sourceOk,ready:!!sourceOk&&languages.every(x=>x.ready),has_warnings:languages.some(x=>x.warnings.length>0),languages};
}

export async function publishWebsite(env,id){
 const r=await websitePublicationReadiness(env,id);if(!r.ok||!r.ready)return{...r,published:false};
 const ts=new Date().toISOString();
 await env.DB.prepare(`UPDATE quote_pages SET status='published',published_at=COALESCE(published_at,?),updated_at=? WHERE project_id=? AND content_item_id=?`).bind(ts,ts,PROJECT,id).run();
 try{await env.DB.prepare(`UPDATE content_versions SET status=CASE WHEN status IN ('draft','localized','website_ready','media_pending') THEN 'website_ready' ELSE status END,updated_at=? WHERE content_id=?`).bind(ts,id).run()}catch{}
 try{await env.DB.prepare(`UPDATE content_items SET status=CASE WHEN status IN ('draft','localized','website_ready') THEN 'website_ready' ELSE status END,updated_at=? WHERE project_id=? AND id=?`).bind(ts,PROJECT,id).run()}catch{}
 const after=await websitePublicationReadiness(env,id);
 return{...after,published:true,published_at:ts,article_urls:after.languages.map(x=>`https://wisequotesworld.com/${localeConfig(x.language)?.url||x.language}/quotes/${x.slug}/`)};
}

export const WEBSITE_LANGS=LANGS;
