import legacyWorker from './_worker_legacy.js';

const PROJECT_ID='wisequotesworld';
const LANGS=[['uk','Ukrainian','Українська'],['ru','Russian','Русский'],['pl','Polish','Polski'],['en','English','English'],['sv','Swedish','Svenska'],['de','German','Deutsch'],['es','Spanish','Español']];
const PLATFORMS=['website','pinterest','facebook','instagram','threads','tiktok','youtube'];

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}})}
function authorized(request,env){return !!env.ADMIN_TOKEN&&(request.headers.get('authorization')||'')===`Bearer ${env.ADMIN_TOKEN}`}
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
 return String(sql||'')
   .replace(/^\s*PRAGMA\s+foreign_keys\s*=\s*(?:ON|OFF|1|0)\s*;\s*$/gmi,'')
   .trim();
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
  return legacyWorker.fetch(request,env,ctx);
 }catch(e){return json({ok:false,error:String(e?.message||e),name:e?.name||null},500)}
}};
