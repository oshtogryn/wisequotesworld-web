import {latestDigestArticles,renderDigest} from './newsletter_digest.js';
import {sendBrevoEmail} from './brevo_newsletter.js';
import {requireAdmin} from './admin_auth.js';
import {json,clampInteger} from './http.js';
import {PROJECT_ID} from './project_config.js';

// Automated delivery remains OFF until a real Cron + Queue consumer is
// provisioned and verified. Admin "send now" remains an explicit manual action.
const DEFAULTS={enabled:0,cadence_days:14,daily_cap:300,run_hour_utc:8,execution_cap:40};
const DUMMY_DOMAINS=new Set(['example.invalid','example.com','example.org','example.net']);

function isDummyEmail(email){const domain=String(email||'').toLowerCase().split('@')[1]||'';return !domain||domain.endsWith('.invalid')||DUMMY_DOMAINS.has(domain)}
function maskEmail(email){const [l='',d='']=String(email||'').split('@');return l?`${l.slice(0,2)}***@${d}`:'***'}
function nowIso(){return new Date().toISOString()}
function cycleKey(cadenceDays,at=new Date()){
  const day=Math.floor(at.getTime()/86400000);
  return `${cadenceDays}d-${Math.floor(day/Math.max(1,cadenceDays))}`;
}

async function ensure(env){
  if(!env?.DB) throw new Error('db_unavailable');
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS newsletter_settings (
    project_id TEXT PRIMARY KEY,
    enabled INTEGER NOT NULL DEFAULT 0,
    cadence_days INTEGER NOT NULL DEFAULT 14,
    daily_cap INTEGER NOT NULL DEFAULT 300,
    run_hour_utc INTEGER NOT NULL DEFAULT 8,
    execution_cap INTEGER NOT NULL DEFAULT 40,
    last_run_at TEXT,
    updated_at TEXT NOT NULL
  )`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS newsletter_deliveries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT NOT NULL,
    subscriber_id INTEGER NOT NULL,
    cycle_key TEXT NOT NULL,
    language_code TEXT,
    email_masked TEXT,
    status TEXT NOT NULL,
    provider_message_id TEXT,
    error TEXT,
    sent_at TEXT,
    created_at TEXT NOT NULL,
    UNIQUE(project_id,subscriber_id,cycle_key)
  )`).run();
  const row=await env.DB.prepare('SELECT project_id FROM newsletter_settings WHERE project_id=?').bind(PROJECT_ID).first();
  if(!row){await env.DB.prepare(`INSERT INTO newsletter_settings(project_id,enabled,cadence_days,daily_cap,run_hour_utc,execution_cap,last_run_at,updated_at) VALUES(?,?,?,?,?,?,NULL,?)`).bind(PROJECT_ID,DEFAULTS.enabled,DEFAULTS.cadence_days,DEFAULTS.daily_cap,DEFAULTS.run_hour_utc,DEFAULTS.execution_cap,nowIso()).run();}
}

async function settings(env){await ensure(env);return await env.DB.prepare('SELECT * FROM newsletter_settings WHERE project_id=?').bind(PROJECT_ID).first();}

async function subscriberStats(env){
  const rows=(await env.DB.prepare(`SELECT rowid AS subscriber_id,email,language_code,status,updated_at FROM newsletter_subscribers WHERE project_id=? ORDER BY updated_at DESC LIMIT 500`).bind(PROJECT_ID).all()).results||[];
  const real=rows.filter(x=>!isDummyEmail(x.email));
  const active=real.filter(x=>x.status==='active');
  const byLanguage={};for(const x of active)byLanguage[x.language_code]=(byLanguage[x.language_code]||0)+1;
  return {total_real:real.length,active:active.length,inactive:real.length-active.length,by_language:byLanguage,recent:active.slice(0,30).map(x=>({subscriber_id:x.subscriber_id,email_masked:maskEmail(x.email),language:x.language_code,updated_at:x.updated_at||null}))};
}

async function dueSubscribers(env,s,limit){
  const key=cycleKey(Number(s.cadence_days)||14);
  // Suppressions table is introduced by migration11. If the schema has not
  // been promoted yet, fail closed rather than silently sending from an
  // incomplete asynchronous-newsletter architecture.
  let rows=[];
  try{
    rows=(await env.DB.prepare(`SELECT rowid AS subscriber_id,email,language_code,unsubscribe_token,updated_at FROM newsletter_subscribers n
      WHERE n.project_id=? AND n.status='active'
      AND NOT EXISTS (SELECT 1 FROM newsletter_suppressions s WHERE s.project_id=n.project_id AND s.subscriber_id=n.rowid AND s.active=1)
      AND NOT EXISTS (SELECT 1 FROM newsletter_deliveries d WHERE d.project_id=? AND d.subscriber_id=n.rowid AND d.cycle_key=? AND d.status IN ('reserved','sent'))
      ORDER BY n.updated_at ASC LIMIT ?`).bind(PROJECT_ID,PROJECT_ID,key,limit*3).all()).results||[];
  }catch(e){
    throw new Error(`newsletter_schema_not_ready:${String(e?.message||e)}`);
  }
  return {key,rows:rows.filter(x=>!isDummyEmail(x.email)).slice(0,limit)};
}

async function recordEvent(env,{subscriberId,deliveryId=null,eventType,provider='brevo',providerEventId=null,detail=null}){
  try{
    await env.DB.prepare(`INSERT INTO newsletter_events(project_id,subscriber_id,delivery_id,event_type,provider,provider_event_id,detail,occurred_at,created_at) VALUES(?,?,?,?,?,?,?,?,?)`).bind(PROJECT_ID,subscriberId,deliveryId,eventType,provider,providerEventId,detail,nowIso(),nowIso()).run();
  }catch{}
}

async function reserve(env,sub,key){
  try{
    const r=await env.DB.prepare(`INSERT INTO newsletter_deliveries(project_id,subscriber_id,cycle_key,language_code,email_masked,status,created_at) VALUES(?,?,?,?,?,'reserved',?) RETURNING id`).bind(PROJECT_ID,sub.subscriber_id,key,sub.language_code,maskEmail(sub.email),nowIso()).first();
    await recordEvent(env,{subscriberId:sub.subscriber_id,deliveryId:r?.id||null,eventType:'reserved'});
    return r?.id||true;
  }catch{return false}
}

export async function runNewsletterBatch(env,{force=false,source='admin'}={}){
  const s=await settings(env);if(!Number(s.enabled)&&!force)return {ok:true,skipped:'disabled'};
  const now=new Date();if(!force&&now.getUTCHours()<Number(s.run_hour_utc||0))return {ok:true,skipped:'before_run_hour'};
  if(!force&&s.last_run_at&&String(s.last_run_at).slice(0,10)===nowIso().slice(0,10))return {ok:true,skipped:'already_ran_today'};
  const cap=Math.max(1,Math.min(Number(s.execution_cap)||40,Number(s.daily_cap)||300,100));
  const {key,rows}=await dueSubscribers(env,s,cap);let sent=0,failed=0,skipped=0,errors=[];
  for(const sub of rows){
    const deliveryId=await reserve(env,sub,key);if(!deliveryId){skipped++;continue}
    try{
      const articles=await latestDigestArticles(env,sub.language_code,5);
      if(articles.length<3)throw new Error('not_enough_public_articles');
      const digest=renderDigest({languageCode:sub.language_code,articles,unsubscribeToken:sub.unsubscribe_token});
      const r=await sendBrevoEmail(env,{to:String(sub.email).trim().toLowerCase(),subject:digest.subject,htmlContent:digest.htmlContent,textContent:digest.textContent,replyTo:'wisequotesofworld@gmail.com'});
      await env.DB.prepare(`UPDATE newsletter_deliveries SET status='sent',provider_message_id=?,sent_at=? WHERE project_id=? AND subscriber_id=? AND cycle_key=?`).bind(r.messageId||null,nowIso(),PROJECT_ID,sub.subscriber_id,key).run();
      await recordEvent(env,{subscriberId:sub.subscriber_id,deliveryId:typeof deliveryId==='number'?deliveryId:null,eventType:'sent',providerEventId:r.messageId||null,detail:source});
      sent++;
    }catch(e){
      failed++;const msg=String(e?.message||e).slice(0,500);errors.push({subscriber_id:sub.subscriber_id,error:msg});
      await env.DB.prepare(`UPDATE newsletter_deliveries SET status='failed',error=? WHERE project_id=? AND subscriber_id=? AND cycle_key=?`).bind(msg,PROJECT_ID,sub.subscriber_id,key).run();
      await recordEvent(env,{subscriberId:sub.subscriber_id,deliveryId:typeof deliveryId==='number'?deliveryId:null,eventType:'failed',detail:msg});
    }
  }
  await env.DB.prepare('UPDATE newsletter_settings SET last_run_at=?,updated_at=? WHERE project_id=?').bind(nowIso(),nowIso(),PROJECT_ID).run();
  return {ok:failed===0,cycle_key:key,selected:rows.length,sent,failed,skipped,errors:errors.slice(0,10)};
}

// Legacy request-triggered execution is deliberately disabled. A normal page
// request must never become a newsletter cron surrogate.
export async function maybeRunNewsletterScheduler(){
  return {ok:true,skipped:'request_lifecycle_scheduler_disabled'};
}

export async function newsletterAdminApi(request,env){
  const u=new URL(request.url);if(!u.pathname.startsWith('/api/admin/newsletter'))return null;
  const denied=await requireAdmin(request,env);if(denied)return denied;
  try{
    if(u.pathname==='/api/admin/newsletter'&&request.method==='GET'){const [s,stats]=await Promise.all([settings(env),subscriberStats(env)]);const latest=(await env.DB.prepare(`SELECT cycle_key,status,COUNT(*) count,MAX(sent_at) last_sent_at FROM newsletter_deliveries WHERE project_id=? GROUP BY cycle_key,status ORDER BY MAX(created_at) DESC LIMIT 20`).bind(PROJECT_ID).all()).results||[];return json({ok:true,settings:s,subscribers:stats,deliveries:latest,request_lifecycle_scheduler:false,queue_required:true});}
    if(u.pathname==='/api/admin/newsletter/settings'&&request.method==='POST'){
      let b={};try{b=await request.json()}catch{return json({ok:false,error:'invalid_json'},400)}
      const enabled=b.enabled?1:0,cadence=clampInteger(b.cadence_days,1,90,14),daily=clampInteger(b.daily_cap,1,300,300),hour=clampInteger(b.run_hour_utc,0,23,8),exec=clampInteger(b.execution_cap,1,100,40);
      if(enabled&&!env?.NEWSLETTER_QUEUE)return json({ok:false,error:'queue_not_configured',message:'Automated newsletter cannot be enabled until NEWSLETTER_QUEUE is configured and verified.'},409);
      await ensure(env);await env.DB.prepare(`UPDATE newsletter_settings SET enabled=?,cadence_days=?,daily_cap=?,run_hour_utc=?,execution_cap=?,updated_at=? WHERE project_id=?`).bind(enabled,cadence,daily,hour,exec,nowIso(),PROJECT_ID).run();return json({ok:true,settings:await settings(env)});
    }
    if(u.pathname==='/api/admin/newsletter/send-now'&&request.method==='POST')return json(await runNewsletterBatch(env,{force:true,source:'admin_send_now'}));
    return json({ok:false,error:'not_found'},404);
  }catch(e){return json({ok:false,error:String(e?.message||e)},500)}
}
