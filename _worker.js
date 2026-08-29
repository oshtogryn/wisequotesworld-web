import legacyWorker from './_worker_legacy.js';
import {syncCanonicalRules} from './lib/canonical_rules.js';
import {siteV2} from './lib/site_v2.js';
import {productionConsoleApi} from './lib/production_console_api.js';

let rulesSynced=false;

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