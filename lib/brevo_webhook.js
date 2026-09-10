import {json} from './http.js';
import {PROJECT_ID} from './project_config.js';

function nowIso(){return new Date().toISOString()}
function normalizeEvent(v){
  const e=String(v||'').trim().toLowerCase().replace(/[^a-z]/g,'');
  if(e==='hardbounce')return'hard_bounce';
  if(e==='softbounce')return'soft_bounce';
  if(e==='spam')return'complaint';
  if(e==='unsubscribed')return'unsubscribe';
  if(e==='delivered')return'delivered';
  if(e==='sent'||e==='request')return'sent';
  if(e==='invalid'||e==='blocked')return'failed';
  return null;
}
function bearer(request){return request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]||''}
async function digest(v){return new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(v||''))))}
async function safeEqual(a,b){if(!a||!b)return false;const [x,y]=await Promise.all([digest(a),digest(b)]);if(x.length!==y.length)return false;let d=0;for(let i=0;i<x.length;i++)d|=x[i]^y[i];return d===0}
function providerEventId(payload,event){const mid=String(payload['message-id']||payload.messageId||payload.message_id||'').slice(0,180);const ts=String(payload.ts_event||payload.ts_epoch||payload.ts||'').slice(0,40);return [event,mid,ts].filter(Boolean).join(':').slice(0,255)||null}

async function processEvent(env,payload){
  const event=normalizeEvent(payload.event);if(!event)return{ok:true,ignored:true,event:String(payload.event||'')};
  const email=String(payload.email||'').trim().toLowerCase();if(!email)return{ok:false,error:'missing_email'};
  const sub=await env.DB.prepare(`SELECT rowid AS subscriber_id,status FROM newsletter_subscribers WHERE project_id=? AND lower(email)=? ORDER BY updated_at DESC LIMIT 1`).bind(PROJECT_ID,email).first();
  if(!sub)return{ok:true,ignored:true,reason:'subscriber_not_found'};
  const pid=providerEventId(payload,event),detail=String(payload.reason||payload.subject||'').slice(0,500)||null;
  try{
    await env.DB.prepare(`INSERT OR IGNORE INTO newsletter_events(project_id,subscriber_id,delivery_id,event_type,provider,provider_event_id,detail,occurred_at,created_at) VALUES(?,?,NULL,?,'brevo',?,?,?,?)`).bind(PROJECT_ID,sub.subscriber_id,event,pid,detail,nowIso(),nowIso()).run();
  }catch{}

  const suppressionReason=event==='hard_bounce'?'hard_bounce':event==='complaint'?'complaint':event==='unsubscribe'?'unsubscribe':null;
  if(suppressionReason){
    await env.DB.prepare(`INSERT INTO newsletter_suppressions(project_id,subscriber_id,reason,provider,provider_event_id,active,created_at,notes) VALUES(?,?,?,'brevo',?,1,?,?)
      ON CONFLICT(project_id,subscriber_id,reason) DO UPDATE SET provider='brevo',provider_event_id=excluded.provider_event_id,active=1,cleared_at=NULL,notes=excluded.notes`).bind(PROJECT_ID,sub.subscriber_id,suppressionReason,pid,nowIso(),detail).run();
    await env.DB.prepare(`UPDATE newsletter_subscribers SET status='inactive',updated_at=? WHERE project_id=? AND rowid=?`).bind(nowIso(),PROJECT_ID,sub.subscriber_id).run();
  }
  return{ok:true,event,subscriber_id:sub.subscriber_id,suppressed:!!suppressionReason};
}

export async function brevoWebhookApi(request,env){
  const u=new URL(request.url);if(u.pathname!=='/api/webhooks/brevo')return null;
  if(request.method!=='POST')return json({ok:false,error:'method_not_allowed'},405,{allow:'POST'});
  if(!env?.DB)return json({ok:false,error:'db_unavailable'},503);
  const expected=String(env?.BREVO_WEBHOOK_TOKEN||'');
  if(!expected||!await safeEqual(bearer(request),expected))return json({ok:false,error:'unauthorized'},401);
  let body;try{body=await request.json()}catch{return json({ok:false,error:'invalid_json'},400)}
  const events=Array.isArray(body)?body:[body],results=[];
  for(const payload of events)results.push(await processEvent(env,payload||{}));
  return json({ok:results.every(x=>x.ok!==false),processed:results.length,results});
}
