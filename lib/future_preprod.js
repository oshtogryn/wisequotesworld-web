import {seedFutureTopics,readbackFutureTopics} from './future_topics_v1.js';
import {applyWQ017Premedia,readbackWQ017Premedia} from './wq017_premedia_apply.js';

const PROJECT='wisequotesworld';

export async function prepareFuturePreprod(env){
  if(!env?.DB)return{ok:false,stage:'init',error:'DB unavailable'};
  let stage='backlog';
  try{
    const backlog=await seedFutureTopics(env);
    stage='mark_franko_skipped';
    await env.DB.prepare(`UPDATE content_items SET notes=?,updated_at=? WHERE project_id=? AND id='WQ016'`).bind('Редакційно пропущено. Не запускати WQ016 у production без нового explicit рішення користувача.',new Date().toISOString(),PROJECT).run();
    stage='wq017_premedia';
    const wq017=await applyWQ017Premedia(env);
    if(!wq017.ok)return{ok:false,stage,error:'WQ017 pre-media package failed',wq017,backlog};
    stage='readback';
    const backlogReadback=await readbackFutureTopics(env);
    const wq017Readback=await readbackWQ017Premedia(env);
    return{ok:!!wq017Readback.ok,stage:'done',backlog:backlogReadback,wq017:wq017Readback};
  }catch(e){return{ok:false,stage,error:String(e?.message||e)}}
}
