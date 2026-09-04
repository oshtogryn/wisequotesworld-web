const BREVO_BASE='https://api.brevo.com/v3';
const PROJECT_ID='wisequotesworld';

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}})}
function configured(env){return Boolean(env?.BREVO_API_KEY&&env?.BREVO_SENDER_EMAIL&&env?.BREVO_SENDER_NAME)}
function adminOk(request,env){
 const supplied=request.headers.get('x-admin-token')||request.headers.get('authorization')?.replace(/^Bearer\s+/i,'')||'';
 return Boolean(env?.ADMIN_TOKEN&&supplied&&supplied===env.ADMIN_TOKEN);
}
async function brevoFetch(env,path,init={}){
 if(!configured(env))throw new Error('brevo_not_configured');
 const headers=new Headers(init.headers||{});
 headers.set('accept','application/json');
 headers.set('api-key',env.BREVO_API_KEY);
 if(init.body&&!headers.has('content-type'))headers.set('content-type','application/json');
 return fetch(`${BREVO_BASE}${path}`,{...init,headers});
}
async function firstActiveSubscriber(env){
 if(!env?.DB)return null;
 return env.DB.prepare(`SELECT email,language_code,unsubscribe_token FROM newsletter_subscribers WHERE project_id=? AND status='active' ORDER BY updated_at ASC LIMIT 1`).bind(PROJECT_ID).first();
}

export async function sendBrevoEmail(env,{to,subject,htmlContent,textContent,replyTo}){
 const payload={
  sender:{name:env.BREVO_SENDER_NAME,email:env.BREVO_SENDER_EMAIL},
  to:[{email:to}],
  subject,
  htmlContent,
  ...(textContent?{textContent}:{}),
  ...(replyTo?{replyTo:{email:replyTo}}:{})
 };
 const r=await brevoFetch(env,'/smtp/email',{method:'POST',body:JSON.stringify(payload)});
 const body=await r.text();
 let data=null;try{data=body?JSON.parse(body):null}catch{data={raw:body}}
 if(!r.ok)throw new Error(`brevo_send_${r.status}:${body.slice(0,300)}`);
 return {status:r.status,messageId:data?.messageId||null};
}

export async function brevoNewsletterApi(request,env){
 const u=new URL(request.url);
 if(u.pathname==='/ops/readback/brevo-health.json'&&request.method==='GET'){
  const isConfigured=configured(env);
  if(!isConfigured)return json({ok:false,configured:false,provider:'brevo',sender_email:Boolean(env?.BREVO_SENDER_EMAIL),sender_name:Boolean(env?.BREVO_SENDER_NAME),api_key:Boolean(env?.BREVO_API_KEY)},503);
  try{
   const r=await brevoFetch(env,'/account',{method:'GET'});
   await r.text();
   return json({ok:r.ok,configured:true,provider:'brevo',provider_status:r.status,sender_email:env.BREVO_SENDER_EMAIL,sender_name:env.BREVO_SENDER_NAME,delivery_mode:'manual_test_ready_scheduler_disabled',cadence_days:14,daily_cap:300},r.ok?200:502);
  }catch(e){return json({ok:false,configured:true,provider:'brevo',error:String(e?.message||e)},502)}
 }
 if(u.pathname==='/ops/readback/brevo-test-status'&&request.method==='GET'){
  if(!adminOk(request,env))return json({ok:false,error:'unauthorized'},401);
  const sub=await firstActiveSubscriber(env);
  if(!sub)return json({ok:false,error:'active_subscriber_not_found'},404);
  try{
   const q=new URLSearchParams({email:String(sub.email),days:'1',limit:'20',sort:'desc'});
   const r=await brevoFetch(env,`/smtp/statistics/events?${q.toString()}`,{method:'GET'});
   const body=await r.text();
   let data={};try{data=body?JSON.parse(body):{}}catch{data={}}
   if(!r.ok)return json({ok:false,error:`brevo_events_${r.status}`},502);
   const events=(data.events||[]).slice(0,20).map(x=>({event:x.event||null,date:x.date||null,reason:x.reason||null,messageId:x.messageId||null,from:x.from||null}));
   return json({ok:true,language:sub.language_code,event_count:events.length,events});
  }catch(e){return json({ok:false,error:String(e?.message||e)},502)}
 }
 if(u.pathname==='/ops/run/brevo-test'&&request.method==='POST'){
  if(!adminOk(request,env))return json({ok:false,error:'unauthorized'},401);
  if(!env?.DB)return json({ok:false,error:'db_unavailable'},503);
  let data={};try{data=await request.json()}catch{return json({ok:false,error:'invalid_json'},400)}
  const email=String(data.email||'').trim().toLowerCase();
  if(email&&(email.length>254||!/^\S+@\S+\.\S+$/.test(email)))return json({ok:false,error:'invalid_email'},400);
  const sub=email
   ? await env.DB.prepare(`SELECT email,language_code,unsubscribe_token FROM newsletter_subscribers WHERE project_id=? AND email=? AND status='active' ORDER BY updated_at DESC LIMIT 1`).bind(PROJECT_ID,email).first()
   : await firstActiveSubscriber(env);
  if(!sub)return json({ok:false,error:'active_subscriber_not_found'},404);
  const recipient=String(sub.email||'').trim().toLowerCase();
  const unsubscribe=`https://wisequotesworld.com/newsletter/unsubscribe?token=${encodeURIComponent(sub.unsubscribe_token)}`;
  const isUk=String(sub.language_code)==='uk';
  const subject=isUk?'Wise Quotes World — тест розсилки':'Wise Quotes World — Brevo test';
  const headline=isUk?'Тестова розсилка працює':'Newsletter delivery works';
  const intro=isUk?'Це перший тестовий лист Wise Quotes World через Brevo. Домен, DKIM, DMARC і відправник підключені успішно.':'Brevo delivery is connected successfully.';
  const openText=isUk?'Відкрити Wise Quotes World':'Open Wise Quotes World';
  const unsubText=isUk?'Відписатися':'Unsubscribe';
  const htmlContent=`<!doctype html><html><body style="margin:0;background:#0b0d12;color:#f5f2ea;font-family:Arial,sans-serif;padding:30px 16px"><div style="max-width:620px;margin:auto;background:#151821;border:1px solid #5f5133;border-radius:18px;padding:30px"><div style="font-size:28px;font-weight:700;color:#e4c576;margin-bottom:22px">Wise Quotes World</div><h1 style="font-size:24px;line-height:1.3;margin:0 0 16px">${headline}</h1><p style="font-size:16px;line-height:1.65;color:#d6d3cb">${intro}</p><p style="margin:28px 0"><a href="https://wisequotesworld.com/${String(sub.language_code)}/" style="display:inline-block;background:#e4c576;color:#111;text-decoration:none;padding:13px 20px;border-radius:10px;font-weight:700">${openText}</a></p><hr style="border:0;border-top:1px solid #333;margin:28px 0 18px"><p style="font-size:12px;color:#999;margin:0"><a href="${unsubscribe}" style="color:#aaa">${unsubText}</a></p></div></body></html>`;
  try{
   const sent=await sendBrevoEmail(env,{to:recipient,subject,htmlContent,textContent:`${headline}\n\n${intro}\n\nhttps://wisequotesworld.com/${String(sub.language_code)}/\n\n${unsubText}: ${unsubscribe}`,replyTo:'wisequotesofworld@gmail.com'});
   return json({ok:true,provider:'brevo',language:sub.language_code,...sent});
  }catch(e){return json({ok:false,error:String(e?.message||e)},502)}
 }
 return null;
}
