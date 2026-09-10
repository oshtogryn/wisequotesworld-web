import {requireAdmin} from './admin_auth.js';

const PROJECT_ID='wisequotesworld';
const LANGS=new Set(['uk','ru','pl','en','sv','de','es','fr','it','pt','id','tr','ar']);
const KINDS=new Set(['video','pinterest','pinterest_image','image']);
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}})}
function clean(v){return String(v||'').replace(/[^A-Za-z0-9_-]/g,'').slice(0,60)}
function cleanName(v){return String(v||'upload.bin').replace(/[^A-Za-z0-9._-]/g,'_').slice(0,180)||'upload.bin'}
function now(){return new Date().toISOString()}
export async function manualMediaApi(request,env){
 const u=new URL(request.url);
 if(u.pathname!=='/api/admin/media/manual-upload'||request.method!=='POST')return null;
 const denied=await requireAdmin(request,env);if(denied)return denied;
 if(!env.DB||!env.MEDIA)return json({ok:false,error:'DB or MEDIA binding unavailable'},503);
 const f=await request.formData();
 const file=f.get('file'),contentId=clean(f.get('content_id')||f.get('content_item_id')),lang=String(f.get('language_code')||'').toLowerCase(),kind=String(f.get('kind')||f.get('asset_type')||'').toLowerCase();
 if(!file||typeof file.arrayBuffer!=='function')return json({ok:false,error:'file required'},400);
 if(!contentId||!LANGS.has(lang)||!KINDS.has(kind))return json({ok:false,error:'valid content_id, language_code and kind required'},400);
 const exists=await env.DB.prepare('SELECT 1 ok FROM content_items WHERE id=? AND project_id=?').bind(contentId,PROJECT_ID).first();
 if(!exists)return json({ok:false,error:'content not found'},404);
 const type=String(file.type||'application/octet-stream').toLowerCase();
 const isVideo=kind==='video',isImage=!isVideo;
 if(isVideo&&!type.startsWith('video/'))return json({ok:false,error:'wrong file type for video',content_type:type},415);
 if(isImage&&!type.startsWith('image/'))return json({ok:false,error:'wrong file type for image',content_type:type},415);
 const max=isVideo?100*1024*1024:20*1024*1024;if(Number(file.size||0)>max)return json({ok:false,error:'file too large',max_bytes:max},413);
 const id=crypto.randomUUID(),filename=cleanName(file.name),key=`manual/${contentId}/${lang}/${kind}/${id}-${filename}`,t=now();
 await env.MEDIA.put(key,await file.arrayBuffer(),{httpMetadata:{contentType:type},customMetadata:{project:PROJECT_ID,content_id:contentId,language_code:lang,kind,original_name:String(file.name||'')}});
 try{
  await env.DB.prepare(`INSERT INTO media_inbox(id,project_id,content_item_id,content_version_id,r2_key,original_filename,asset_type,language_code,mime_type,size_bytes,status,uploaded_via,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(id,PROJECT_ID,contentId,null,key,String(file.name||filename),kind,lang,type,Number(file.size||0),'ready','admin',t,t).run();
 }catch(e){await env.MEDIA.delete(key);return json({ok:false,error:'D1 media registration failed; R2 rolled back',detail:String(e?.message||e)},500)}
 return json({ok:true,media_id:id,r2_key:key,content_id:contentId,language_code:lang,kind,bytes:Number(file.size||0),content_type:type,qa_status:'pending'},201);
}
