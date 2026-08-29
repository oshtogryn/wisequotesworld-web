import legacyWorker from './_worker_legacy.js';
import {syncCanonicalRules} from './lib/canonical_rules.js';
import {siteV2} from './lib/site_v2.js';
import {productionConsoleApi} from './lib/production_console_api.js';

let rulesSynced=false;

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

export default {
  async fetch(request,env,ctx){
    try{
      const url=new URL(request.url);
      if(env.DB && !rulesSynced){
        await syncCanonicalRules(env);
        rulesSynced=true;
      }
      if(url.pathname==='/admin'||url.pathname==='/admin/'){
        return Response.redirect(`${url.origin}/admin/console/`,302);
      }
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