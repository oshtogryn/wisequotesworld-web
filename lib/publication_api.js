import {websitePublicationReadiness,publishWebsite} from './publication_engine.js';
import {requireAdmin} from './admin_auth.js';

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}})}

export async function publicationApi(request,env){
 const url=new URL(request.url);
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
