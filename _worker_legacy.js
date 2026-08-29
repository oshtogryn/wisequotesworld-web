import {publicationApi} from './lib/publication_core.js';

const LANGS=['en','uk','ru','pl','sv','de','es','fr'];
const PROJECT_ID='wisequotesworld';
const PIN_MODEL='@cf/black-forest-labs/flux-1-schnell';

function preferred(request){const h=(request.headers.get('Accept-Language')||'').toLowerCase();for(const l of ['uk','ru','pl','sv','de','es','fr','en'])if(h.startsWith(l)||h.includes(','+l)||h.includes(' '+l))return l;return'en'}
function json(data,status=200,headers={}){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers}})}
function now(){return new Date().toISOString()}
function safeId(v){return String(v||'').trim().replace(/[^A-Za-z0-9_-]/g,'').slice(0,40)}
function nonempty(v){return String(v??'').trim().length>0}
function slugify(v){return String(v||'').normalize('NFKD').toLowerCase().replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\u0400-\u04ff]+/g,'-').replace(/^-+|-+$/g,'').slice(0,100)||'quote'}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function authorized(request,env){return !!env.ADMIN_TOKEN&&(request.headers.get('authorization')||'')===`Bearer ${env.ADMIN_TOKEN}`}
function requireAdmin(request,env){return authorized(request,env)?null:json({ok:false,error:'unauthorized'},401)}
async function reqBody(request){try{return await request.json()}catch{return null}}
function b64bytes(s){const x=atob(s),a=new Uint8Array(x.length);for(let i=0;i<x.length;i++)a[i]=x.charCodeAt(i);return a}

async function tableNames(db){return ((await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all()).results||[]).map(x=>x.name)}
async function columns(db,table){try{return ((await db.prepare(`PRAGMA table_info(${table})`).all()).results||[]).map(x=>x.name)}catch{return[]}}
async function objectExists(db,type,name){return !!(await db.prepare("SELECT 1 AS ok FROM sqlite_master WHERE type=? AND name=? LIMIT 1").bind(type,name).first())}
async function schemaStatus(db){
 const tables=await tableNames(db),ci=tables.includes('content_items')?await columns(db,'content_items'):[];
 const v2=tables.includes('projects')&&tables.includes('languages')&&tables.includes('content_items')&&tables.includes('content_versions');
 const v3Columns=['quote_type','original_quote','original_language','author_name','author_source','source_work','source_date','attribution_status','category_slug'];
 const v3Tables=['workflow_steps','required_outputs','language_style_profiles','automation_integrations','media_inbox','media_usage','quote_categories','authors','pinterest_creatives','publication_attempts','ai_query_log'];
 const v3=v3Columns.every(x=>ci.includes(x))&&v3Tables.every(x=>tables.includes(x));
 const partial_v3=!v3&&(v3Columns.some(x=>ci.includes(x))||v3Tables.some(x=>tables.includes(x)));
 const project_ready=v2?!!(await db.prepare("SELECT 1 AS ok FROM projects WHERE id=? LIMIT 1").bind(PROJECT_ID).first()):false;
 const v4=v3&&!!(await db.prepare("SELECT 1 AS ok FROM languages WHERE code='fr'").first());
 const v5=ci.includes('source_verified_at')&&ci.includes('source_verification_notes')&&tables.includes('quote_source_evidence');
 const v6=tables.includes('quote_pages')&&tables.includes('content_approvals');
 const v7=tables.includes('required_outputs')?!!(await db.prepare("SELECT 1 AS ok FROM rules WHERE project_id=? AND rule_key='verbatim_requires_verified_source' LIMIT 1").bind(PROJECT_ID).first()):false;
 const v8=tables.includes('ai_generation_jobs');
 const v9=!!(await db.prepare("SELECT 1 AS ok FROM rules WHERE project_id=? AND rule_key='free_ai_budget' LIMIT 1").bind(PROJECT_ID).first());
 const v10=await objectExists(db,'trigger','trg_publications_require_approval_insert');
 return{tables,content_items_columns:ci,v2,v3,partial_v3,project_ready,v4,v5,v6,v7,v8,v9,v10,ready:v2&&v3&&v4&&v5&&v6&&v7&&v8&&v9&&v10};
}
async function assetText(request,env,path){const r=await env.ASSETS.fetch(new Request(new URL(path,request.url)));if(!r.ok)throw new Error(`${path} unavailable (${r.status})`);return r.text()}
async function applyFile(request,env,path){await env.DB.exec(await assetText(request,env,path))}
async function applyMigrations(request,env){
 let s=await schemaStatus(env.DB);const before=s,applied=[];
 if(!s.v2)return json({ok:false,error:'base schema v2 missing; bootstrap refused',schema:s},409);
 if(s.partial_v3)return json({ok:false,error:'partial schema v3 detected; automatic ALTER replay refused',schema:s},409);
 const steps=[['v3','/db/schema_v3.sql'],['v4','/db/migration4_prepare_fr_and_cutover.sql'],['v5','/db/migration5_content_origin.sql'],['v6','/db/migration6_quote_pages_and_versions.sql'],['v7','/db/migration7_seed_required_outputs.sql'],['v8','/db/migration8_ai_generation.sql'],['v9','/db/migration9_runtime_hardening.sql'],['v10','/db/migration10_database_guardrails.sql']];
 for(const [key,path] of steps){
  if(!s[key]){
   if(key==='v4'&&!s.project_ready)return json({ok:false,error:`project row ${PROJECT_ID} missing; migration4 refused`,before,applied,schema:s},409);
   await applyFile(request,env,path);applied.push(key);s=await schemaStatus(env.DB);
   if(s.partial_v3)return json({ok:false,error:'migration left partial v3 state; stopped',before,applied,schema:s},409);
  }
 }
 return json({ok:true,before,applied,schema:s});
}

async function nextContentId(env){const row=await env.DB.prepare("SELECT id FROM content_items WHERE project_id=? AND id LIKE 'WQ%' ORDER BY CAST(SUBSTR(id,3) AS INTEGER) DESC LIMIT 1").bind(PROJECT_ID).first();const n=row?Number(String(row.id).slice(2))+1:1;return `WQ${String(Number.isFinite(n)?n:1).padStart(3,'0')}`}
async function listContent(env){return (await env.DB.prepare(`SELECT id,canonical_title,status,quote_type,author_name,original_language,attribution_status,approved_at,created_at,updated_at FROM content_items WHERE project_id=? ORDER BY COALESCE(sequence_no,0) DESC,created_at DESC LIMIT 100`).bind(PROJECT_ID).all()).results||[]}
async function getContent(env,id){
 const item=await env.DB.prepare(`SELECT * FROM content_items WHERE id=? AND project_id=?`).bind(id,PROJECT_ID).first();if(!item)return null;
 const versions=(await env.DB.prepare(`SELECT * FROM content_versions WHERE content_id=? ORDER BY language_code,version DESC`).bind(id).all()).results||[];
 let evidence=[],pages=[],approvals=[],pins=[],jobs=[];
 try{evidence=(await env.DB.prepare(`SELECT * FROM quote_source_evidence WHERE content_item_id=? ORDER BY id DESC`).bind(id).all()).results||[]}catch{}
 try{pages=(await env.DB.prepare(`SELECT * FROM quote_pages WHERE content_item_id=? ORDER BY language_code`).bind(id).all()).results||[]}catch{}
 try{approvals=(await env.DB.prepare(`SELECT * FROM content_approvals WHERE content_item_id=? ORDER BY id DESC`).bind(id).all()).results||[]}catch{}
 try{pins=(await env.DB.prepare(`SELECT * FROM pinterest_creatives WHERE content_item_id=? ORDER BY language_code`).bind(id).all()).results||[]}catch{}
 try{jobs=(await env.DB.prepare(`SELECT * FROM ai_generation_jobs WHERE content_item_id=? ORDER BY requested_at DESC LIMIT 50`).bind(id).all()).results||[]}catch{}
 return{...item,versions,source_evidence:evidence,quote_pages:pages,approvals,pinterest_creatives:pins,ai_jobs:jobs};
}
async function createContent(request,env){
 const b=await reqBody(request);if(!b?.quote)return json({ok:false,error:'quote required'},400);const type=b.quote_type==='verbatim'?'verbatim':'adapted';
 if(type==='verbatim'&&!nonempty(b.author_name))return json({ok:false,error:'author required for verbatim quote'},400);
 const id=safeId(b.content_id)||await nextContentId(env);if(await env.DB.prepare('SELECT 1 FROM content_items WHERE id=?').bind(id).first())return json({ok:false,error:'content_id already exists',id},409);
 const seq=Number(String(id).replace(/^WQ/i,''))||null,adapted=type==='adapted';
 await env.DB.prepare(`INSERT INTO content_items(id,project_id,content_type,sequence_no,category,canonical_title,source_text,source_name,source_url,status,facts_verified,uniqueness_verified,notes,created_at,updated_at,quote_type,original_quote,original_language,author_name,author_source,source_work,source_date,attribution_status,category_slug) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(id,PROJECT_ID,'quote',seq,b.category_slug||null,b.title||String(b.quote).slice(0,100),b.quote,adapted?null:(b.author_name||null),b.source_url||null,'idea',type==='verbatim'?0:1,0,b.notes||null,now(),now(),type,b.quote,b.original_language||'en',adapted?null:(b.author_name||null),adapted?null:(b.author_source||b.source_url||null),adapted?null:(b.source_work||null),adapted?null:(b.source_date||null),type==='verbatim'?'unverified':'not_required',b.category_slug||null).run();
 await env.DB.prepare(`INSERT INTO content_approvals(project_id,content_item_id,approval_scope,status,created_at,updated_at) SELECT ?,?,'content','pending',?,? WHERE NOT EXISTS(SELECT 1 FROM content_approvals WHERE content_item_id=? AND approval_scope='content' AND language_code IS NULL)`).bind(PROJECT_ID,id,now(),now(),id).run();
 return json({ok:true,id,item:await getContent(env,id)},201);
}
async function updateContent(request,env,id){
 const b=await reqBody(request),cur=await env.DB.prepare(`SELECT * FROM content_items WHERE id=? AND project_id=?`).bind(id,PROJECT_ID).first();if(!cur)return json({ok:false,error:'not found'},404);
 const type=b.quote_type??cur.quote_type,adapted=type==='adapted';let author=('author_name'in b)?b.author_name:cur.author_name;if(adapted)author=null;if(type==='verbatim'&&!nonempty(author))return json({ok:false,error:'author required for verbatim quote'},400);
 const authorSource=adapted?null:(('author_source'in b)?b.author_source:cur.author_source),sourceWork=adapted?null:(('source_work'in b)?b.source_work:cur.source_work),sourceDate=adapted?null:(('source_date'in b)?b.source_date:cur.source_date),sourceName=adapted?null:author;
 await env.DB.prepare(`UPDATE content_items SET canonical_title=?,original_quote=?,source_text=?,original_language=?,author_name=?,author_source=?,source_work=?,source_date=?,source_name=?,source_url=?,quote_type=?,category=?,category_slug=?,attribution_status=?,notes=?,updated_at=? WHERE id=? AND project_id=?`).bind(b.title??cur.canonical_title,b.quote??cur.original_quote,b.quote??cur.source_text,b.original_language??cur.original_language,author,authorSource,sourceWork,sourceDate,sourceName,b.source_url??cur.source_url,type,b.category_slug??cur.category,b.category_slug??cur.category_slug,adapted?'not_required':(b.attribution_status??cur.attribution_status),b.notes??cur.notes,now(),id,PROJECT_ID).run();
 return json({ok:true,item:await getContent(env,id)});
}
async function addEvidence(request,env,id){
 const b=await reqBody(request);if(!b?.source_type||!b?.original_text)return json({ok:false,error:'source_type and original_text required'},400);
 const item=await env.DB.prepare(`SELECT * FROM content_items WHERE id=? AND project_id=?`).bind(id,PROJECT_ID).first();if(!item)return json({ok:false,error:'content not found'},404);
 const verified=b.verified?1:0;
 if(verified&&item.quote_type==='verbatim'){
  const missing=[];if(!nonempty(item.author_name))missing.push('author_name');if(!nonempty(b.original_language))missing.push('original_language');if(!nonempty(b.source_locator))missing.push('source_locator');if(!nonempty(b.verification_notes))missing.push('verification_notes');if(!nonempty(b.source_title)&&!nonempty(b.source_url))missing.push('source_title_or_url');
  if(missing.length)return json({ok:false,error:'verified verbatim evidence incomplete',missing},400);
 }
 const r=await env.DB.prepare(`INSERT INTO quote_source_evidence(content_item_id,source_type,source_title,source_url,source_locator,original_text,original_language,verified,verification_notes,created_at) VALUES(?,?,?,?,?,?,?,?,?,?) RETURNING id`).bind(id,b.source_type,b.source_title||null,b.source_url||null,b.source_locator||null,b.original_text,b.original_language||null,verified,b.verification_notes||null,now()).first();
 if(verified)await env.DB.prepare(`UPDATE content_items SET original_quote=?,original_language=COALESCE(?,original_language),source_verified_at=?,source_verification_notes=?,attribution_status=CASE WHEN quote_type='verbatim' THEN 'verified' ELSE attribution_status END,facts_verified=1,updated_at=? WHERE id=? AND project_id=?`).bind(b.original_text,b.original_language||null,now(),b.verification_notes||null,now(),id,PROJECT_ID).run();
 return json({ok:true,evidence_id:r.id,item:await getContent(env,id)},201);
}
async function upsertVersion(request,env,id,lang){
 if(!LANGS.includes(lang))return json({ok:false,error:'unsupported language'},400);const b=await reqBody(request);if(!b?.adapted_text)return json({ok:false,error:'adapted_text required'},400);
 if(!await env.DB.prepare(`SELECT 1 FROM content_items WHERE id=? AND project_id=?`).bind(id,PROJECT_ID).first())return json({ok:false,error:'content not found'},404);
 const version=Number(b.version)||1,vid=`${id}_${lang}_v${version}`;
 await env.DB.prepare(`INSERT INTO content_versions(id,content_id,language_code,title,hook,adapted_text,line_breaks,key_facts,voiceover_text,video_concept,ai_prompt,on_screen_text,cta,status,language_check_status,approved,verification_date,source_urls,editor_notes,version) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(content_id,language_code,version) DO UPDATE SET title=excluded.title,hook=excluded.hook,adapted_text=excluded.adapted_text,line_breaks=excluded.line_breaks,key_facts=excluded.key_facts,voiceover_text=excluded.voiceover_text,video_concept=excluded.video_concept,ai_prompt=excluded.ai_prompt,on_screen_text=excluded.on_screen_text,cta=excluded.cta,status=excluded.status,language_check_status=excluded.language_check_status,approved=excluded.approved,verification_date=excluded.verification_date,source_urls=excluded.source_urls,editor_notes=excluded.editor_notes`).bind(vid,id,lang,b.title||null,b.hook||null,b.adapted_text,b.line_breaks||null,b.key_facts||null,b.voiceover_text||b.adapted_text,b.video_concept||null,b.ai_prompt||null,b.on_screen_text||b.adapted_text,b.cta||null,b.status||'localized',b.language_check_status||'pending',b.approved?1:0,b.verification_date||null,b.source_urls||null,b.editor_notes||null,version).run();
 return json({ok:true,content_id:id,language_code:lang,version,item:await getContent(env,id)});
}
async function setApproval(request,env,id){
 const b=await reqBody(request)||{},status=String(b.status||'').toLowerCase();if(!['pending','approved','rejected'].includes(status))return json({ok:false,error:'status must be pending, approved or rejected'},400);
 const item=await env.DB.prepare(`SELECT * FROM content_items WHERE id=? AND project_id=?`).bind(id,PROJECT_ID).first();if(!item)return json({ok:false,error:'content not found'},404);
 if(status==='approved'){
  const langs=await env.DB.prepare(`SELECT COUNT(DISTINCT language_code) AS n FROM content_versions WHERE content_id=?`).bind(id).first();if(Number(langs?.n||0)<LANGS.length)return json({ok:false,error:'all 8 language versions are required before approval',have:Number(langs?.n||0),need:LANGS.length},409);
  if(item.quote_type==='verbatim'){
   if(item.attribution_status!=='verified'||!item.source_verified_at||!nonempty(item.author_name)||!nonempty(item.original_quote)||!nonempty(item.original_language))return json({ok:false,error:'verified attribution required before approval'},409);
   const ev=await env.DB.prepare(`SELECT 1 AS ok FROM quote_source_evidence WHERE content_item_id=? AND verified=1 AND TRIM(COALESCE(original_text,''))<>'' AND TRIM(COALESCE(original_language,''))<>'' AND TRIM(COALESCE(source_locator,''))<>'' AND TRIM(COALESCE(verification_notes,''))<>'' AND (TRIM(COALESCE(source_title,''))<>'' OR TRIM(COALESCE(source_url,''))<>'') LIMIT 1`).bind(id).first();if(!ev)return json({ok:false,error:'complete verified source evidence required before approval'},409);
  }
 }
 const existing=await env.DB.prepare(`SELECT id FROM content_approvals WHERE content_item_id=? AND approval_scope='content' AND language_code IS NULL ORDER BY id LIMIT 1`).bind(id).first();
 if(existing)await env.DB.prepare(`UPDATE content_approvals SET status=?,approved_by=?,notes=?,updated_at=? WHERE id=?`).bind(status,b.approved_by||'admin',b.notes||null,now(),existing.id).run();
 else await env.DB.prepare(`INSERT INTO content_approvals(project_id,content_item_id,approval_scope,language_code,status,approved_by,notes,created_at,updated_at) VALUES(?,?,'content',NULL,?,?,?,?,?)`).bind(PROJECT_ID,id,status,b.approved_by||'admin',b.notes||null,now(),now()).run();
 await env.DB.prepare(`UPDATE content_items SET approved_at=?,status=?,updated_at=? WHERE id=? AND project_id=?`).bind(status==='approved'?now():null,status==='approved'?'approved':status,now(),id,PROJECT_ID).run();
 return json({ok:true,status,item:await getContent(env,id)});
}
async function upsertPage(request,env,id,lang){
 if(!LANGS.includes(lang))return json({ok:false,error:'unsupported language'},400);const b=await reqBody(request)||{};
 const item=await env.DB.prepare(`SELECT * FROM content_items WHERE id=? AND project_id=?`).bind(id,PROJECT_ID).first();if(!item)return json({ok:false,error:'content not found'},404);
 const v=await env.DB.prepare(`SELECT * FROM content_versions WHERE content_id=? AND language_code=? ORDER BY version DESC LIMIT 1`).bind(id,lang).first();if(!v)return json({ok:false,error:'localized content_version missing'},409);
 const status=['draft','ready','published'].includes(String(b.status||''))?String(b.status):'draft';
 if(status==='published'){
  const approved=await env.DB.prepare(`SELECT 1 AS ok FROM content_approvals WHERE content_item_id=? AND approval_scope='content' AND language_code IS NULL AND status='approved' LIMIT 1`).bind(id).first();if(!approved)return json({ok:false,error:'content approval required before publishing website page'},409);
 }
 const slug=slugify(b.slug||v.title||v.adapted_text),pageId=`PAGE_${id}_${lang}`,canonicalPath=`/${lang}/quotes/${slug}/`;
 await env.DB.prepare(`INSERT INTO quote_pages(id,project_id,content_item_id,content_version_id,language_code,slug,seo_title,meta_description,reflection_title,reflection_body,canonical_path,status,published_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(content_version_id) DO UPDATE SET slug=excluded.slug,seo_title=excluded.seo_title,meta_description=excluded.meta_description,reflection_title=excluded.reflection_title,reflection_body=excluded.reflection_body,canonical_path=excluded.canonical_path,status=excluded.status,published_at=excluded.published_at,updated_at=excluded.updated_at`).bind(pageId,PROJECT_ID,id,v.id,lang,slug,b.seo_title||v.title||v.adapted_text,b.meta_description||null,b.reflection_title||null,b.reflection_body||null,canonicalPath,status,status==='published'?now():null,now()).run();
 return json({ok:true,content_id:id,language_code:lang,slug,canonical_path:canonicalPath,status,item:await getContent(env,id)});
}

async function mediaList(env){try{return (await env.DB.prepare(`SELECT * FROM media_inbox WHERE project_id=? ORDER BY created_at DESC LIMIT 100`).bind(PROJECT_ID).all()).results||[]}catch{return[]}}
async function mediaUpload(request,env){
 if(!env.MEDIA)return json({ok:false,error:'R2 binding MEDIA unavailable'},503);const form=await request.formData(),file=form.get('file');if(!file||typeof file==='string')return json({ok:false,error:'file required'},400);
 const lang=String(form.get('language_code')||'').toLowerCase();if(lang&&!LANGS.includes(lang))return json({ok:false,error:'unsupported language'},400);const contentId=safeId(form.get('content_item_id'))||null;
 if(contentId&&!await env.DB.prepare(`SELECT 1 FROM content_items WHERE id=? AND project_id=?`).bind(contentId,PROJECT_ID).first())return json({ok:false,error:'content_item_id not found'},404);
 const mediaId=crypto.randomUUID(),filename=String(file.name||'upload.bin').replace(/[^a-zA-Z0-9._-]/g,'_'),key=`uploads/${new Date().toISOString().slice(0,10)}/${mediaId}-${filename}`;
 await env.MEDIA.put(key,await file.arrayBuffer(),{httpMetadata:{contentType:file.type||'application/octet-stream'}});
 try{await env.DB.prepare(`INSERT INTO media_inbox(id,project_id,content_item_id,content_version_id,r2_key,original_filename,asset_type,language_code,mime_type,size_bytes,status,uploaded_via,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(mediaId,PROJECT_ID,contentId,null,key,file.name,form.get('asset_type')||'unknown',lang||null,file.type||null,file.size,'unassigned','admin',now(),now()).run()}catch(e){await env.MEDIA.delete(key);return json({ok:false,error:'db_insert_failed_r2_rolled_back',detail:String(e.message||e)},500)}
 return json({ok:true,id:mediaId,key,name:file.name},201);
}

async function generatePinterest(request,env,id,lang){
 if(!env.AI)return json({ok:false,error:'AI binding unavailable'},503);if(!env.MEDIA)return json({ok:false,error:'R2 MEDIA binding unavailable'},503);if(!LANGS.includes(lang))return json({ok:false,error:'unsupported language'},400);
 const item=await env.DB.prepare(`SELECT * FROM content_items WHERE id=? AND project_id=?`).bind(id,PROJECT_ID).first();if(!item)return json({ok:false,error:'content not found'},404);
 if(item.quote_type==='verbatim'&&item.attribution_status!=='verified')return json({ok:false,error:'verbatim source must be verified before creative generation'},409);
 const v=await env.DB.prepare(`SELECT * FROM content_versions WHERE content_id=? AND language_code=? ORDER BY version DESC LIMIT 1`).bind(id,lang).first();if(!v)return json({ok:false,error:'localized content_version missing'},409);
 const b=await reqBody(request)||{};const author=item.quote_type==='verbatim'&&item.author_name&&item.attribution_status==='verified'?item.author_name:null;
 const concept=b.video_concept||v.video_concept||'cinematic symbolic scene that expresses the meaning of the quote';
 const prompt=b.prompt||`Create a premium vertical Pinterest poster, portrait 2:3 composition, target 1000x1500. Preserve the SAME semantic visual story as this video concept: ${concept}. Localized quote must be the focal text and must be rendered exactly, with no extra words: “${v.adapted_text}”. ${author?`Show author attribution exactly as “${author}”.`:'Do not show any author name or attribution.'} Add only small brand text “Wise Quotes World ${lang.toUpperCase()}”. Mobile-readable typography, generous safe margins, elegant cinematic lighting, no fake UI, no third-party logos, no watermark, no unrelated text.`;
 const jobId=crypto.randomUUID();
 await env.DB.prepare(`INSERT INTO ai_generation_jobs(id,project_id,content_item_id,content_version_id,language_code,job_type,provider,model,prompt,status,attempt_count,requested_at,started_at) VALUES(?,?,?,?,?,'pinterest_image','cloudflare-workers-ai',?,?,'running',1,?,?)`).bind(jobId,PROJECT_ID,id,v.id,lang,PIN_MODEL,prompt,now(),now()).run();
 try{
  const result=await env.AI.run(PIN_MODEL,{prompt});if(!result?.image)throw new Error('model returned no image');
  const bytes=b64bytes(result.image),mediaId=crypto.randomUUID(),key=`generated/pinterest/${new Date().toISOString().slice(0,10)}/${id}-${lang}-${mediaId}.jpg`;
  await env.MEDIA.put(key,bytes,{httpMetadata:{contentType:'image/jpeg'}});
  try{
   await env.DB.prepare(`INSERT INTO media_inbox(id,project_id,content_item_id,content_version_id,r2_key,original_filename,asset_type,language_code,mime_type,size_bytes,width,height,status,keep_forever,uploaded_via,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(mediaId,PROJECT_ID,id,v.id,key,`${id}_${lang}_PIN.jpg`,'pinterest',lang,'image/jpeg',bytes.byteLength,null,null,'ready',1,'workers-ai',now(),now()).run();
   const pinId=`PIN_${id}_${lang}`;
   await env.DB.prepare(`INSERT INTO pinterest_creatives(id,project_id,content_item_id,content_version_id,language_code,video_concept_summary,still_image_prompt,width,height,media_inbox_id,qa_status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?, 'pending',?,?) ON CONFLICT(content_version_id) DO UPDATE SET video_concept_summary=excluded.video_concept_summary,still_image_prompt=excluded.still_image_prompt,media_inbox_id=excluded.media_inbox_id,qa_status='pending',qa_notes=NULL,approved_at=NULL,updated_at=excluded.updated_at`).bind(pinId,PROJECT_ID,id,v.id,lang,concept,prompt,1000,1500,mediaId,now(),now()).run();
   await env.DB.prepare(`UPDATE ai_generation_jobs SET status='succeeded',media_inbox_id=?,finished_at=? WHERE id=?`).bind(mediaId,now(),jobId).run();
   return json({ok:true,job_id:jobId,media_id:mediaId,r2_key:key,qa_status:'pending',model:PIN_MODEL,target:{width:1000,height:1500},actual_dimensions:null},201);
  }catch(e){await env.MEDIA.delete(key);throw e}
 }catch(e){await env.DB.prepare(`UPDATE ai_generation_jobs SET status='failed',error_detail=?,finished_at=? WHERE id=?`).bind(String(e.message||e),now(),jobId).run();return json({ok:false,error:'ai_generation_failed',job_id:jobId,detail:String(e.message||e)},502)}
}
async function setPinterestQa(request,env,id,lang){
 if(!LANGS.includes(lang))return json({ok:false,error:'unsupported language'},400);const b=await reqBody(request)||{},status=String(b.status||'').toLowerCase();if(!['pending','approved','rejected'].includes(status))return json({ok:false,error:'status must be pending, approved or rejected'},400);
 const v=await env.DB.prepare(`SELECT id FROM content_versions WHERE content_id=? AND language_code=? ORDER BY version DESC LIMIT 1`).bind(id,lang).first();if(!v)return json({ok:false,error:'localized content_version missing'},404);
 const pin=await env.DB.prepare(`SELECT * FROM pinterest_creatives WHERE content_version_id=?`).bind(v.id).first();if(!pin)return json({ok:false,error:'Pinterest creative missing'},404);if(status==='approved'&&!pin.media_inbox_id)return json({ok:false,error:'creative has no generated/uploaded media'},409);
 await env.DB.prepare(`UPDATE pinterest_creatives SET qa_status=?,qa_notes=?,approved_at=?,updated_at=? WHERE content_version_id=?`).bind(status,b.notes||null,status==='approved'?now():null,now(),v.id).run();
 return json({ok:true,status,item:await getContent(env,id)});
}

async function publicQuotePage(env,origin,lang,slug){
 if(!env.DB)return null;
 try{
  const row=await env.DB.prepare(`SELECT q.*,v.adapted_text,v.title,v.hook,c.author_name,c.quote_type,c.attribution_status FROM quote_pages q JOIN content_versions v ON v.id=q.content_version_id JOIN content_items c ON c.id=q.content_item_id WHERE q.project_id=? AND q.language_code=? AND q.slug=? AND q.status='published' LIMIT 1`).bind(PROJECT_ID,lang,slug).first();if(!row)return null;
  const alts=(await env.DB.prepare(`SELECT language_code,canonical_path FROM quote_pages WHERE content_item_id=? AND status='published' ORDER BY language_code`).bind(row.content_item_id).all()).results||[];
  const canonical=new URL(row.canonical_path,origin).href,altTags=alts.map(x=>`<link rel="alternate" hreflang="${esc(x.language_code)}" href="${esc(new URL(x.canonical_path,origin).href)}">`).join('');
  const author=row.quote_type==='verbatim'&&row.attribution_status==='verified'&&row.author_name?`<p class="author">— ${esc(row.author_name)}</p>`:'';
  const reflection=row.reflection_body?`<section><h2>${esc(row.reflection_title||'Reflection')}</h2><p>${esc(row.reflection_body)}</p></section>`:'';
  const html=`<!doctype html><html lang="${esc(lang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(row.seo_title||row.title||row.adapted_text)}</title>${row.meta_description?`<meta name="description" content="${esc(row.meta_description)}">`:''}<link rel="canonical" href="${esc(canonical)}">${altTags}<style>body{font-family:system-ui,-apple-system,sans-serif;margin:0;background:#faf9f6;color:#171717}.wrap{max-width:820px;margin:auto;padding:48px 22px}.quote{font-size:clamp(30px,6vw,54px);line-height:1.15;font-weight:650;margin:80px 0 18px}.author{font-size:18px;opacity:.7}.back{display:inline-block;margin-top:48px;color:inherit}section{margin-top:54px;line-height:1.7}</style></head><body><main class="wrap"><article><div class="quote">“${esc(row.adapted_text)}”</div>${author}${reflection}<a class="back" href="/${esc(lang)}/quotes/">Wise Quotes World</a></article></main></body></html>`;
  return new Response(html,{headers:{'content-type':'text/html; charset=utf-8','cache-control':'public, max-age=300'}});
 }catch{return null}
}
async function sitemap(env,origin){
 if(!env.DB)return null;try{const rows=(await env.DB.prepare(`SELECT language_code,canonical_path,updated_at FROM quote_pages WHERE project_id=? AND status='published' ORDER BY language_code,canonical_path`).bind(PROJECT_ID).all()).results||[];const urls=[];for(const l of LANGS)urls.push(`<url><loc>${esc(new URL(`/${l}/`,origin).href)}</loc></url>`);for(const r of rows)urls.push(`<url><loc>${esc(new URL(r.canonical_path,origin).href)}</loc>${r.updated_at?`<lastmod>${esc(String(r.updated_at).slice(0,10))}</lastmod>`:''}</url>`);return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`,{headers:{'content-type':'application/xml; charset=utf-8','cache-control':'public, max-age=300'}})}catch{return null}
}

function adminHtml(){return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Wise Quotes Admin</title><style>body{font-family:system-ui;margin:0;background:#f5f5f3;color:#171717}.wrap{max-width:1000px;margin:auto;padding:20px}section{background:white;padding:18px;border-radius:16px;margin:14px 0}input,select,textarea,button{font:inherit;padding:10px;margin:5px 0;box-sizing:border-box}input,select,textarea{width:100%}button{cursor:pointer}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}pre{white-space:pre-wrap;overflow:auto}@media(max-width:650px){.grid{grid-template-columns:1fr}}</style></head><body><div class="wrap"><h1>Wise Quotes World — Admin</h1><section><label>Admin token</label><input id="token" type="password" autocomplete="current-password"><button onclick="connect()">Connect / schema</button><button onclick="migrate()">Apply migrations</button><pre id="status"></pre></section><section><h2>New quote</h2><div class="grid"><input id="cid" placeholder="Content ID (auto WQxxx)"><select id="type"><option value="adapted">Adapted / Wise Quotes</option><option value="verbatim">Verbatim / attributed</option></select></div><textarea id="quote" rows="4" placeholder="Original quote"></textarea><div class="grid"><input id="author" placeholder="Author (verbatim only)"><select id="olang">${LANGS.map(x=>`<option value="${x}">${x}</option>`).join('')}</select></div><input id="source" placeholder="Source URL / bibliographic source"><input id="category" placeholder="Category"><button onclick="createQuote()">Save to D1</button><pre id="createOut"></pre></section><section><h2>Approval</h2><div class="grid"><input id="approveCid" placeholder="Content ID, e.g. WQ006"><select id="approveStatus"><option value="approved">Approve</option><option value="pending">Pending</option><option value="rejected">Reject</option></select></div><textarea id="approveNotes" rows="2" placeholder="Approval notes"></textarea><button onclick="approveContent()">Apply approval state</button><pre id="approveOut"></pre></section><section><h2>Website quote page</h2><div class="grid"><input id="pageCid" placeholder="Content ID"><select id="pageLang">${LANGS.map(x=>`<option value="${x}">${x}</option>`).join('')}</select></div><div class="grid"><input id="pageSlug" placeholder="Slug (optional)"><select id="pageStatus"><option value="draft">Draft</option><option value="ready">Ready</option><option value="published">Published</option></select></div><input id="pageSeo" placeholder="SEO title (optional)"><textarea id="pageMeta" rows="2" placeholder="Meta description"></textarea><textarea id="pageReflection" rows="3" placeholder="Reflection/body (optional)"></textarea><button onclick="savePage()">Save D1 quote page</button><pre id="pageOut"></pre></section><section><h2>Automatic Pinterest AI</h2><div class="grid"><input id="pinCid" placeholder="Content ID, e.g. WQ006"><select id="pinLang">${LANGS.map(x=>`<option value="${x}">${x}</option>`).join('')}</select></div><button onclick="genPin()">Generate Pinterest image → R2</button><div class="grid"><select id="pinQa"><option value="approved">QA approve</option><option value="pending">QA pending</option><option value="rejected">QA reject</option></select><input id="pinQaNotes" placeholder="QA notes"></div><button onclick="qaPin()">Apply Pinterest QA</button><pre id="pinOut"></pre></section><section><h2>Media Inbox</h2><div class="grid"><input id="media" type="file"><select id="mlang">${LANGS.map(x=>`<option value="${x}">${x}</option>`).join('')}</select></div><select id="atype"><option value="video">Video</option><option value="pinterest">Pinterest 2:3</option><option value="image">Image</option></select><input id="mediaCid" placeholder="Content ID"><button onclick="upload()">Upload to R2</button><pre id="uploadOut"></pre></section><section><h2>Content</h2><button onclick="loadAll()">Refresh</button><pre id="content"></pre></section></div><script>const H=(j=true)=>j?{'authorization':'Bearer '+token.value,'content-type':'application/json'}:{'authorization':'Bearer '+token.value};async function out(r,e){let x;try{x=await r.json()}catch{x={status:r.status}};e.textContent=JSON.stringify(x,null,2);return x}async function connect(){await out(await fetch('/api/admin/schema',{headers:H(false)}),status);await loadAll()}async function migrate(){await out(await fetch('/api/admin/migrate',{method:'POST',headers:H(false)}),status);await loadAll()}async function loadAll(){await out(await fetch('/api/admin/content',{headers:H(false)}),content)}async function createQuote(){const b={content_id:cid.value,quote_type:type.value,quote:quote.value,author_name:author.value||null,author_source:source.value||null,source_url:source.value||null,category_slug:category.value||null,original_language:olang.value};await out(await fetch('/api/admin/content',{method:'POST',headers:H(),body:JSON.stringify(b)}),createOut);await loadAll()}async function approveContent(){const b={status:approveStatus.value,notes:approveNotes.value||null};await out(await fetch('/api/admin/content/'+encodeURIComponent(approveCid.value)+'/approval',{method:'POST',headers:H(),body:JSON.stringify(b)}),approveOut);await loadAll()}async function savePage(){const b={slug:pageSlug.value||null,status:pageStatus.value,seo_title:pageSeo.value||null,meta_description:pageMeta.value||null,reflection_body:pageReflection.value||null};await out(await fetch('/api/admin/content/'+encodeURIComponent(pageCid.value)+'/pages/'+pageLang.value,{method:'PUT',headers:H(),body:JSON.stringify(b)}),pageOut);await loadAll()}async function genPin(){await out(await fetch('/api/admin/content/'+encodeURIComponent(pinCid.value)+'/pinterest/'+pinLang.value+'/generate',{method:'POST',headers:H(),body:'{}'}),pinOut);await loadAll()}async function qaPin(){const b={status:pinQa.value,notes:pinQaNotes.value||null};await out(await fetch('/api/admin/content/'+encodeURIComponent(pinCid.value)+'/pinterest/'+pinLang.value+'/qa',{method:'POST',headers:H(),body:JSON.stringify(b)}),pinOut);await loadAll()}async function upload(){if(!media.files[0])return;const f=new FormData();f.append('file',media.files[0]);f.append('language_code',mlang.value);f.append('asset_type',atype.value);if(mediaCid.value)f.append('content_item_id',mediaCid.value);await out(await fetch('/api/admin/media',{method:'POST',headers:H(false),body:f}),uploadOut)}</script></body></html>`}

async function api(request,env,url){
 if(url.pathname==='/api/health')return json({ok:true,project:PROJECT_ID,languages:LANGS,db:!!env.DB,r2:!!env.MEDIA,ai:!!env.AI,admin_secret:!!env.ADMIN_TOKEN,pinterest_model:PIN_MODEL});
 if(!env.DB)return json({ok:false,error:'DB binding unavailable'},503);if(!url.pathname.startsWith('/api/admin/'))return json({ok:false,error:'not found'},404);const deny=requireAdmin(request,env);if(deny)return deny;
 const pub=await publicationApi(request,env,url);if(pub)return pub;
 if(url.pathname==='/api/admin/schema'&&request.method==='GET')return json({ok:true,schema:await schemaStatus(env.DB),bindings:{r2:!!env.MEDIA,ai:!!env.AI}});
 if(url.pathname==='/api/admin/migrate'&&request.method==='POST')return applyMigrations(request,env);
 if(url.pathname==='/api/admin/content'&&request.method==='GET')return json({ok:true,items:await listContent(env)});if(url.pathname==='/api/admin/content'&&request.method==='POST')return createContent(request,env);
 const evidence=url.pathname.match(/^\/api\/admin\/content\/([A-Za-z0-9_-]+)\/evidence$/);if(evidence&&request.method==='POST')return addEvidence(request,env,evidence[1]);
 const version=url.pathname.match(/^\/api\/admin\/content\/([A-Za-z0-9_-]+)\/versions\/(uk|ru|pl|en|sv|de|es|fr)$/);if(version&&request.method==='PUT')return upsertVersion(request,env,version[1],version[2]);
 const approval=url.pathname.match(/^\/api\/admin\/content\/([A-Za-z0-9_-]+)\/approval$/);if(approval&&request.method==='POST')return setApproval(request,env,approval[1]);
 const page=url.pathname.match(/^\/api\/admin\/content\/([A-Za-z0-9_-]+)\/pages\/(uk|ru|pl|en|sv|de|es|fr)$/);if(page&&request.method==='PUT')return upsertPage(request,env,page[1],page[2]);
 const pinQa=url.pathname.match(/^\/api\/admin\/content\/([A-Za-z0-9_-]+)\/pinterest\/(uk|ru|pl|en|sv|de|es|fr)\/qa$/);if(pinQa&&request.method==='POST')return setPinterestQa(request,env,pinQa[1],pinQa[2]);
 const pin=url.pathname.match(/^\/api\/admin\/content\/([A-Za-z0-9_-]+)\/pinterest\/(uk|ru|pl|en|sv|de|es|fr)\/generate$/);if(pin&&request.method==='POST')return generatePinterest(request,env,pin[1],pin[2]);
 const item=url.pathname.match(/^\/api\/admin\/content\/([A-Za-z0-9_-]+)$/);if(item&&request.method==='GET'){const x=await getContent(env,item[1]);return x?json({ok:true,item:x}):json({ok:false,error:'not found'},404)}if(item&&request.method==='PATCH')return updateContent(request,env,item[1]);
 if(url.pathname==='/api/admin/media'&&request.method==='GET')return json({ok:true,items:await mediaList(env)});if(url.pathname==='/api/admin/media'&&request.method==='POST')return mediaUpload(request,env);
 return json({ok:false,error:'not found'},404);
}

export default{async fetch(request,env){const url=new URL(request.url);try{if(url.pathname==='/admin'||url.pathname==='/admin/')return new Response(adminHtml(),{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-robots-tag':'noindex,nofollow'}});if(url.pathname.startsWith('/api/'))return api(request,env,url);if(url.pathname==='/sitemap.xml'){const s=await sitemap(env,url.origin);if(s)return s}const q=url.pathname.match(/^\/(uk|ru|pl|en|sv|de|es|fr)\/quotes\/([^/]+)\/?$/);if(q){const p=await publicQuotePage(env,url.origin,q[1],decodeURIComponent(q[2]));if(p)return p}if(url.pathname==='/'||url.pathname==='/index.html')return Response.redirect(`${url.origin}/${preferred(request)}/`,302);return env.ASSETS.fetch(request)}catch(e){return json({ok:false,error:String(e?.message||e)},500)}}};