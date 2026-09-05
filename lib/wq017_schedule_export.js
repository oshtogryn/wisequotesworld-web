const LANGS=['uk','ru','pl','en','sv','de','es','fr'];
const KEYS=['facebook','instagram','threads','tiktok','youtube_title','youtube_description','pinterest_title','pinterest_description','article_url'];
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}})}
export async function wq017ScheduleExport(request,env){
  const url=new URL(request.url);
  if(url.pathname!=='/ops/export/wq017-9c7f4e2a')return null;
  if(!env?.DB)return json({ok:false,error:'DB unavailable'},503);
  try{
    const item=await env.DB.prepare(`SELECT id,status,author_name,attribution_status,quote_type FROM content_items WHERE project_id='wisequotesworld' AND id='WQ017'`).first();
    const outs=(await env.DB.prepare(`SELECT language_code,output_key,output_text FROM content_outputs WHERE project_id='wisequotesworld' AND content_item_id='WQ017' AND language_code IN ('uk','ru','pl','en','sv','de','es','fr') ORDER BY language_code,output_key`).all()).results||[];
    const media=(await env.DB.prepare(`SELECT m.id,m.language_code,m.asset_type,m.mime_type,m.original_filename,m.created_at,COALESCE(r.qa_status,'pending') qa_status FROM media_inbox m LEFT JOIN media_reviews r ON r.media_inbox_id=m.id WHERE m.project_id='wisequotesworld' AND m.content_item_id='WQ017' ORDER BY m.language_code,m.created_at DESC`).all()).results||[];
    const approval=await env.DB.prepare(`SELECT approval_scope,status,updated_at FROM content_approvals WHERE content_item_id='WQ017' AND approval_scope='content' AND language_code IS NULL ORDER BY id DESC LIMIT 1`).first();
    const pack={};
    for(const lang of LANGS){
      pack[lang]={outputs:{},video_url:`https://wisequotesworld.com/media/approved/WQ017/${lang}/video.mov`,pinterest_url:`https://wisequotesworld.com/media/approved/WQ017/${lang}/pinterest.png`};
      for(const o of outs)if(o.language_code===lang&&KEYS.includes(o.output_key))pack[lang].outputs[o.output_key]=o.output_text;
    }
    return json({ok:true,item,approval,pack,media:media.map(m=>({id:m.id,language:m.language_code,asset_type:m.asset_type,mime_type:m.mime_type,filename:m.original_filename,qa_status:m.qa_status,created_at:m.created_at}))});
  }catch(e){return json({ok:false,error:String(e?.message||e)},500)}
}
