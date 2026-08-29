const PROJECT_ID='wisequotesworld';
const LANGS=['uk','ru','pl','en','sv','de','es','fr'];
const OUTPUTS=['pinterest_prompt','facebook','instagram','threads','tiktok','youtube_title','youtube_description','pinterest_title','pinterest_description','website_reflection'];
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}})}
function auth(req,env){return !!env.ADMIN_TOKEN&&(req.headers.get('authorization')||'')===`Bearer ${env.ADMIN_TOKEN}`}
function now(){return new Date().toISOString()}
async function body(req){try{return await req.json()}catch{return null}}
async function ensure(env){
 await env.DB.exec(`CREATE TABLE IF NOT EXISTS content_outputs (
 id TEXT PRIMARY KEY, project_id TEXT NOT NULL, content_item_id TEXT NOT NULL, language_code TEXT NOT NULL,
 output_key TEXT NOT NULL, output_text TEXT, status TEXT NOT NULL DEFAULT 'draft', updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(content_item_id,language_code,output_key));
 CREATE INDEX IF NOT EXISTS idx_content_outputs_item ON content_outputs(content_item_id,language_code,output_key);
 CREATE TABLE IF NOT EXISTS media_reviews (
 id INTEGER PRIMARY KEY AUTOINCREMENT, media_inbox_id TEXT NOT NULL UNIQUE, qa_status TEXT NOT NULL DEFAULT 'pending',
 notes TEXT, reviewed_at TEXT, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
 CREATE INDEX IF NOT EXISTS idx_media_reviews_status ON media_reviews(qa_status);`);
}
async function latestVersions(env,id){return (await env.DB.prepare(`SELECT cv.* FROM content_versions cv JOIN (SELECT language_code,MAX(version) v FROM content_versions WHERE content_id=? GROUP BY language_code) x ON x.language_code=cv.language_code AND x.v=cv.version WHERE cv.content_id=? ORDER BY cv.language_code`).bind(id,id).all()).results||[]}
async function outputs(env,id){return (await env.DB.prepare(`SELECT language_code,output_key,output_text,status,updated_at FROM content_outputs WHERE project_id=? AND content_item_id=? ORDER BY language_code,output_key`).bind(PROJECT_ID,id).all()).results||[]}
async function media(env,id){return (await env.DB.prepare(`SELECT m.*,COALESCE(r.qa_status,'pending') qa_status,r.notes qa_notes FROM media_inbox m LEFT JOIN media_reviews r ON r.media_inbox_id=m.id WHERE m.project_id=? AND m.content_item_id=? ORDER BY m.language_code,m.asset_type,m.created_at DESC`).bind(PROJECT_ID,id).all()).results||[]}
async function readiness(env,id){
 const item=await env.DB.prepare(`SELECT * FROM content_items WHERE project_id=? AND id=?`).bind(PROJECT_ID,id).first();if(!item)return null;
 const versions=await latestVersions(env,id),outs=await outputs(env,id),med=await media(env,id);
 const byLang={};for(const l of LANGS)byLang[l]={version:false,video_prompt:false,pinterest_prompt:false,copy:0,video:false,pinterest:false,media_qa:true};
 for(const v of versions){if(!byLang[v.language_code])continue;byLang[v.language_code].version=!!String(v.adapted_text||'').trim();byLang[v.language_code].video_prompt=!!String(v.ai_prompt||'').trim()}
 for(const o of outs){const x=byLang[o.language_code];if(!x)continue;if(o.output_key==='pinterest_prompt')x.pinterest_prompt=!!String(o.output_text||'').trim();if(['facebook','instagram','threads','tiktok','youtube_title','youtube_description','pinterest_title','pinterest_description'].includes(o.output_key)&&String(o.output_text||'').trim())x.copy++}
 for(const m of med){const x=byLang[m.language_code];if(!x)continue;const t=String(m.asset_type||'').toLowerCase();if(t.includes('video'))x.video=true;if(t.includes('pinterest')||t.includes('image')||String(m.mime_type||'').startsWith('image/'))x.pinterest=true;if(m.qa_status!=='approved')x.media_qa=false}
 const approval=await env.DB.prepare(`SELECT status,updated_at FROM content_approvals WHERE content_item_id=? AND approval_scope='content' AND language_code IS NULL ORDER BY id DESC LIMIT 1`).bind(id).first();
 const sourceOk=item.quote_type!=='verbatim'||item.attribution_status==='verified';
 const langs=LANGS.map(l=>({language:l,...byLang[l],copy_required:8,ready:byLang[l].version&&byLang[l].video_prompt&&byLang[l].pinterest_prompt&&byLang[l].copy>=8&&byLang[l].video&&byLang[l].pinterest&&byLang[l].media_qa}));
 return{item:{id:item.id,quote_type:item.quote_type,author_name:item.author_name,attribution_status:item.attribution_status,status:item.status},source_ok:sourceOk,approval:approval||{status:'pending'},languages:langs,ready_for_metricool:sourceOk&&langs.filter(x=>x.language!=='fr').every(x=>x.ready)&&approval?.status==='approved',fr_ready_for_site:langs.find(x=>x.language==='fr')?.version&&langs.find(x=>x.language==='fr')?.pinterest_prompt};
}
export async function productionConsoleApi(request,env){
 const url=new URL(request.url);if(!url.pathname.startsWith('/api/admin/production'))return null;if(!auth(request,env))return json({ok:false,error:'unauthorized'},401);if(!env.DB)return json({ok:false,error:'DB binding unavailable'},503);await ensure(env);
 const get=url.pathname.match(/^\/api\/admin\/production\/([A-Za-z0-9_-]+)$/);if(get&&request.method==='GET'){const r=await readiness(env,get[1]);if(!r)return json({ok:false,error:'content not found'},404);return json({ok:true,readiness:r,outputs:await outputs(env,get[1]),media:await media(env,get[1])})}
 const out=url.pathname.match(/^\/api\/admin\/production\/([A-Za-z0-9_-]+)\/outputs\/(uk|ru|pl|en|sv|de|es|fr)\/([a-z_]+)$/);if(out&&request.method==='PUT'){
  const [_,id,lang,key]=out;if(!OUTPUTS.includes(key))return json({ok:false,error:'unsupported output_key'},400);const b=await body(request);if(!b||typeof b.output_text!=='string')return json({ok:false,error:'output_text required'},400);
  const exists=await env.DB.prepare(`SELECT 1 FROM content_items WHERE project_id=? AND id=?`).bind(PROJECT_ID,id).first();if(!exists)return json({ok:false,error:'content not found'},404);
  const rid=`${id}_${lang}_${key}`;await env.DB.prepare(`INSERT INTO content_outputs(id,project_id,content_item_id,language_code,output_key,output_text,status,updated_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(content_item_id,language_code,output_key) DO UPDATE SET output_text=excluded.output_text,status=excluded.status,updated_at=excluded.updated_at`).bind(rid,PROJECT_ID,id,lang,key,b.output_text,b.status||'ready',now()).run();return json({ok:true,id:rid});
 }
 const qa=url.pathname.match(/^\/api\/admin\/production\/media\/([A-Za-z0-9_-]+)\/qa$/);if(qa&&request.method==='POST'){const b=await body(request)||{},s=String(b.status||'');if(!['pending','approved','rejected'].includes(s))return json({ok:false,error:'invalid QA status'},400);const m=await env.DB.prepare(`SELECT 1 FROM media_inbox WHERE id=? AND project_id=?`).bind(qa[1],PROJECT_ID).first();if(!m)return json({ok:false,error:'media not found'},404);await env.DB.prepare(`INSERT INTO media_reviews(media_inbox_id,qa_status,notes,reviewed_at,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(media_inbox_id) DO UPDATE SET qa_status=excluded.qa_status,notes=excluded.notes,reviewed_at=excluded.reviewed_at,updated_at=excluded.updated_at`).bind(qa[1],s,b.notes||null,s==='pending'?null:now(),now()).run();return json({ok:true,media_id:qa[1],qa_status:s})}
 return json({ok:false,error:'not found'},404);
}
