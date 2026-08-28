const LANGS=['en','uk','ru','pl','sv','de','es','fr'];
const PLATFORMS=['facebook','instagram','threads','tiktok','youtube','pinterest'];
const FR_PENDING=new Set(['facebook','instagram','threads','tiktok','youtube']);
const PROJECT_ID='wisequotesworld';

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}})}
function now(){return new Date().toISOString()}
async function body(request){try{return await request.json()}catch{return null}}

async function latestVersion(env,contentId,lang){return env.DB.prepare(`SELECT * FROM content_versions WHERE content_id=? AND language_code=? ORDER BY version DESC LIMIT 1`).bind(contentId,lang).first()}

async function listPublications(env){
 const rows=(await env.DB.prepare(`SELECT p.*,cv.content_id,cv.language_code FROM publications p JOIN content_versions cv ON cv.id=p.content_version_id ORDER BY COALESCE(p.scheduled_at,p.published_at,'') DESC,p.id DESC LIMIT 200`).all()).results||[];
 return json({ok:true,items:rows});
}

async function duePublications(env){
 const rows=(await env.DB.prepare(`SELECT p.*,cv.content_id,cv.language_code FROM publications p JOIN content_versions cv ON cv.id=p.content_version_id WHERE p.status='scheduled' AND p.scheduled_at IS NOT NULL AND p.scheduled_at<=? ORDER BY p.scheduled_at ASC LIMIT 100`).bind(now()).all()).results||[];
 return json({ok:true,items:rows,count:rows.length});
}

async function createPublication(request,env){
 const b=await body(request)||{},contentId=String(b.content_id||'').trim(),lang=String(b.language_code||'').toLowerCase(),platform=String(b.platform_code||'').toLowerCase();
 if(!contentId)return json({ok:false,error:'content_id required'},400);if(!LANGS.includes(lang))return json({ok:false,error:'unsupported language'},400);if(!PLATFORMS.includes(platform))return json({ok:false,error:'unsupported platform'},400);
 if(lang==='fr'&&FR_PENDING.has(platform))return json({ok:false,error:'French social account is not connected yet',platform_code:platform},409);
 const v=await latestVersion(env,contentId,lang);if(!v)return json({ok:false,error:'localized content_version missing'},409);
 const status=['draft','scheduled'].includes(String(b.status||''))?String(b.status):'draft';if(status==='scheduled'&&!b.scheduled_at)return json({ok:false,error:'scheduled_at required for scheduled status'},400);
 const id=`PUB_${crypto.randomUUID()}`;
 try{
  await env.DB.prepare(`INSERT INTO publications(id,content_version_id,social_account_id,platform_code,content_type,file_url,text_snapshot,scheduled_at,published_at,timezone,external_id,external_url,status,notes) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(id,v.id,b.social_account_id||null,platform,b.content_type||'short',b.file_url||null,b.text_snapshot||null,b.scheduled_at||null,null,b.timezone||'Europe/Stockholm',null,null,status,b.notes||null).run();
 }catch(e){return json({ok:false,error:'publication_create_blocked',detail:String(e.message||e)},409)}
 return json({ok:true,id,publication:await env.DB.prepare(`SELECT * FROM publications WHERE id=?`).bind(id).first()},201);
}

async function readbackPublication(request,env,id){
 const cur=await env.DB.prepare(`SELECT * FROM publications WHERE id=?`).bind(id).first();if(!cur)return json({ok:false,error:'publication not found'},404);const b=await body(request)||{};
 const status=String(b.status||cur.status||'').toLowerCase(),allowed=['draft','scheduled','publishing','published','failed'];if(!allowed.includes(status))return json({ok:false,error:'invalid status'},400);
 try{
  await env.DB.prepare(`UPDATE publications SET external_id=?,external_url=?,status=?,published_at=?,notes=? WHERE id=?`).bind(b.external_id??cur.external_id,b.external_url??cur.external_url,status,status==='published'?(b.published_at||cur.published_at||now()):cur.published_at,b.notes??cur.notes,id).run();
  await env.DB.prepare(`INSERT INTO publication_attempts(publication_id,provider,request_fingerprint,external_id,status,error_code,error_detail,attempted_at) VALUES(?,?,?,?,?,?,?,?)`).bind(id,b.provider||'native-api',b.request_fingerprint||null,b.external_id??cur.external_id,status,b.error_code||null,b.error_detail||null,now()).run();
 }catch(e){return json({ok:false,error:'readback_update_blocked',detail:String(e.message||e)},409)}
 return json({ok:true,publication:await env.DB.prepare(`SELECT * FROM publications WHERE id=?`).bind(id).first()});
}

async function addAnalytics(request,env,id){
 const p=await env.DB.prepare(`SELECT p.*,cv.content_id FROM publications p JOIN content_versions cv ON cv.id=p.content_version_id WHERE p.id=?`).bind(id).first();if(!p)return json({ok:false,error:'publication not found'},404);const b=await body(request)||{};
 const captured=b.captured_at||now();
 await env.DB.prepare(`INSERT INTO analytics_snapshots(project_id,content_version_id,publication_id,platform_code,captured_at,checkpoint,views,reach,likes,comments,shares,saves,interactions,followers,watch_time_seconds,raw_json,source) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(PROJECT_ID,p.content_version_id,id,p.platform_code,captured,b.checkpoint||'manual',b.views??null,b.reach??null,b.likes??null,b.comments??null,b.shares??null,b.saves??null,b.interactions??null,b.followers??null,b.watch_time_seconds??null,b.raw_json?JSON.stringify(b.raw_json):null,b.source||'native-api').run();
 return json({ok:true,publication_id:id,captured_at:captured},201);
}

async function analyticsSummary(env,url){
 let days=Number(url.searchParams.get('days')||30);if(!Number.isFinite(days)||days<1)days=30;if(days>365)days=365;
 const rows=(await env.DB.prepare(`SELECT platform_code,COUNT(*) snapshots,MAX(captured_at) last_capture,MAX(views) views,MAX(reach) reach,MAX(likes) likes,MAX(comments) comments,MAX(shares) shares,MAX(saves) saves,MAX(interactions) interactions,MAX(followers) followers,MAX(watch_time_seconds) watch_time_seconds FROM analytics_snapshots WHERE project_id=? AND captured_at>=datetime('now',?) GROUP BY platform_code ORDER BY platform_code`).bind(PROJECT_ID,`-${days} days`).all()).results||[];
 return json({ok:true,days,platforms:rows});
}

export async function publicationApi(request,env,url){
 if(url.pathname==='/api/admin/publications'&&request.method==='GET')return listPublications(env);
 if(url.pathname==='/api/admin/publications'&&request.method==='POST')return createPublication(request,env);
 if(url.pathname==='/api/admin/publications/due'&&request.method==='GET')return duePublications(env);
 if(url.pathname==='/api/admin/analytics/summary'&&request.method==='GET')return analyticsSummary(env,url);
 const rb=url.pathname.match(/^\/api\/admin\/publications\/([A-Za-z0-9_-]+)\/readback$/);if(rb&&request.method==='POST')return readbackPublication(request,env,rb[1]);
 const an=url.pathname.match(/^\/api\/admin\/publications\/([A-Za-z0-9_-]+)\/analytics$/);if(an&&request.method==='POST')return addAnalytics(request,env,an[1]);
 return null;
}
