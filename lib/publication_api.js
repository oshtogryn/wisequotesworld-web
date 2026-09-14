import {websitePublicationReadiness,publishWebsite} from './publication_engine.js';
import {requireAdmin} from './admin_auth.js';
import {readPromptAudit} from './prompt_audit_023_030_10langs_20260914.js';
import {readWQ023SocialPack} from './wq023_social_readback_20260914.js';

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}})}

export async function publicationApi(request,env){
 const url=new URL(request.url);
 if(url.pathname==='/prompt-audit-readback-20260914.json'&&request.method==='GET'){
  const r=await readPromptAudit(env);
  return json({ok:r.ok,count:r.count,video_prompts:r.video_prompts,pinterest_prompts:r.pinterest_prompts,checks:r.checks.map(x=>({id:x.id,language:x.language,video_ok:x.video_ok,pinterest_ok:x.pinterest_ok}))});
 }
 if(url.pathname==='/wq023-social-readback-20260914.json'&&request.method==='GET')return json(await readWQ023SocialPack(env));
 if(!url.pathname.startsWith('/api/admin/publication/'))return null;
 const denied=await requireAdmin(request,env);if(denied)return denied;
 if(!env?.DB)return json({ok:false,error:'DB unavailable'},503);
 const m=url.pathname.match(/^\/api\/admin\/publication\/([A-Za-z0-9_-]+)\/website(?:\/readiness)?$/);
 if(!m)return json({ok:false,error:'not found'},404);
 const id=m[1],isReadiness=url.pathname.endsWith('/readiness');
 if(request.method==='GET'&&isReadiness)return json(await websitePublicationReadiness(env,id));
 if(request.method==='POST'&&!isReadiness){const r=await publishWebsite(env,id);return json(r,r.ok&&r.published?200:(r.ok?409:400))}
 return json({ok:false,error:'method not allowed'},405);
}
