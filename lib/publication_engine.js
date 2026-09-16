import {WEBSITE_LOCALES,localeConfig} from './locale_registry.js';
import {evaluateEditorialQuality} from './editorial_quality.js';

const PROJECT='wisequotesworld';
const LANGS=WEBSITE_LOCALES;

function validSlug(v){return /^[^/\s]+$/u.test(String(v||''))}
function contentSequence(id){const n=Number(String(id||'').replace(/^WQ/i,''));return Number.isFinite(n)?n:0}

async function latestVersions(env,id){
 return (await env.DB.prepare(`SELECT cv.* FROM content_versions cv JOIN (SELECT language_code,MAX(version) v FROM content_versions WHERE content_id=? GROUP BY language_code) x ON x.language_code=cv.language_code AND x.v=cv.version WHERE cv.content_id=? ORDER BY cv.language_code`).bind(id,id).all()).results||[];
}

async function pages(env,id){
 return (await env.DB.prepare(`SELECT * FROM quote_pages WHERE project_id=? AND content_item_id=? ORDER BY language_code`).bind(PROJECT,id).all()).results||[];
}

async function hasVerifiedEvidence(env,id){
 try{return !!(await env.DB.prepare(`SELECT 1 ok FROM quote_source_evidence WHERE content_item_id=? AND verified=1 LIMIT 1`).bind(id).first())}catch{return false}
}

export async function websitePublicationReadiness(env,id){
 if(!env?.DB)return{ok:false,error:'DB unavailable'};
 const item=await env.DB.prepare(`SELECT * FROM content_items WHERE project_id=? AND id=?`).bind(PROJECT,id).first();
 if(!item)return{ok:false,error:'content not found',id};
 const versions=await latestVersions(env,id),ps=await pages(env,id),vm=new Map(versions.map(v=>[v.language_code,v])),pm=new Map(ps.map(p=>[p.language_code,p]));
 const evidenceOk=item.quote_type==='verbatim'?await hasVerifiedEvidence(env,id):true;
 const sourceLocator=String(item.source_url||item.source_work||item.author_source||'').trim();
 const sourceOk=item.quote_type!=='verbatim'||(
   item.attribution_status==='verified'&&String(item.author_name||'').trim()&&String(item.original_quote||'').trim()&&(sourceLocator||evidenceOk)
 );
 const strictEditorial=contentSequence(id)>=27;
 const languages=LANGS.map(language=>{
   const v=vm.get(language),p=pm.get(language),issues=[],warnings=[];
   if(!v)issues.push('missing_version');
   else{
     if(!String(v.title||'').trim())issues.push('missing_title');
     if(!String(v.adapted_text||'').trim())issues.push('missing_localized_text');
     if(v.language_check_status!=='native_qa_pass')issues.push('native_qa_not_passed');
   }
   let editorial={ready:false,errors:['missing_quote_page'],warnings:[],metrics:{words:0,paragraphs:0,sentences:0,quote_uses:0,template_marker_hits:0,title_chars:0,meta_chars:0}};
   if(!p)issues.push('missing_quote_page');
   else{
     if(!validSlug(p.slug))issues.push('invalid_slug');
     editorial=evaluateEditorialQuality({reflection:p.reflection_body,quote:v?.adapted_text||'',seo_title:p.seo_title,meta_description:p.meta_description});
     for(const e of editorial.errors){
       // WQ001–WQ026 are historical/migration content. Preserve their compatibility while
       // enforcing the complete editorial structure for the universal WQ027+ pipeline.
       if(!strictEditorial&&e==='reflection_not_multi_paragraph')warnings.push(e);
       else issues.push(e);
     }
     warnings.push(...editorial.warnings);
   }
   const cfg=localeConfig(language);
   return{language,canonical_locale:cfg?.canonical||language,ready:issues.length===0,issues:[...new Set(issues)],warnings:[...new Set(warnings)],page_status:p?.status||null,slug:p?.slug||null,reflection_words:editorial.metrics.words,editorial};
 });
 return{ok:true,id,quote_type:item.quote_type||null,source_ok:!!sourceOk,source_evidence_verified:!!evidenceOk,strict_editorial:strictEditorial,ready:!!sourceOk&&languages.every(x=>x.ready),has_warnings:languages.some(x=>x.warnings.length>0),languages};
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
