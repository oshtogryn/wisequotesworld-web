import {requireAdmin} from './admin_auth.js';
import {normalizeLocale} from './locale_registry.js';
import {SOCIAL_VIDEO_POLICY} from './media_delivery_policy.js';

const PROJECT_ID='wisequotesworld';
const KINDS=new Set(['video','video_normalized','pinterest','pinterest_image','image']);
const IMAGE_MIMES=new Set(['image/png','image/jpeg','image/webp']);
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}})}
function clean(v){return String(v||'').replace(/[^A-Za-z0-9_-]/g,'').slice(0,60)}
function cleanName(v){return String(v||'upload.bin').replace(/[^A-Za-z0-9._-]/g,'_').slice(0,180)||'upload.bin'}
function now(){return new Date().toISOString()}
function ext(v){const m=String(v||'').toLowerCase().match(/\.([a-z0-9]+)$/);return m?m[1]:''}

export async function manualMediaApi(request,env){
 const u=new URL(request.url);
 if(u.pathname!=='/api/admin/media/manual-upload'||request.method!=='POST')return null;
 const denied=await requireAdmin(request,env);if(denied)return denied;
 if(!env.DB||!env.MEDIA)return json({ok:false,error:'DB or MEDIA binding unavailable'},503);
 const f=await request.formData();
 const file=f.get('file'),contentId=clean(f.get('content_id')||f.get('content_item_id')),lang=normalizeLocale(f.get('language_code')),kind=String(f.get('kind')||f.get('asset_type')||'').toLowerCase();
 if(!file||typeof file.arrayBuffer!=='function')return json({ok:false,error:'file required'},400);
 if(!contentId||!lang||!KINDS.has(kind))return json({ok:false,error:'valid content_id, language_code and kind required'},400);
 const exists=await env.DB.prepare('SELECT 1 ok FROM content_items WHERE id=? AND project_id=?').bind(contentId,PROJECT_ID).first();
 if(!exists)return json({ok:false,error:'content not found'},404);
 const type=String(file.type||'application/octet-stream').toLowerCase(),filename=cleanName(file.name),normalized=kind==='video_normalized',isVideo=kind==='video'||normalized,isImage=!isVideo;
 if(isVideo&&!type.startsWith('video/'))return json({ok:false,error:'wrong file type for video',content_type:type},415);
 if(isImage&&!IMAGE_MIMES.has(type))return json({ok:false,error:'unsupported image type',content_type:type,allowed:[...IMAGE_MIMES]},415);
 if(normalized&&(type!=='video/mp4'||ext(filename)!=='mp4'))return json({ok:false,error:'normalized video must be .mp4 with video/mp4 MIME',content_type:type,filename},415);
 const max=isVideo?SOCIAL_VIDEO_POLICY.maxBytes:20*1024*1024;
 if(Number(file.size||0)>max)return json({ok:false,error:'file too large',max_bytes:max},413);
 if(Number(file.size||0)<=0)return json({ok:false,error:'empty file'},400);
 const id=crypto.randomUUID(),key=`manual/${contentId}/${lang}/${kind}/${id}-${filename}`,t=now();
 await env.MEDIA.put(key,await file.arrayBuffer(),{httpMetadata:{contentType:type},customMetadata:{project:PROJECT_ID,content_id:contentId,language_code:lang,kind,normalized:normalized?'1':'0',original_name:String(file.name||'')}});
 try{
  await env.DB.prepare(`INSERT INTO media_inbox(id,project_id,content_item_id,content_version_id,r2_key,original_filename,asset_type,language_code,mime_type,size_bytes,status,uploaded_via,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(id,PROJECT_ID,contentId,null,key,String(file.name||filename),kind,lang,type,Number(file.size||0),'ready',normalized?'media-normalizer':'admin',t,t).run();
 }catch(e){await env.MEDIA.delete(key);return json({ok:false,error:'D1 media registration failed; R2 rolled back',detail:String(e?.message||e)},500)}
 return json({ok:true,media_id:id,r2_key:key,content_id:contentId,language_code:lang,kind,bytes:Number(file.size||0),content_type:type,qa_status:'pending',normalized,needs_normalization:isVideo&&!normalized,delivery_policy:isVideo?SOCIAL_VIDEO_POLICY:null},201);
}
