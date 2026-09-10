import {requireAdmin} from './admin_auth.js';
import {json,cleanIdentifier,cleanFilename} from './http.js';
import {sha256Hex,validateMediaMetadata} from './media_validation.js';

const PROJECT_ID='wisequotesworld';
const LANGS=new Set(['uk','ru','pl','en','sv','de','es','fr','it','pt','id','tr','ar']);
const KINDS=new Set(['video','pinterest','pinterest_image','image']);
function now(){return new Date().toISOString()}

export async function manualMediaApi(request,env){
 const u=new URL(request.url);
 if(u.pathname!=='/api/admin/media/manual-upload'||request.method!=='POST')return null;
 const denied=await requireAdmin(request,env);if(denied)return denied;
 if(!env.DB||!env.MEDIA)return json({ok:false,error:'DB or MEDIA binding unavailable'},503);

 const f=await request.formData();
 const file=f.get('file'),contentId=cleanIdentifier(f.get('content_id')||f.get('content_item_id'),60),lang=String(f.get('language_code')||'').toLowerCase(),kind=String(f.get('kind')||f.get('asset_type')||'').toLowerCase();
 if(!file||typeof file.arrayBuffer!=='function')return json({ok:false,error:'file required'},400);
 if(!contentId||!LANGS.has(lang)||!KINDS.has(kind))return json({ok:false,error:'valid content_id, language_code and kind required'},400);

 const exists=await env.DB.prepare('SELECT 1 ok FROM content_items WHERE id=? AND project_id=?').bind(contentId,PROJECT_ID).first();
 if(!exists)return json({ok:false,error:'content not found'},404);

 const type=String(file.type||'application/octet-stream').toLowerCase();
 const isVideo=kind==='video',isImage=!isVideo;
 if(isVideo&&!type.startsWith('video/'))return json({ok:false,error:'wrong file type for video',content_type:type},415);
 if(isImage&&!type.startsWith('image/'))return json({ok:false,error:'wrong file type for image',content_type:type},415);
 const max=isVideo?100*1024*1024:20*1024*1024;
 if(Number(file.size||0)>max)return json({ok:false,error:'file too large',max_bytes:max},413);

 // Read once, hash before R2 write, and reuse the same bytes for upload.
 const bytes=await file.arrayBuffer();
 const sha256=await sha256Hex(bytes);
 const duplicate=await env.DB.prepare(`SELECT id,r2_key,content_item_id,language_code,asset_type,mime_type,size_bytes,status FROM media_inbox WHERE project_id=? AND sha256=? ORDER BY created_at ASC LIMIT 1`).bind(PROJECT_ID,sha256).first();
 if(duplicate){
  return json({ok:false,error:'duplicate_media',sha256,existing_media:{media_id:duplicate.id,r2_key:duplicate.r2_key,content_id:duplicate.content_item_id,language_code:duplicate.language_code,asset_type:duplicate.asset_type,mime_type:duplicate.mime_type,size_bytes:duplicate.size_bytes,status:duplicate.status}},409);
 }

 // Width/height/duration are intentionally left unknown here. They must be
 // populated by a trusted metadata extractor; target prompt dimensions are
 // never treated as actual binary dimensions.
 const validation=validateMediaMetadata({kind,mime_type:type,size_bytes:Number(file.size||0)});
 const id=crypto.randomUUID(),filename=cleanFilename(file.name),key=`manual/${contentId}/${lang}/${kind}/${id}-${filename}`,t=now();
 await env.MEDIA.put(key,bytes,{httpMetadata:{contentType:type},customMetadata:{project:PROJECT_ID,content_id:contentId,language_code:lang,kind,original_name:String(file.name||''),sha256}});

 try{
  await env.DB.prepare(`INSERT INTO media_inbox(id,project_id,content_item_id,content_version_id,r2_key,original_filename,asset_type,language_code,mime_type,size_bytes,sha256,status,uploaded_via,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(id,PROJECT_ID,contentId,null,key,String(file.name||filename),kind,lang,type,Number(file.size||0),sha256,'ready','admin',t,t).run();
  // migration11 creates this table. Keep upload compatible with production
  // until that migration is promoted: failure to persist enhanced validation
  // metadata must not orphan the successfully registered media row.
  try{
   await env.DB.prepare(`INSERT INTO media_validation(media_inbox_id,project_id,asset_profile,width,height,aspect_ratio,duration_seconds,file_size_bytes,codec,container,automated_qa_status,manual_qa_status,checks_json,validated_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(id,PROJECT_ID,validation.profile,null,null,null,null,Number(file.size||0),null,null,validation.status,'pending',JSON.stringify(validation.checks),t,t).run();
  }catch{}
 }catch(e){
  await env.MEDIA.delete(key);
  return json({ok:false,error:'D1 media registration failed; R2 rolled back',detail:String(e?.message||e)},500);
 }

 return json({ok:true,media_id:id,r2_key:key,content_id:contentId,language_code:lang,kind,bytes:Number(file.size||0),content_type:type,sha256,automated_qa_status:validation.status,manual_qa_status:'pending',checks:validation.checks},201);
}
