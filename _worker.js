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
 const empty=tables.length===0;
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
 return{tables,empty,v2,v3,partial_v3,project_ready,v4,v5,v6,v7,v8,v9,v10,ready:v2&&v3&&v4&&v5&&v6&&v7&&v8&&v9&&v10,content_items_columns:ci};
}

async function assetText(request,env,path){const r=await env.ASSETS.fetch(new Request(new URL(path,request.url)));if(!r.ok)throw new Error(`${path} unavailable (${r.status})`);return r.text()}
async function applyFile(request,env,path){await env.DB.exec(await assetText(request,env,path))}
async function seedBase(db){
 await db.prepare("INSERT OR IGNORE INTO projects(id,name,timezone,active) VALUES(?,?,?,1)").bind(PROJECT_ID,'Wise Quotes World','Europe/Stockholm').run();
 for(const [code,name,nativeName] of LANGS)await db.prepare("INSERT OR IGNORE INTO languages(code,name,native_name,active) VALUES(?,?,?,1)").bind(code,name,nativeName).run();
 for(const code of PLATFORMS)await db.prepare("INSERT OR IGNORE INTO platforms(code,name,active) VALUES(?,?,1)").bind(code,code[0].toUpperCase()+code.slice(1)).run();
 for(const [code] of LANGS)await db.prepare("INSERT OR IGNORE INTO project_languages(project_id,language_code,active) VALUES(?,?,1)").bind(PROJECT_ID,code).run();
}

async function migrate(request,env){
 if(!env.DB)return json({ok:false,error:'DB binding unavailable'},503);
 let s=await schemaStatus(env.DB),before=s,applied=[];
 if(!s.v2){
  if(!s.empty)return json({ok:false,error:'non-empty D1 without recognized schema v2; automatic bootstrap refused',schema:s},409);
  await applyFile(request,env,'/db/schema_v2.sql');applied.push('v2');
  await seedBase(env.DB);applied.push('base_seed');
  s=await schemaStatus(env.DB);
  if(!s.v2)return json({ok:false,error:'schema v2 bootstrap did not validate',before,applied,schema:s},500);
 }else if(!s.project_ready){await seedBase(env.DB);applied.push('base_seed');s=await schemaStatus(env.DB)}
 if(s.partial_v3)return json({ok:false,error:'partial schema v3 detected; automatic ALTER replay refused',before,applied,schema:s},409);
 const steps=[['v3','/db/schema_v3.sql'],['v4','/db/migration4_prepare_fr_and_cutover.sql'],['v5','/db/migration5_content_origin.sql'],['v6','/db/migration6_quote_pages_and_versions.sql'],['v7','/db/migration7_seed_required_outputs.sql'],['v8','/db/migration8_ai_generation.sql'],['v9','/db/migration9_runtime_hardening.sql'],['v10','/db/migration10_database_guardrails.sql']];
 for(const [key,path] of steps){if(!s[key]){await applyFile(request,env,path);applied.push(key);s=await schemaStatus(env.DB);if(s.partial_v3)return json({ok:false,error:'migration left partial v3 state; stopped',before,applied,schema:s},409)}}
 return json({ok:true,before,applied,schema:s});
}

function diagnosticsPage(){return new Response(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Wise Quotes Diagnostics</title><style>body{font-family:system-ui;margin:0;background:#f4f4f2;color:#111}.w{max-width:760px;margin:auto;padding:24px}.card{background:#fff;border-radius:24px;padding:22px;margin:18px 0}input,button{font:inherit;width:100%;box-sizing:border-box;padding:15px;border-radius:14px;border:1px solid #ccc;margin:8px 0}button{font-weight:700;background:#111;color:#fff}.status{padding:16px;border-radius:14px;background:#eee;font-weight:700;white-space:pre-wrap}.ok{background:#dff7e6}.bad{background:#ffe1e1}pre{white-space:pre-wrap;word-break:break-word;font-size:13px;background:#111;color:#eee;padding:14px;border-radius:14px}</style></head><body><div class="w"><h1>Wise Quotes — Diagnostics</h1><div class="card"><label>Preview ADMIN_TOKEN</label><input id="t" type="password" autocomplete="off" placeholder="Token"><button onclick="schema()">1. Connect / schema</button><button onclick="migrate()">2. Apply migrations</button><div id="s" class="status">Waiting for action…</div></div><div class="card"><h2>Raw response</h2><pre id="o">—</pre></div></div><script>const s=document.getElementById('s'),o=document.getElementById('o'),t=document.getElementById('t');function h(){return {'authorization':'Bearer '+t.value}}async function go(path,method){if(!t.value){s.className='status bad';s.textContent='TOKEN MISSING';return}s.className='status';s.textContent='Working…';o.textContent='—';try{const r=await fetch(path,{method,headers:h()});const x=await r.json();o.textContent=JSON.stringify(x,null,2);if(r.ok){s.className='status ok';s.textContent='SUCCESS HTTP '+r.status+(x.schema?.ready?' — SCHEMA READY':'')}else{s.className='status bad';s.textContent='ERROR HTTP '+r.status+' — '+(x.error||'unknown error')}}catch(e){s.className='status bad';s.textContent='NETWORK/JS ERROR — '+e;o.textContent=String(e)}}function schema(){go('/api/admin/schema','GET')}function migrate(){go('/api/admin/migrate','POST')}</script></body></html>`,{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}})}

export default{async fetch(request,env,ctx){
 const url=new URL(request.url);
 try{
  if((url.pathname==='/admin/diagnostics'||url.pathname==='/admin/diagnostics/'))return diagnosticsPage();
  if(url.pathname==='/api/admin/schema'&&request.method==='GET'){
   if(!authorized(request,env))return json({ok:false,error:'unauthorized'},401);
   if(!env.DB)return json({ok:false,error:'DB binding unavailable'},503);
   return json({ok:true,schema:await schemaStatus(env.DB),bindings:{db:!!env.DB,r2:!!env.MEDIA,ai:!!env.AI,admin_secret:!!env.ADMIN_TOKEN}});
  }
  if(url.pathname==='/api/admin/migrate'&&request.method==='POST'){
   if(!authorized(request,env))return json({ok:false,error:'unauthorized'},401);
   return migrate(request,env);
  }
  return legacyWorker.fetch(request,env,ctx);
 }catch(e){return json({ok:false,error:String(e?.message||e)},500)}
}};
