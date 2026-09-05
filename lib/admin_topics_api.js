const PROJECT='wisequotesworld';
const SOCIAL=['uk','ru','pl','en','sv','de','es','fr'];
const MANUAL_STATUSES=['idea','source_check','quote_ready','localized','native_language_qa','prompt_ready','copy_ready','website_ready','pinterest_ready','media_pending','media_ready','approved','scheduled','published','skipped'];
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}})}
function auth(req,env){return !!env.ADMIN_TOKEN&&(req.headers.get('authorization')||'')===`Bearer ${env.ADMIN_TOKEN}`}
async function body(req){try{return await req.json()}catch{return null}}
async function ensure(env){await env.DB.exec(`CREATE TABLE IF NOT EXISTS editorial_status_history(id INTEGER PRIMARY KEY AUTOINCREMENT,project_id TEXT NOT NULL,content_item_id TEXT NOT NULL,from_status TEXT,to_status TEXT NOT NULL,notes TEXT,actor TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);CREATE INDEX IF NOT EXISTS idx_editorial_status_history_item ON editorial_status_history(project_id,content_item_id,created_at DESC);`)}
async function listTopics(env){
 await ensure(env);
 const rows=(await env.DB.prepare(`SELECT ci.id,ci.sequence_no,ci.canonical_title,ci.status,ci.quote_type,ci.author_name,ci.attribution_status,ci.approved_at,ci.updated_at,
 (SELECT COUNT(*) FROM quote_pages qp WHERE qp.project_id=ci.project_id AND qp.content_item_id=ci.id AND qp.status='published') published_pages,
 (SELECT COUNT(*) FROM content_outputs co WHERE co.project_id=ci.project_id AND co.content_item_id=ci.id AND TRIM(COALESCE(co.output_text,''))<>'') outputs_count,
 (SELECT COUNT(*) FROM media_inbox mi WHERE mi.project_id=ci.project_id AND mi.content_item_id=ci.id) media_count,
 (SELECT COUNT(*) FROM media_inbox mi LEFT JOIN media_reviews mr ON mr.media_inbox_id=mi.id WHERE mi.project_id=ci.project_id AND mi.content_item_id=ci.id AND mr.qa_status='approved') media_approved_count
 FROM content_items ci WHERE ci.project_id=? ORDER BY COALESCE(ci.sequence_no,0) DESC,ci.created_at DESC LIMIT 150`).bind(PROJECT).all()).results||[];
 return rows.map(x=>({...x,article_ready:Number(x.published_pages||0)>=13,copy_ready:Number(x.outputs_count||0)>=88,manual_status_allowed:MANUAL_STATUSES.includes(x.status)}));
}
async function setStatus(env,id,b){
 await ensure(env);
 const to=String(b?.status||'').trim();if(!MANUAL_STATUSES.includes(to))return json({ok:false,error:'unsupported status',allowed:MANUAL_STATUSES},400);
 const cur=await env.DB.prepare(`SELECT id,status FROM content_items WHERE project_id=? AND id=?`).bind(PROJECT,id).first();if(!cur)return json({ok:false,error:'topic not found'},404);
 const ts=new Date().toISOString(),notes=String(b?.notes||'').trim()||null;
 await env.DB.prepare(`UPDATE content_items SET status=?,updated_at=? WHERE project_id=? AND id=?`).bind(to,ts,PROJECT,id).run();
 if(to==='published'){
   try{await env.DB.prepare(`UPDATE content_versions SET status='published',updated_at=? WHERE content_id=?`).bind(ts,id).run()}catch{}
 }
 if(to==='scheduled'){
   try{await env.DB.prepare(`UPDATE content_versions SET status=CASE WHEN status='published' THEN status ELSE 'scheduled' END,updated_at=? WHERE content_id=?`).bind(ts,id).run()}catch{}
 }
 if(to==='skipped'){
   try{await env.DB.prepare(`UPDATE content_versions SET status=CASE WHEN status='published' THEN status ELSE 'skipped' END,updated_at=? WHERE content_id=?`).bind(ts,id).run()}catch{}
 }
 await env.DB.prepare(`INSERT INTO editorial_status_history(project_id,content_item_id,from_status,to_status,notes,actor,created_at) VALUES(?,?,?,?,?,?,?)`).bind(PROJECT,id,cur.status,to,notes,'admin',ts).run();
 return json({ok:true,id,from_status:cur.status,status:to,updated_at:ts});
}
export async function adminTopicsApi(request,env){
 const url=new URL(request.url);if(!url.pathname.startsWith('/api/admin/topics'))return null;
 if(!auth(request,env))return json({ok:false,error:'unauthorized'},401);if(!env.DB)return json({ok:false,error:'DB unavailable'},503);
 if(url.pathname==='/api/admin/topics'&&request.method==='GET')return json({ok:true,statuses:MANUAL_STATUSES,items:await listTopics(env)});
 const m=url.pathname.match(/^\/api\/admin\/topics\/([A-Za-z0-9_-]+)\/status$/);if(m&&request.method==='POST')return setStatus(env,m[1],await body(request));
 const h=url.pathname.match(/^\/api\/admin\/topics\/([A-Za-z0-9_-]+)\/history$/);if(h&&request.method==='GET'){await ensure(env);const rows=(await env.DB.prepare(`SELECT * FROM editorial_status_history WHERE project_id=? AND content_item_id=? ORDER BY created_at DESC LIMIT 30`).bind(PROJECT,h[1]).all()).results||[];return json({ok:true,id:h[1],history:rows})}
 return json({ok:false,error:'not found'},404);
}
