import {latestDigestArticles,renderDigest} from '../lib/newsletter_digest.js';
import {sendBrevoEmail} from '../lib/brevo_newsletter.js';
import {PROJECT_ID} from '../lib/project_config.js';

const MAX_QUEUE_BATCH=100;
const DUMMY_DOMAINS=new Set(['example.invalid','example.com','example.org','example.net']);

function nowIso(){return new Date().toISOString()}
function isDummyEmail(email){const domain=String(email||'').toLowerCase().split('@')[1]||'';return !domain||domain.endsWith('.invalid')||DUMMY_DOMAINS.has(domain)}
function maskEmail(email){const [l='',d='']=String(email||'').split('@');return l?`${l.slice(0,2)}***@${d}`:'***'}
function cycleKey(cadenceDays,at=new Date()){
  const day=Math.floor(at.getTime()/86400000);
  return `${cadenceDays}d-${Math.floor(day/Math.max(1,cadenceDays))}`;
}

async function recordJob(env,{jobId,jobType,status,startedAt,finishedAt=null,attempt=1,processed=0,success=0,failure=0,error=null,metadata=null}){
  try{
    await env.DB.prepare(`INSERT INTO job_runs(job_id,project_id,job_type,started_at,finished_at,attempt,status,source,processed_count,success_count,failure_count,error,metadata_json) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(job_id) DO UPDATE SET finished_at=excluded.finished_at,attempt=excluded.attempt,status=excluded.status,processed_count=excluded.processed_count,success_count=excluded.success_count,failure_count=excluded.failure_count,error=excluded.error,metadata_json=excluded.metadata_json`).bind(jobId,PROJECT_ID,jobType,startedAt,finishedAt,attempt,status,'cloudflare',processed,success,failure,error,metadata?JSON.stringify(metadata):null).run();
  }catch{}
}

async function recordEvent(env,{subscriberId,deliveryId,eventType,providerEventId=null,detail=null}){
  try{
    await env.DB.prepare(`INSERT INTO newsletter_events(project_id,subscriber_id,delivery_id,event_type,provider,provider_event_id,detail,occurred_at,created_at) VALUES(?,?,?,?,?,?,?,?,?)`).bind(PROJECT_ID,subscriberId,deliveryId,eventType,'brevo',providerEventId,detail,nowIso(),nowIso()).run();
  }catch{}
}

async function settings(env){
  return await env.DB.prepare(`SELECT * FROM newsletter_settings WHERE project_id=? LIMIT 1`).bind(PROJECT_ID).first();
}

async function enqueueDue(env){
  if(!env?.DB||!env?.NEWSLETTER_QUEUE)throw new Error('newsletter_bindings_missing');
  const s=await settings(env);if(!s||!Number(s.enabled))return {ok:true,skipped:'disabled'};
  const cadence=Math.max(1,Number(s.cadence_days)||14),key=cycleKey(cadence),cap=Math.min(MAX_QUEUE_BATCH,Math.max(1,Number(s.daily_cap)||300));
  const rows=(await env.DB.prepare(`SELECT n.rowid AS subscriber_id,n.language_code,n.email
    FROM newsletter_subscribers n
    WHERE n.project_id=? AND n.status='active'
      AND NOT EXISTS (SELECT 1 FROM newsletter_suppressions s WHERE s.project_id=n.project_id AND s.subscriber_id=n.rowid AND s.active=1)
      AND NOT EXISTS (SELECT 1 FROM newsletter_deliveries d WHERE d.project_id=n.project_id AND d.subscriber_id=n.rowid AND d.cycle_key=? AND d.status IN ('reserved','queued','sent'))
    ORDER BY n.updated_at ASC LIMIT ?`).bind(PROJECT_ID,key,cap*3).all()).results||[];

  let queued=0,skipped=0;
  for(const sub of rows){
    if(queued>=cap)break;
    if(isDummyEmail(sub.email)){skipped++;continue}
    const created=nowIso();let delivery=null;
    try{
      delivery=await env.DB.prepare(`INSERT INTO newsletter_deliveries(project_id,subscriber_id,cycle_key,language_code,email_masked,status,created_at) VALUES(?,?,?,?,?,'reserved',?) RETURNING id`).bind(PROJECT_ID,sub.subscriber_id,key,sub.language_code,maskEmail(sub.email),created).first();
    }catch{skipped++;continue}
    const message={project_id:PROJECT_ID,subscriber_id:sub.subscriber_id,delivery_id:delivery?.id||null,cycle_key:key,language_code:sub.language_code,queued_at:created};
    try{
      await env.NEWSLETTER_QUEUE.send(message);
      await env.DB.prepare(`UPDATE newsletter_deliveries SET status='queued' WHERE id=? AND project_id=?`).bind(delivery.id,PROJECT_ID).run();
      await recordEvent(env,{subscriberId:sub.subscriber_id,deliveryId:delivery.id,eventType:'reserved',detail:'queued'});
      queued++;
    }catch(e){
      await env.DB.prepare(`UPDATE newsletter_deliveries SET status='failed',error=? WHERE id=? AND project_id=?`).bind(`queue_send:${String(e?.message||e).slice(0,400)}`,delivery.id,PROJECT_ID).run();
      await recordEvent(env,{subscriberId:sub.subscriber_id,deliveryId:delivery.id,eventType:'failed',detail:'queue_send'});
    }
  }
  await env.DB.prepare(`UPDATE newsletter_settings SET last_run_at=?,updated_at=? WHERE project_id=?`).bind(nowIso(),nowIso(),PROJECT_ID).run();
  return {ok:true,cycle_key:key,queued,skipped};
}

async function consumeOne(env,msg){
  const body=msg.body||{},subscriberId=Number(body.subscriber_id),deliveryId=Number(body.delivery_id);
  if(!Number.isInteger(subscriberId)||subscriberId<=0||!Number.isInteger(deliveryId)||deliveryId<=0)throw new Error('invalid_queue_message');
  const delivery=await env.DB.prepare(`SELECT * FROM newsletter_deliveries WHERE id=? AND project_id=? LIMIT 1`).bind(deliveryId,PROJECT_ID).first();
  if(!delivery)return {status:'skip',reason:'delivery_not_found'};
  if(delivery.status==='sent')return {status:'skip',reason:'already_sent'};
  const sub=await env.DB.prepare(`SELECT rowid AS subscriber_id,email,language_code,unsubscribe_token,status FROM newsletter_subscribers n WHERE n.project_id=? AND n.rowid=? LIMIT 1`).bind(PROJECT_ID,subscriberId).first();
  if(!sub||sub.status!=='active'||isDummyEmail(sub.email))return {status:'skip',reason:'subscriber_inactive'};
  const suppressed=await env.DB.prepare(`SELECT 1 ok FROM newsletter_suppressions WHERE project_id=? AND subscriber_id=? AND active=1 LIMIT 1`).bind(PROJECT_ID,subscriberId).first();
  if(suppressed)return {status:'skip',reason:'suppressed'};

  const articles=await latestDigestArticles(env,sub.language_code,5);
  if(articles.length<3)throw new Error('not_enough_public_articles');
  const digest=renderDigest({languageCode:sub.language_code,articles,unsubscribeToken:sub.unsubscribe_token});
  const sent=await sendBrevoEmail(env,{to:String(sub.email).trim().toLowerCase(),subject:digest.subject,htmlContent:digest.htmlContent,textContent:digest.textContent,replyTo:'wisequotesofworld@gmail.com'});
  await env.DB.prepare(`UPDATE newsletter_deliveries SET status='sent',provider_message_id=?,sent_at=?,error=NULL WHERE id=? AND project_id=?`).bind(sent.messageId||null,nowIso(),deliveryId,PROJECT_ID).run();
  await recordEvent(env,{subscriberId,deliveryId,eventType:'sent',providerEventId:sent.messageId||null,detail:'queue_consumer'});
  return {status:'sent'};
}

export default {
  async scheduled(_event,env,ctx){
    const jobId=`newsletter-producer-${crypto.randomUUID()}`,startedAt=nowIso();
    await recordJob(env,{jobId,jobType:'newsletter_producer',status:'running',startedAt});
    ctx.waitUntil((async()=>{
      try{const r=await enqueueDue(env);await recordJob(env,{jobId,jobType:'newsletter_producer',status:'succeeded',startedAt,finishedAt:nowIso(),processed:r.queued||0,success:r.queued||0,metadata:r});}
      catch(e){await recordJob(env,{jobId,jobType:'newsletter_producer',status:'failed',startedAt,finishedAt:nowIso(),failure:1,error:String(e?.message||e).slice(0,800)});throw e;}
    })());
  },

  async queue(batch,env){
    const jobId=`newsletter-consumer-${crypto.randomUUID()}`,startedAt=nowIso();let processed=0,success=0,failure=0;
    await recordJob(env,{jobId,jobType:'newsletter_consumer',status:'running',startedAt,attempt:1});
    for(const msg of batch.messages){
      processed++;
      try{
        const r=await consumeOne(env,msg);
        if(r.status==='sent')success++;
        msg.ack();
      }catch(e){
        failure++;
        const b=msg.body||{},deliveryId=Number(b.delivery_id),subscriberId=Number(b.subscriber_id),detail=String(e?.message||e).slice(0,500);
        if(Number.isInteger(deliveryId)&&deliveryId>0){try{await env.DB.prepare(`UPDATE newsletter_deliveries SET status='failed',error=? WHERE id=? AND project_id=? AND status<>'sent'`).bind(detail,deliveryId,PROJECT_ID).run()}catch{}}
        if(Number.isInteger(subscriberId)&&subscriberId>0)await recordEvent(env,{subscriberId,deliveryId:Number.isInteger(deliveryId)?deliveryId:null,eventType:'retry',detail});
        msg.retry();
      }
    }
    await recordJob(env,{jobId,jobType:'newsletter_consumer',status:failure?'retrying':'succeeded',startedAt,finishedAt:nowIso(),processed,success,failure});
  }
};
