const LANGS=['en','uk','ru','pl','sv','de','es','fr'];
const PROJECT_ID='wisequotesworld';

function preferred(request){const h=(request.headers.get('Accept-Language')||'').toLowerCase();for(const l of ['uk','ru','pl','sv','de','es','fr','en'])if(h.startsWith(l)||h.includes(','+l)||h.includes(' '+l))return l;return'en'}
function json(data,status=200,headers={}){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers}})}
function now(){return new Date().toISOString()}
function safeId(v){return String(v||'').trim().replace(/[^A-Za-z0-9_-]/g,'').slice(0,40)}
function authorized(request,env){return !!env.ADMIN_TOKEN&&(request.headers.get('authorization')||'')===`Bearer ${env.ADMIN_TOKEN}`}
function requireAdmin(request,env){return authorized(request,env)?null:json({ok:false,error:'unauthorized'},401)}
async function reqBody(request){try{return await request.json()}catch{return null}}

async function tableNames(db){return ((await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all()).results||[]).map(x=>x.name)}
async function columns(db,table){try{return ((await db.prepare(`PRAGMA table_info(${table})`).all()).results||[]).map(x=>x.name)}catch{return[]}}
async function schemaStatus(db){
  const tables=await tableNames(db);
  const ci=tables.includes('content_items')?await columns(db,'content_items'):[];
  const v2=tables.includes('projects')&&tables.includes('languages')&&tables.includes('content_items')&&tables.includes('content_versions');
  const v3=ci.includes('quote_type')&&ci.includes('original_language')&&tables.includes('media_inbox')&&tables.includes('language_style_profiles');
  const v4=v3&&!!(await db.prepare("SELECT 1 AS ok FROM languages WHERE code='fr'").first());
  const v5=ci.includes('source_verified_at')&&ci.includes('source_verification_notes')&&tables.includes('quote_source_evidence');
  const v6=tables.includes('quote_pages')&&tables.includes('content_approvals');
  return {tables,content_items_columns:ci,v2,v3,v4,v5,v6,ready:v2&&v3&&v4&&v5&&v6};
}
async function assetText(request,env,path){const r=await env.ASSETS.fetch(new Request(new URL(path,request.url)));if(!r.ok)throw new Error(`${path} unavailable (${r.status})`);return r.text()}
async function applyFile(request,env,path){await env.DB.exec(await assetText(request,env,path))}
async function applyMigrations(request,env){
  let s=await schemaStatus(env.DB);const before=s,applied=[];
  if(!s.v2)return json({ok:false,error:'base schema v2 missing; bootstrap refused',schema:s},409);
  if(!s.v3){await applyFile(request,env,'/db/schema_v3.sql');applied.push('v3');s=await schemaStatus(env.DB)}
  if(!s.v4){await applyFile(request,env,'/db/migration4_prepare_fr_and_cutover.sql');applied.push('v4');s=await schemaStatus(env.DB)}
  if(!s.v5){await applyFile(request,env,'/db/migration5_content_origin.sql');applied.push('v5');s=await schemaStatus(env.DB)}
  if(!s.v6){await applyFile(request,env,'/db/migration6_quote_pages_and_versions.sql');applied.push('v6');s=await schemaStatus(env.DB)}
  return json({ok:true,before,applied,schema:s});
}

async function nextContentId(env){const row=await env.DB.prepare("SELECT id FROM content_items WHERE project_id=? AND id LIKE 'WQ%' ORDER BY CAST(SUBSTR(id,3) AS INTEGER) DESC LIMIT 1").bind(PROJECT_ID).first();const n=row?Number(String(row.id).slice(2))+1:1;return `WQ${String(Number.isFinite(n)?n:1).padStart(3,'0')}`}
async function listContent(env){return (await env.DB.prepare(`SELECT id,canonical_title,status,quote_type,author_name,original_language,attribution_status,created_at,updated_at FROM content_items WHERE project_id=? ORDER BY COALESCE(sequence_no,0) DESC,created_at DESC LIMIT 100`).bind(PROJECT_ID).all()).results||[]}
async function getContent(env,id){
  const item=await env.DB.prepare(`SELECT * FROM content_items WHERE id=? AND project_id=?`).bind(id,PROJECT_ID).first();if(!item)return null;
  const versions=(await env.DB.prepare(`SELECT * FROM content_versions WHERE content_id=? ORDER BY language_code,version DESC`).bind(id).all()).results||[];
  let evidence=[],pages=[],approvals=[];
  try{evidence=(await env.DB.prepare(`SELECT * FROM quote_source_evidence WHERE content_item_id=? ORDER BY id DESC`).bind(id).all()).results||[]}catch{}
  try{pages=(await env.DB.prepare(`SELECT * FROM quote_pages WHERE content_item_id=? ORDER BY language_code`).bind(id).all()).results||[]}catch{}
  try{approvals=(await env.DB.prepare(`SELECT * FROM content_approvals WHERE content_item_id=? ORDER BY id DESC`).bind(id).all()).results||[]}catch{}
  return {...item,versions,source_evidence:evidence,quote_pages:pages,approvals};
}
async function createContent(request,env){
  const b=await reqBody(request);if(!b?.quote)return json({ok:false,error:'quote required'},400);
  const type=b.quote_type==='verbatim'?'verbatim':'adapted';if(type==='verbatim'&&!String(b.author_name||'').trim())return json({ok:false,error:'author required for verbatim quote'},400);
  const id=safeId(b.content_id)||await nextContentId(env);if(await env.DB.prepare('SELECT 1 FROM content_items WHERE id=?').bind(id).first())return json({ok:false,error:'content_id already exists',id},409);
  const seq=Number(String(id).replace(/^WQ/i,''))||null;
  await env.DB.prepare(`INSERT INTO content_items(id,project_id,content_type,sequence_no,category,canonical_title,source_text,source_name,source_url,status,facts_verified,uniqueness_verified,notes,created_at,updated_at,quote_type,original_quote,original_language,author_name,author_source,source_work,source_date,attribution_status,category_slug) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(id,PROJECT_ID,'quote',seq,b.category_slug||null,b.title||String(b.quote).slice(0,100),b.quote,b.author_name||null,b.source_url||b.author_source||null,'idea',type==='verbatim'?0:1,0,b.notes||null,now(),now(),type,b.quote,b.original_language||'en',b.author_name||null,b.author_source||b.source_url||null,b.source_work||null,b.source_date||null,type==='verbatim'?'unverified':'not_required',b.category_slug||null).run();
  await env.DB.prepare(`INSERT OR IGNORE INTO content_approvals(project_id,content_item_id,approval_scope,status,created_at,updated_at) VALUES(?,?,'content','pending',?,?)`).bind(PROJECT_ID,id,now(),now()).run();
  return json({ok:true,id,item:await getContent(env,id)},201);
}
async function updateContent(request,env,id){
  const b=await reqBody(request),cur=await env.DB.prepare(`SELECT * FROM content_items WHERE id=? AND project_id=?`).bind(id,PROJECT_ID).first();if(!cur)return json({ok:false,error:'not found'},404);
  const type=b.quote_type??cur.quote_type,author=('author_name'in b)?b.author_name:cur.author_name;if(type==='verbatim'&&!String(author||'').trim())return json({ok:false,error:'author required for verbatim quote'},400);
  await env.DB.prepare(`UPDATE content_items SET canonical_title=?,original_quote=?,source_text=?,original_language=?,author_name=?,author_source=?,source_work=?,source_date=?,source_url=?,quote_type=?,category=?,category_slug=?,attribution_status=?,notes=?,updated_at=? WHERE id=? AND project_id=?`).bind(b.title??cur.canonical_title,b.quote??cur.original_quote,b.quote??cur.source_text,b.original_language??cur.original_language,author||null,b.author_source??cur.author_source,b.source_work??cur.source_work,b.source_date??cur.source_date,b.source_url??cur.source_url,type,b.category_slug??cur.category,b.category_slug??cur.category_slug,b.attribution_status??cur.attribution_status,b.notes??cur.notes,now(),id,PROJECT_ID).run();
  return json({ok:true,item:await getContent(env,id)});
}
async function addEvidence(request,env,id){
  const b=await reqBody(request);if(!b?.source_type||!b?.original_text)return json({ok:false,error:'source_type and original_text required'},400);
  if(!await env.DB.prepare(`SELECT 1 FROM content_items WHERE id=? AND project_id=?`).bind(id,PROJECT_ID).first())return json({ok:false,error:'content not found'},404);
  const verified=b.verified?1:0;
  const r=await env.DB.prepare(`INSERT INTO quote_source_evidence(content_item_id,source_type,source_title,source_url,source_locator,original_text,original_language,verified,verification_notes,created_at) VALUES(?,?,?,?,?,?,?,?,?,?) RETURNING id`).bind(id,b.source_type,b.source_title||null,b.source_url||null,b.source_locator||null,b.original_text,b.original_language||null,verified,b.verification_notes||null,now()).first();
  if(verified)await env.DB.prepare(`UPDATE content_items SET source_verified_at=?,source_verification_notes=?,attribution_status=CASE WHEN quote_type='verbatim' THEN 'verified' ELSE attribution_status END,facts_verified=1,updated_at=? WHERE id=? AND project_id=?`).bind(now(),b.verification_notes||null,now(),id,PROJECT_ID).run();
  return json({ok:true,evidence_id:r.id,item:await getContent(env,id)},201);
}
async function upsertVersion(request,env,id,lang){
  if(!LANGS.includes(lang))return json({ok:false,error:'unsupported language'},400);const b=await reqBody(request);if(!b?.adapted_text)return json({ok:false,error:'adapted_text required'},400);
  if(!await env.DB.prepare(`SELECT 1 FROM content_items WHERE id=? AND project_id=?`).bind(id,PROJECT_ID).first())return json({ok:false,error:'content not found'},404);
  const version=Number(b.version)||1,vid=`${id}_${lang}_v${version}`;
  await env.DB.prepare(`INSERT INTO content_versions(id,content_id,language_code,title,hook,adapted_text,line_breaks,key_facts,voiceover_text,video_concept,ai_prompt,on_screen_text,cta,status,language_check_status,approved,verification_date,source_urls,editor_notes,version) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(content_id,language_code,version) DO UPDATE SET title=excluded.title,hook=excluded.hook,adapted_text=excluded.adapted_text,line_breaks=excluded.line_breaks,key_facts=excluded.key_facts,voiceover_text=excluded.voiceover_text,video_concept=excluded.video_concept,ai_prompt=excluded.ai_prompt,on_screen_text=excluded.on_screen_text,cta=excluded.cta,status=excluded.status,language_check_status=excluded.language_check_status,approved=excluded.approved,verification_date=excluded.verification_date,source_urls=excluded.source_urls,editor_notes=excluded.editor_notes`).bind(vid,id,lang,b.title||null,b.hook||null,b.adapted_text,b.line_breaks||null,b.key_facts||null,b.voiceover_text||b.adapted_text,b.video_concept||null,b.ai_prompt||null,b.on_screen_text||b.adapted_text,b.cta||null,b.status||'localized',b.language_check_status||'pending',b.approved?1:0,b.verification_date||null,b.source_urls||null,b.editor_notes||null,version).run();
  return json({ok:true,content_id:id,language_code:lang,version,item:await getContent(env,id)});
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

function adminHtml(){return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Wise Quotes Admin</title><style>body{font-family:system-ui;margin:0;background:#f5f5f3;color:#171717}.wrap{max-width:1000px;margin:auto;padding:20px}section{background:white;padding:18px;border-radius:16px;margin:14px 0}input,select,textarea,button{font:inherit;padding:10px;margin:5px 0;box-sizing:border-box}input,select,textarea{width:100%}button{cursor:pointer}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}pre{white-space:pre-wrap;overflow:auto}@media(max-width:650px){.grid{grid-template-columns:1fr}}</style></head><body><div class="wrap"><h1>Wise Quotes World — Admin</h1><section><label>Admin token</label><input id="token" type="password" autocomplete="current-password"><button onclick="connect()">Connect / schema</button><button onclick="migrate()">Apply safe migrations</button><pre id="status"></pre></section><section><h2>New quote</h2><div class="grid"><input id="cid" placeholder="Content ID (auto WQxxx)"><select id="type"><option value="adapted">Adapted / Wise Quotes</option><option value="verbatim">Verbatim / attributed</option></select></div><textarea id="quote" rows="4" placeholder="Original quote"></textarea><div class="grid"><input id="author" placeholder="Author (required for verbatim)"><select id="olang">${LANGS.map(x=>`<option value="${x}">${x}</option>`).join('')}</select></div><input id="source" placeholder="Source URL / bibliographic source"><input id="category" placeholder="Category"><button onclick="createQuote()">Save to D1</button><pre id="createOut"></pre></section><section><h2>Media Inbox</h2><div class="grid"><input id="media" type="file"><select id="mlang">${LANGS.map(x=>`<option value="${x}">${x}</option>`).join('')}</select></div><select id="atype"><option value="video">Video</option><option value="pinterest">Pinterest 2:3</option><option value="image">Image</option></select><input id="mediaCid" placeholder="Content ID, e.g. WQ006"><button onclick="upload()">Upload to R2</button><pre id="uploadOut"></pre></section><section><h2>Content</h2><button onclick="loadAll()">Refresh</button><pre id="content"></pre></section></div><script>const H=(j=true)=>j?{'authorization':'Bearer '+token.value,'content-type':'application/json'}:{'authorization':'Bearer '+token.value};async function out(r,e){let x;try{x=await r.json()}catch{x={status:r.status}};e.textContent=JSON.stringify(x,null,2);return x}async function connect(){await out(await fetch('/api/admin/schema',{headers:H(false)}),status);await loadAll()}async function migrate(){await out(await fetch('/api/admin/migrate',{method:'POST',headers:H(false)}),status);await loadAll()}async function loadAll(){await out(await fetch('/api/admin/content',{headers:H(false)}),content)}async function createQuote(){const b={content_id:cid.value,quote_type:type.value,quote:quote.value,author_name:author.value||null,author_source:source.value||null,source_url:source.value||null,category_slug:category.value||null,original_language:olang.value};await out(await fetch('/api/admin/content',{method:'POST',headers:H(),body:JSON.stringify(b)}),createOut);await loadAll()}async function upload(){if(!media.files[0])return;const f=new FormData();f.append('file',media.files[0]);f.append('language_code',mlang.value);f.append('asset_type',atype.value);if(mediaCid.value)f.append('content_item_id',mediaCid.value);await out(await fetch('/api/admin/media',{method:'POST',headers:H(false),body:f}),uploadOut)}</script></body></html>`}

async function api(request,env,url){
  if(url.pathname==='/api/health')return json({ok:true,project:PROJECT_ID,languages:LANGS,db:!!env.DB,r2:!!env.MEDIA,admin_secret:!!env.ADMIN_TOKEN});
  if(!env.DB)return json({ok:false,error:'DB binding unavailable'},503);
  if(!url.pathname.startsWith('/api/admin/'))return json({ok:false,error:'not found'},404);
  const deny=requireAdmin(request,env);if(deny)return deny;
  if(url.pathname==='/api/admin/schema'&&request.method==='GET')return json({ok:true,schema:await schemaStatus(env.DB)});
  if(url.pathname==='/api/admin/migrate'&&request.method==='POST')return applyMigrations(request,env);
  if(url.pathname==='/api/admin/content'&&request.method==='GET')return json({ok:true,items:await listContent(env)});
  if(url.pathname==='/api/admin/content'&&request.method==='POST')return createContent(request,env);
  const evidence=url.pathname.match(/^\/api\/admin\/content\/([A-Za-z0-9_-]+)\/evidence$/);if(evidence&&request.method==='POST')return addEvidence(request,env,evidence[1]);
  const version=url.pathname.match(/^\/api\/admin\/content\/([A-Za-z0-9_-]+)\/versions\/(uk|ru|pl|en|sv|de|es|fr)$/);if(version&&request.method==='PUT')return upsertVersion(request,env,version[1],version[2]);
  const item=url.pathname.match(/^\/api\/admin\/content\/([A-Za-z0-9_-]+)$/);if(item&&request.method==='GET'){const x=await getContent(env,item[1]);return x?json({ok:true,item:x}):json({ok:false,error:'not found'},404)}if(item&&request.method==='PATCH')return updateContent(request,env,item[1]);
  if(url.pathname==='/api/admin/media'&&request.method==='GET')return json({ok:true,items:await mediaList(env)});
  if(url.pathname==='/api/admin/media'&&request.method==='POST')return mediaUpload(request,env);
  return json({ok:false,error:'not found'},404);
}

export default{async fetch(request,env){const url=new URL(request.url);try{if(url.pathname==='/admin'||url.pathname==='/admin/')return new Response(adminHtml(),{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-robots-tag':'noindex,nofollow'}});if(url.pathname.startsWith('/api/'))return api(request,env,url);if(url.pathname==='/'||url.pathname==='/index.html')return Response.redirect(`${url.origin}/${preferred(request)}/`,302);return env.ASSETS.fetch(request)}catch(e){return json({ok:false,error:String(e?.message||e)},500)}}};
