import legacyWorker from './_worker_legacy.js';

const PROJECT_ID='wisequotesworld';
const LANGS=[['uk','Ukrainian','Українська'],['ru','Russian','Русский'],['pl','Polish','Polski'],['en','English','English'],['sv','Swedish','Svenska'],['de','German','Deutsch'],['es','Spanish','Español']];
const PLATFORMS=['website','pinterest','facebook','instagram','threads','tiktok','youtube'];

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}})}
function authorized(request,env){return !!env.ADMIN_TOKEN&&(request.headers.get('authorization')||'')===`Bearer ${env.ADMIN_TOKEN}`}
function now(){return new Date().toISOString()}
async function tableNames(db){return ((await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all()).results||[]).map(x=>x.name)}
async function columns(db,table){try{return ((await db.prepare(`PRAGMA table_info(${table})`).all()).results||[]).map(x=>x.name)}catch{return[]}}
async function objectExists(db,type,name){try{return !!(await db.prepare("SELECT 1 AS ok FROM sqlite_master WHERE type=? AND name=? LIMIT 1").bind(type,name).first())}catch{return false}}

async function schemaStatus(db){
 const tables=await tableNames(db),ci=tables.includes('content_items')?await columns(db,'content_items'):[];
 const userTables=tables.filter(name=>!name.startsWith('_cf_'));
 const empty=userTables.length===0;
 const v2=tables.includes('projects')&&tables.includes('languages')&&tables.includes('rules')&&tables.includes('content_items')&&tables.includes('content_versions');
 const v3Columns=['quote_type','original_quote','original_language','author_name','author_source','source_work','source_date','attribution_status','category_slug'];
 const v3Tables=['workflow_steps','required_outputs','language_style_profiles','automation_integrations','media_inbox','media_usage','quote_categories','authors','pinterest_creatives','publication_attempts','ai_query_log'];
 const v3=v2&&v3Columns.every(x=>ci.includes(x))&&v3Tables.every(x=>tables.includes(x));
 const partial_v3=v2&&!v3&&(v3Columns.some(x=>ci.includes(x))||v3Tables.some(x=>tables.includes(x)));
 const project_ready=v2?!!(await db.prepare("SELECT 1 AS ok FROM projects WHERE id=? LIMIT 1").bind(PROJECT_ID).first()):false;
 const v4=v3&&tables.includes('project_languages')&&!!(await db.prepare("SELECT 1 AS ok FROM languages WHERE code='fr'").first());
 const v5=v3&&ci.includes('source_verified_at')&&ci.includes('source_verification_notes')&&tables.includes('quote_source_evidence');
 const v6=tables.includes('quote_pages')&&tables.includes('content_approvals');
 const v7=tables.includes('rules')&&tables.includes('required_outputs')?!!(await db.prepare("SELECT 1 AS ok FROM rules WHERE project_id=? AND rule_key='verbatim_requires_verified_source' LIMIT 1").bind(PROJECT_ID).first()):false;
 const v8=tables.includes('ai_generation_jobs');
 const v9=tables.includes('rules')?!!(await db.prepare("SELECT 1 AS ok FROM rules WHERE project_id=? AND rule_key='free_ai_budget' LIMIT 1").bind(PROJECT_ID).first()):false;
 const v10=await objectExists(db,'trigger','trg_publications_require_approval_insert');
 return{tables,user_tables:userTables,empty,v2,v3,partial_v3,project_ready,v4,v5,v6,v7,v8,v9,v10,ready:v2&&v3&&v4&&v5&&v6&&v7&&v8&&v9&&v10,content_items_columns:ci};
}

async function assetText(request,env,path){
 if(!env.ASSETS)throw new Error('ASSETS binding unavailable');
 const u=new URL(request.url);u.pathname=path;u.search='';u.hash='';
 const r=await env.ASSETS.fetch(u.toString());
 if(!r.ok)throw new Error(`${path} unavailable (${r.status})`);
 return r.text();
}
function sanitizeSqlForD1(sql){
 const lines=String(sql||'').replace(/\r\n?/g,'\n').split('\n');
 const cleaned=[];
 for(const line of lines){
   const t=line.trim();
   if(!t)continue;
   if(t.startsWith('--'))continue;
   if(/^PRAGMA\s+foreign_keys\s*=\s*(?:ON|OFF|1|0)\s*;?$/i.test(t))continue;
   cleaned.push(t);
 }
 return cleaned.join(' ').replace(/\s+/g,' ').trim();
}
async function applyFile(request,env,path){
 const raw=await assetText(request,env,path);
 const sql=sanitizeSqlForD1(raw);
 if(!sql||sql.length<10)throw new Error(`${path} empty after D1 sanitization`);
 await env.DB.exec(sql);
}
async function seedBase(db){
 await db.prepare("INSERT OR IGNORE INTO projects(id,name,timezone,active) VALUES(?,?,?,1)").bind(PROJECT_ID,'Wise Quotes World','Europe/Stockholm').run();
 for(const [code,name,nativeName] of LANGS)await db.prepare("INSERT OR IGNORE INTO languages(code,name,native_name,active) VALUES(?,?,?,1)").bind(code,name,nativeName).run();
 for(const code of PLATFORMS)await db.prepare("INSERT OR IGNORE INTO platforms(code,name,active) VALUES(?,?,1)").bind(code,code[0].toUpperCase()+code.slice(1)).run();
 for(const [code] of LANGS)await db.prepare("INSERT OR IGNORE INTO project_languages(project_id,language_code,active) VALUES(?,?,1)").bind(PROJECT_ID,code).run();
}

const STEPS=[
 ['v2','/db/schema_v2.sql'],
 ['v3','/db/schema_v3.sql'],
 ['v4','/db/migration4_prepare_fr_and_cutover.sql'],
 ['v5','/db/migration5_content_origin.sql'],
 ['v6','/db/migration6_quote_pages_and_versions.sql'],
 ['v7','/db/migration7_seed_required_outputs.sql'],
 ['v8','/db/migration8_ai_generation.sql'],
 ['v9','/db/migration9_runtime_hardening.sql'],
 ['v10','/db/migration10_database_guardrails.sql']
];

async function migrateOne(request,env){
 if(!env.DB)return json({ok:false,error:'DB binding unavailable'},503);
 const before=await schemaStatus(env.DB);
 if(before.ready)return json({ok:true,done:true,message:'schema already ready',before,schema:before});
 if(before.partial_v3)return json({ok:false,error:'partial schema v3 detected; automatic ALTER replay refused',schema:before},409);
 let next=null;
 for(const [key,path] of STEPS){if(!before[key]){next={key,path};break}}
 if(!next)return json({ok:false,error:'no migration step resolved',schema:before},409);
 if(next.key==='v2'&&!before.empty)return json({ok:false,error:'non-empty D1 without recognized schema v2; automatic bootstrap refused',schema:before},409);
 if(next.key==='v4'&&!before.project_ready)return json({ok:false,error:`project row ${PROJECT_ID} missing; migration4 refused`,schema:before},409);
 try{
   await applyFile(request,env,next.path);
   if(next.key==='v2')await seedBase(env.DB);
   const after=await schemaStatus(env.DB);
   if(!after[next.key])return json({ok:false,error:`${next.key} executed but validation failed`,step:next,before,schema:after},500);
   return json({ok:true,step:next.key,path:next.path,before,schema:after,next:after.ready?null:STEPS.find(([k])=>!after[k])?.[0]||null});
 }catch(e){
   let after=null;try{after=await schemaStatus(env.DB)}catch{}
   return json({ok:false,error:String(e?.message||e),name:e?.name||null,step:next,before,schema:after},500);
 }
}

const WQ006={
 uk:{quote:'Не кожне рішення змінює життя одразу. Але деякі тихо змінюють напрямок.',slug:'ne-kozhne-rishennia-zminiuie-zhyttia',concept:'Early morning in a quiet Ukrainian city street. A thoughtful adult reaches a calm pedestrian fork, pauses, then chooses the brighter side street. No triumph pose; the meaning is a subtle change of direction.'},
 ru:{quote:'Не каждое решение сразу меняет жизнь. Но некоторые тихо меняют её направление.',slug:'ne-kazhdoe-reshenie-menyaet-zhizn',concept:'A quiet residential city path at dawn. One person reaches a fork between two ordinary routes and calmly chooses one. The visual should communicate a small decision that changes direction, not instant success.'},
 pl:{quote:'Nie każda decyzja od razu zmienia życie. Niektóre po cichu zmieniają jego kierunek.',slug:'nie-kazda-decyzja-zmienia-zycie',concept:'Soft Warsaw-like morning atmosphere. A person walking alone reaches two diverging pedestrian paths and chooses one without drama. Subtle cinematic realism, the decision changes direction quietly.'},
 en:{quote:'Not every decision changes your life at once. Some quietly change its direction.',slug:'not-every-decision-changes-your-life',concept:'Calm early-morning city walkway. A thoughtful person reaches an ordinary fork in the path and quietly chooses one direction. Cinematic realism, no instant victory, just a subtle directional change.'},
 sv:{quote:'Alla beslut förändrar inte livet direkt. Men vissa ändrar stilla dess riktning.',slug:'alla-beslut-forandrar-inte-livet-direkt',concept:'Soft Scandinavian dawn on a clean pedestrian path. A person arrives at a quiet fork and chooses one route. Understated Swedish visual language, natural light, no dramatic victory.'},
 de:{quote:'Nicht jede Entscheidung verändert dein Leben sofort. Manche verändern still seine Richtung.',slug:'nicht-jede-entscheidung-verandert-dein-leben',concept:'Quiet European city morning. A person reaches a simple fork between two walking paths and chooses one. Restrained cinematic realism; the idea is a quiet change of direction, not immediate transformation.'},
 es:{quote:'No todas las decisiones cambian tu vida de inmediato. Algunas cambian su rumbo en silencio.',slug:'no-todas-las-decisiones-cambian-tu-vida',concept:'Warm but soft early-morning urban walkway. A person reaches a fork and calmly takes one route. Natural Spanish-city atmosphere, subtle and reflective, emphasizing direction rather than instant success.'},
 fr:{quote:'Toutes les décisions ne changent pas une vie immédiatement. Certaines en changent discrètement la direction.',slug:'toutes-les-decisions-ne-changent-pas-une-vie',concept:'Quiet Parisian-style neighborhood morning without landmarks. A person reaches a modest fork in a pedestrian route and chooses one path. Elegant restrained realism; a silent change of direction rather than a dramatic breakthrough.'}
};

async function seedWQ006(env){
 const s=await schemaStatus(env.DB);if(!s.ready)return json({ok:false,error:'schema not ready',schema:s},409);
 const t=now(),canonical=WQ006.uk.quote;
 await env.DB.prepare(`INSERT INTO content_items(id,project_id,content_type,sequence_no,category,priority,canonical_title,source_text,source_name,source_url,status,facts_verified,uniqueness_verified,monetization_status,notes,approved_at,created_at,updated_at,quote_type,original_quote,original_language,author_name,author_source,source_work,source_date,attribution_status,category_slug,source_verified_at,source_verification_notes)
 VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
 ON CONFLICT(id) DO UPDATE SET project_id=excluded.project_id,content_type=excluded.content_type,sequence_no=excluded.sequence_no,category=excluded.category,priority=excluded.priority,canonical_title=excluded.canonical_title,source_text=excluded.source_text,source_name=NULL,source_url=NULL,status=excluded.status,facts_verified=1,uniqueness_verified=1,notes=excluded.notes,updated_at=excluded.updated_at,quote_type='adapted',original_quote=excluded.original_quote,original_language='uk',author_name=NULL,author_source=NULL,source_work=NULL,source_date=NULL,attribution_status='not_required',category_slug=excluded.category_slug,source_verified_at=NULL,source_verification_notes=NULL`).bind(
 'WQ006',PROJECT_ID,'quote',6,'Decisions','normal',canonical,canonical,null,null,'prompt_ready',1,1,null,'Two-day validation topic. Adapted Wise Quotes original; no author attribution.',null,t,t,'adapted',canonical,'uk',null,null,null,null,'not_required','decisions',null,null).run();

 for(const [lang,v] of Object.entries(WQ006)){
   const vid=`WQ006_${lang}_v1`;
   const prompt=`Create an 8-second vertical 9:16 cinematic Wise Quotes World video. Visual story: ${v.concept} Show ONLY the exact localized quote text: “${v.quote}”. Split the quote into two sequential text moments; never show both blocks simultaneously. Text in upper-middle safe area. Calm native-language voiceover matching the exact quote, soft piano/cinematic ambience below voice. Immediate visual hook, no black screen, no third-party logo, no watermark, no labels or extra text. Small Wise Quotes World ${lang.toUpperCase()} branding bottom-right is allowed.`;
   await env.DB.prepare(`INSERT INTO content_versions(id,content_id,language_code,title,hook,adapted_text,line_breaks,key_facts,voiceover_text,video_concept,ai_prompt,on_screen_text,cta,status,language_check_status,approved,verification_date,source_urls,editor_notes,version)
   VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
   ON CONFLICT(content_id,language_code,version) DO UPDATE SET title=excluded.title,hook=excluded.hook,adapted_text=excluded.adapted_text,line_breaks=excluded.line_breaks,key_facts=excluded.key_facts,voiceover_text=excluded.voiceover_text,video_concept=excluded.video_concept,ai_prompt=excluded.ai_prompt,on_screen_text=excluded.on_screen_text,cta=excluded.cta,status=excluded.status,language_check_status=excluded.language_check_status,approved=0,verification_date=excluded.verification_date,source_urls=excluded.source_urls,editor_notes=excluded.editor_notes`).bind(
   vid,'WQ006',lang,'Quiet decisions change direction','A quiet decision can change direction.',v.quote,null,'Adapted original; no factual attribution required.',v.quote,v.concept,prompt,v.quote,null,'prompt_ready','prepared',0,t,null,'WQ006 preview validation version.',1).run();

   const pageId=`WQ006_${lang}_page`;
   const path=`/${lang}/quotes/${v.slug}/`;
   await env.DB.prepare(`INSERT INTO quote_pages(id,project_id,content_item_id,content_version_id,language_code,slug,seo_title,meta_description,reflection_title,reflection_body,canonical_path,status,published_at,updated_at)
   VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)
   ON CONFLICT(content_version_id) DO UPDATE SET slug=excluded.slug,seo_title=excluded.seo_title,meta_description=excluded.meta_description,canonical_path=excluded.canonical_path,status='draft',published_at=NULL,updated_at=excluded.updated_at`).bind(
   pageId,PROJECT_ID,'WQ006',vid,lang,v.slug,v.quote,`Wise Quotes World — ${v.quote}`,null,null,path,'draft',null,t).run();
 }

 await env.DB.prepare(`INSERT OR IGNORE INTO content_approvals(project_id,content_item_id,approval_scope,language_code,status,approved_by,notes,created_at,updated_at) VALUES(?,?,?,NULL,'pending',NULL,?,?,?)`).bind(PROJECT_ID,'WQ006','content','Preview validation: approval intentionally pending.',t,t).run();
 const versions=await env.DB.prepare(`SELECT language_code,status,approved FROM content_versions WHERE content_id='WQ006' ORDER BY language_code`).all();
 const pages=await env.DB.prepare(`SELECT language_code,canonical_path,status FROM quote_pages WHERE content_item_id='WQ006' ORDER BY language_code`).all();
 const item=await env.DB.prepare(`SELECT id,quote_type,author_name,attribution_status,status,original_language FROM content_items WHERE id='WQ006'`).first();
 return json({ok:true,test:'WQ006',item,versions:versions.results||[],pages:pages.results||[],version_count:(versions.results||[]).length,page_count:(pages.results||[]).length,ready_for_first_pinterest_test:(versions.results||[]).length===8&&(pages.results||[]).length===8&&item?.author_name==null});
}

export default{async fetch(request,env,ctx){
 const url=new URL(request.url);
 try{
  if(url.pathname==='/api/admin/schema'&&request.method==='GET'){
   if(!authorized(request,env))return json({ok:false,error:'unauthorized'},401);
   if(!env.DB)return json({ok:false,error:'DB binding unavailable'},503);
   return json({ok:true,schema:await schemaStatus(env.DB),bindings:{db:!!env.DB,r2:!!env.MEDIA,ai:!!env.AI,assets:!!env.ASSETS,admin_secret:!!env.ADMIN_TOKEN}});
  }
  if(url.pathname==='/api/admin/migrate'&&request.method==='POST'){
   if(!authorized(request,env))return json({ok:false,error:'unauthorized'},401);
   return migrateOne(request,env);
  }
  if(url.pathname==='/api/admin/test/wq006/seed'&&request.method==='POST'){
   if(!authorized(request,env))return json({ok:false,error:'unauthorized'},401);
   if(!env.DB)return json({ok:false,error:'DB binding unavailable'},503);
   return seedWQ006(env);
  }
  return legacyWorker.fetch(request,env,ctx);
 }catch(e){return json({ok:false,error:String(e?.message||e),name:e?.name||null},500)}
}};
