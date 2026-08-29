const PROJECT_ID='wisequotesworld';
const LANGS=new Set(['uk','ru','pl','en','sv','de','es','fr']);
const KINDS=new Set(['video','pinterest_image']);
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}})}
function auth(req,env){return !!env.ADMIN_TOKEN&&(req.headers.get('authorization')||'')===`Bearer ${env.ADMIN_TOKEN}`}
function clean(v){return String(v||'').replace(/[^A-Za-z0-9_-]/g,'').slice(0,60)}
export async function manualMediaApi(request,env){
 const u=new URL(request.url);
 if(u.pathname!=='/api/admin/media/manual-upload'||request.method!=='POST')return null;
 if(!auth(request,env))return json({ok:false,error:'unauthorized'},401);
 if(!env.DB||!env.MEDIA)return json({ok:false,error:'DB or MEDIA binding unavailable'},503);
 const f=await request.formData();
 const file=f.get('file'),contentId=clean(f.get('content_id')),lang=String(f.get('language_code')||'').toLowerCase(),kind=String(f.get('kind')||'');
 if(!file||typeof file.arrayBuffer!=='function')return json({ok:false,error:'file required'},400);
 if(!contentId||!LANGS.has(lang)||!KINDS.has(kind))return json({ok:false,error:'valid content_id, language_code and kind required'},400);
 const exists=await env.DB.prepare('SELECT 1 ok FROM content_items WHERE id=? AND project_id=?').bind(contentId,PROJECT_ID).first();
 if(!exists)return json({ok:false,error:'content not found'},404);
 const type=String(file.type||'application/octet-stream');
 const ok=kind==='video'?type.startsWith('video/'):type.startsWith('image/');
 if(!ok)return json({ok:false,error:`wrong file type for ${kind}`,content_type:type},415);
 const max=kind==='video'?100*1024*1024:20*1024*1024;if(file.size>max)return json({ok:false,error:'file too large',max_bytes:max},413);
 const ext=(String(file.name||'').split('.').pop()|| (kind==='video'?'mp4':'jpg')).replace(/[^a-zA-Z0-9]/g,'').toLowerCase();
 const id=crypto.randomUUID(),key=`manual/${contentId}/${lang}/${kind}/${id}.${ext}`;
 await env.MEDIA.put(key,await file.arrayBuffer(),{httpMetadata:{contentType:type},customMetadata:{project:PROJECT_ID,content_id:contentId,language_code:lang,kind,original_name:String(file.name||'')}});
 const t=new Date().toISOString();
 try{await env.DB.prepare(`INSERT INTO media_inbox(id,project_id,content_item_id,language_code,media_type,source_type,source_ref,storage_key,status,qa_status,created_at,updated_at) VALUES(?,?,?,?,?,'manual_upload',?,?,'ready','pending',?,?)`).bind(id,PROJECT_ID,contentId,lang,kind,String(file.name||''),key,t,t).run()}catch(e){await env.MEDIA.delete(key);return json({ok:false,error:'D1 media registration failed',detail:String(e?.message||e)},500)}
 return json({ok:true,media_id:id,r2_key:key,content_id:contentId,language_code:lang,kind,bytes:file.size,content_type:type,qa_status:'pending'},201);
}
