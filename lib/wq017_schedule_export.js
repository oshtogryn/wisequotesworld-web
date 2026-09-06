const LANGS=['uk','ru','pl','en','sv','de','es','fr','it'];
const KEYS=['pinterest_prompt','facebook','instagram','threads','tiktok','youtube_title','youtube_description','pinterest_title','pinterest_description','article_url','website_reflection'];
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}})}
async function exportPack(env,id){
  const item=await env.DB.prepare(`SELECT id,status,author_name,attribution_status,quote_type FROM content_items WHERE project_id='wisequotesworld' AND id=?`).bind(id).first();
  const outs=(await env.DB.prepare(`SELECT language_code,output_key,output_text,status FROM content_outputs WHERE project_id='wisequotesworld' AND content_item_id=? AND language_code IN ('uk','ru','pl','en','sv','de','es','fr','it') ORDER BY language_code,output_key`).bind(id).all()).results||[];
  const vers=(await env.DB.prepare(`SELECT cv.language_code,cv.version,cv.adapted_text,cv.ai_prompt,cv.status FROM content_versions cv JOIN (SELECT language_code,MAX(version) v FROM content_versions WHERE content_id=? GROUP BY language_code) x ON x.language_code=cv.language_code AND x.v=cv.version WHERE cv.content_id=? ORDER BY cv.language_code`).bind(id,id).all()).results||[];
  const media=(await env.DB.prepare(`SELECT m.id,m.language_code,m.asset_type,m.mime_type,m.original_filename,m.created_at,COALESCE(r.qa_status,'pending') qa_status FROM media_inbox m LEFT JOIN media_reviews r ON r.media_inbox_id=m.id WHERE m.project_id='wisequotesworld' AND m.content_item_id=? ORDER BY m.language_code,m.created_at DESC`).bind(id).all()).results||[];
  const approval=await env.DB.prepare(`SELECT approval_scope,status,updated_at FROM content_approvals WHERE content_item_id=? AND approval_scope='content' AND language_code IS NULL ORDER BY id DESC LIMIT 1`).bind(id).first();
  const visibility=await env.DB.prepare(`SELECT approval_scope,status,updated_at FROM content_approvals WHERE content_item_id=? AND approval_scope='website_visibility' AND language_code IS NULL ORDER BY id DESC LIMIT 1`).bind(id).first();
  const pack={};
  for(const lang of LANGS){
    const v=vers.find(x=>x.language_code===lang)||null;
    pack[lang]={localized_quote:v?.adapted_text||null,video_prompt:v?.ai_prompt||null,version_status:v?.status||null,outputs:{}};
    for(const o of outs)if(o.language_code===lang&&KEYS.includes(o.output_key))pack[lang].outputs[o.output_key]=o.output_text;
  }
  return {ok:true,item,approval,visibility,pack,media:media.map(m=>({id:m.id,language:m.language_code,asset_type:m.asset_type,mime_type:m.mime_type,filename:m.original_filename,qa_status:m.qa_status,created_at:m.created_at}))};
}
export async function wq017ScheduleExport(request,env){
  const url=new URL(request.url);
  if(!env?.DB)return null;
  try{
    if(request.method==='GET'&&url.pathname==='/ops/export/wq017-9c7f4e2a')return json(await exportPack(env,'WQ017'));
    if(request.method==='GET'&&url.pathname==='/ops/export/wq018-4e8c7a19')return json(await exportPack(env,'WQ018'));
    if(request.method==='GET'&&url.pathname==='/ops/export/wq019-31f6c8aa')return json(await exportPack(env,'WQ019'));
    return null;
  }catch(e){return json({ok:false,error:String(e?.message||e)},500)}
}
