import {seedFutureTopics,readbackFutureTopics} from './future_topics_v1.js';
import {applyWQ017Premedia,readbackWQ017Premedia} from './wq017_premedia_apply.js';
import {prepareBatch018026,readBatch018026} from './prepared_batch_018_026.js';

const PROJECT='wisequotesworld';
export async function prepareFuturePreprod(env){
  if(!env?.DB)return{ok:false,stage:'init',error:'DB unavailable'};
  let stage='backlog';
  try{
    await seedFutureTopics(env);
    stage='mark_franko_skipped';
    const ts=new Date().toISOString();
    await env.DB.prepare(`UPDATE content_items SET status='skipped',notes=?,updated_at=? WHERE project_id=? AND id='WQ016'`).bind('Редакційно пропущено. Не запускати WQ016 у production без нового explicit рішення користувача.',ts,PROJECT).run();
    try{await env.DB.prepare(`UPDATE content_versions SET status='skipped',updated_at=? WHERE content_id='WQ016' AND status<>'published'`).bind(ts).run()}catch{}
    stage='wq017_premedia';
    const wq017=await applyWQ017Premedia(env);if(!wq017.ok)return{ok:false,stage,error:'WQ017 pre-media package failed',wq017};
    stage='batch_018_026';
    const batch=await prepareBatch018026(env);if(!batch.ok)return{ok:false,stage,error:'WQ018-WQ026 batch failed',batch};
    stage='readback';
    const [backlog,wq017Readback,batchReadback]=await Promise.all([readbackFutureTopics(env),readbackWQ017Premedia(env),readBatch018026(env)]);
    return{ok:!!wq017Readback.ok&&!!batchReadback.ok,stage:'done',backlog,wq017:wq017Readback,batch:batchReadback};
  }catch(e){return{ok:false,stage,error:String(e?.message||e)}}
}
