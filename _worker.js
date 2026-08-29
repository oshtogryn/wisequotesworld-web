import legacyWorker from './_worker_legacy.js';
import {syncCanonicalRules} from './lib/canonical_rules.js';
import {siteV2} from './lib/site_v2.js';
import {productionConsoleApi} from './lib/production_console_api.js';

let rulesSynced=false;
let wq006PublishChecked=false;

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}})}
function adminAuth(request,env){return !!env.ADMIN_TOKEN&&(request.headers.get('authorization')||'')===`Bearer ${env.ADMIN_TOKEN}`}
async function tryDelete(env,sql,...args){try{const r=await env.DB.prepare(sql).bind(...args).run();return {ok:true,changes:r?.meta?.changes??null}}catch(e){return {ok:false,error:String(e?.message||e)}}}
async function hardResetPreparedTopic(request,env,id){
  if(!adminAuth(request,env))return json({ok:false,error:'unauthorized'},401);
  if(!env.DB)return json({ok:false,error:'DB binding unavailable'},503);
  if(!['WQ006','WQ011'].includes(id))return json({ok:false,error:'reset allowed only for prepared WQ006/WQ011'},400);
  const before=await env.DB.prepare(`SELECT id,canonical_title,original_quote,quote_type FROM content_items WHERE project_id='wisequotesworld' AND id=?`).bind(id).first();
  const steps={};
  steps.media_reviews=await tryDelete(env,`DELETE FROM media_reviews WHERE media_inbox_id IN (SELECT id FROM media_inbox WHERE project_id='wisequotesworld' AND content_item_id=?)`,id);
  steps.media_usage=await tryDelete(env,`DELETE FROM media_usage WHERE content_item_id=? OR content_version_id IN (SELECT id FROM content_versions WHERE content_id=?)`,id,id);
  steps.publication_attempts=await tryDelete(env,`DELETE FROM publication_attempts WHERE publication_id IN (SELECT p.id FROM publications p JOIN content_versions cv ON cv.id=p.content_version_id WHERE cv.content_id=?)`,id);
  steps.publications=await tryDelete(env,`DELETE FROM publications WHERE content_version_id IN (SELECT id FROM content_versions WHERE content_id=?)`,id);
  steps.pinterest_creatives=await tryDelete(env,`DELETE FROM pinterest_creatives WHERE content_item_id=?`,id);
  steps.ai_generation_jobs=await tryDelete(env,`DELETE FROM ai_generation_jobs WHERE content_item_id=?`,id);
  steps.quote_pages=await tryDelete(env,`DELETE FROM quote_pages WHERE content_item_id=?`,id);
  steps.content_approvals=await tryDelete(env,`DELETE FROM content_approvals WHERE content_item_id=?`,id);
  steps.quote_source_evidence=await tryDelete(env,`DELETE FROM quote_source_evidence WHERE content_item_id=?`,id);
  steps.workflow_steps=await tryDelete(env,`DELETE FROM workflow_steps WHERE content_item_id=?`,id);
  steps.content_outputs=await tryDelete(env,`DELETE FROM content_outputs WHERE project_id='wisequotesworld' AND content_item_id=?`,id);
  steps.media_inbox=await tryDelete(env,`DELETE FROM media_inbox WHERE project_id='wisequotesworld' AND content_item_id=?`,id);
  steps.content_versions=await tryDelete(env,`DELETE FROM content_versions WHERE content_id=?`,id);
  steps.content_item=await tryDelete(env,`DELETE FROM content_items WHERE project_id='wisequotesworld' AND id=?`,id);
  const after=await env.DB.prepare(`SELECT id FROM content_items WHERE project_id='wisequotesworld' AND id=?`).bind(id).first();
  const failed=Object.entries(steps).filter(([,v])=>!v.ok);
  if(after||failed.length)return json({ok:false,error:'hard reset incomplete',id,before,after:after||null,failed,steps},409);
  return json({ok:true,id,before,deleted:true,steps});
}

async function publishExplicitWQ006(env){
  if(wq006PublishChecked||!env.DB)return;
  wq006PublishChecked=true;
  const approved=await env.DB.prepare(`SELECT 1 ok FROM content_approvals WHERE content_item_id='WQ006' AND approval_scope='content' AND language_code IS NULL AND status='approved' LIMIT 1`).first();
  if(!approved)return;
  const ready=await env.DB.prepare(`SELECT COUNT(*) n FROM quote_pages WHERE project_id='wisequotesworld' AND content_item_id='WQ006' AND language_code IN ('uk','ru','pl','en','sv','de','es','fr') AND status IN ('ready','published')`).first();
  if(Number(ready?.n||0)!==8)return;
  const ts=new Date().toISOString();
  await env.DB.prepare(`UPDATE quote_pages SET status='published',published_at=COALESCE(published_at,?),updated_at=? WHERE project_id='wisequotesworld' AND content_item_id='WQ006' AND language_code IN ('uk','ru','pl','en','sv','de','es','fr') AND status IN ('ready','published')`).bind(ts,ts).run();
}

function mediaKindSql(kind){
  return kind==='video'
    ? `(LOWER(COALESCE(m.asset_type,'')) LIKE '%video%' OR LOWER(COALESCE(m.mime_type,'')) LIKE 'video/%')`
    : `(LOWER(COALESCE(m.asset_type,'')) LIKE '%pinterest%' OR LOWER(COALESCE(m.asset_type,'')) LIKE '%image%' OR LOWER(COALESCE(m.mime_type,'')) LIKE 'image/%')`;
}
async function approvedMedia(request,env,id,lang,kind){
  if(!env.DB||!env.MEDIA)return json({ok:false,error:'media delivery unavailable'},503);
  const approved=await env.DB.prepare(`SELECT 1 ok FROM content_approvals WHERE content_item_id=? AND approval_scope='content' AND language_code IS NULL AND status='approved' LIMIT 1`).bind(id).first();
  if(!approved)return json({ok:false,error:'content not approved'},404);
  const sql=`SELECT m.r2_key,m.mime_type,m.original_filename,m.created_at FROM media_inbox m JOIN media_reviews r ON r.media_inbox_id=m.id WHERE m.project_id='wisequotesworld' AND m.content_item_id=? AND m.language_code=? AND r.qa_status='approved' AND ${mediaKindSql(kind)} ORDER BY m.created_at DESC LIMIT 1`;
  const row=await env.DB.prepare(sql).bind(id,lang).first();
  if(!row?.r2_key)return json({ok:false,error:'approved media not found'},404);
  const obj=await env.MEDIA.get(row.r2_key);
  if(!obj)return json({ok:false,error:'R2 object missing'},404);
  const headers=new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('content-type',row.mime_type||headers.get('content-type')||'application/octet-stream');
  headers.set('cache-control','public, max-age=86400, immutable');
  headers.set('content-disposition',`inline; filename="${String(row.original_filename||kind).replace(/["\r\n]/g,'_')}"`);
  headers.set('x-robots-tag','noindex,nofollow,noarchive');
  return new Response(obj.body,{headers});
}

export default {
  async fetch(request,env,ctx){
    try{
      const url=new URL(request.url);
      if(env.DB && !rulesSynced){
        await syncCanonicalRules(env);
        rulesSynced=true;
      }
      await publishExplicitWQ006(env);
      if(url.pathname==='/admin'||url.pathname==='/admin/'){
        return Response.redirect(`${url.origin}/admin/console/`,302);
      }
      const approvedMediaMatch=url.pathname.match(/^\/media\/approved\/([A-Za-z0-9_-]+)\/(uk|ru|pl|en|sv|de|es|fr)\/(video|pinterest)$/);
      if(approvedMediaMatch&&request.method==='GET')return approvedMedia(request,env,approvedMediaMatch[1],approvedMediaMatch[2],approvedMediaMatch[3]);
      const reset=url.pathname.match(/^\/api\/admin\/prepared\/reset\/(WQ006|WQ011)$/);
      if(reset&&request.method==='POST')return hardResetPreparedTopic(request,env,reset[1]);
      const productionResponse=await productionConsoleApi(request,env);
      if(productionResponse)return productionResponse;
      const publicResponse=await siteV2(request,env);
      if(publicResponse)return publicResponse;
      return legacyWorker.fetch(request,env,ctx);
    }catch(e){
      return new Response(JSON.stringify({ok:false,error:String(e?.message||e)}),{status:500,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
    }
  }
};