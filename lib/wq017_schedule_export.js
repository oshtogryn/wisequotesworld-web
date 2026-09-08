const LANGS=['uk','ru','pl','en','sv','de','es','fr'];
const ALL13=['uk','ru','pl','en','sv','de','es','fr','it','pt','id','tr','ar'];
const KEYS=['facebook','instagram','threads','threads_1','threads_2','threads_3','tiktok','youtube_title','youtube_description','pinterest_title','pinterest_description','article_url'];
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}})}
async function exportPack(env,id){
  const item=await env.DB.prepare(`SELECT id,status,author_name,attribution_status,quote_type FROM content_items WHERE project_id='wisequotesworld' AND id=?`).bind(id).first();
  const outs=(await env.DB.prepare(`SELECT language_code,output_key,output_text FROM content_outputs WHERE project_id='wisequotesworld' AND content_item_id=? AND language_code IN ('uk','ru','pl','en','sv','de','es','fr') ORDER BY language_code,output_key`).bind(id).all()).results||[];
  const media=(await env.DB.prepare(`SELECT m.id,m.language_code,m.asset_type,m.mime_type,m.original_filename,m.created_at,COALESCE(r.qa_status,'pending') qa_status FROM media_inbox m LEFT JOIN media_reviews r ON r.media_inbox_id=m.id WHERE m.project_id='wisequotesworld' AND m.content_item_id=? ORDER BY m.language_code,m.created_at DESC`).bind(id).all()).results||[];
  const approval=await env.DB.prepare(`SELECT approval_scope,status,updated_at FROM content_approvals WHERE content_item_id=? AND approval_scope='content' AND language_code IS NULL ORDER BY id DESC LIMIT 1`).bind(id).first();
  const visibility=await env.DB.prepare(`SELECT approval_scope,status,updated_at FROM content_approvals WHERE content_item_id=? AND approval_scope='website_visibility' AND language_code IS NULL ORDER BY id DESC LIMIT 1`).bind(id).first();
  const pack={};
  for(const lang of LANGS){
    pack[lang]={outputs:{},video_url:`https://wisequotesworld.com/media/approved/${id}/${lang}/video.mov`,pinterest_url:`https://wisequotesworld.com/media/approved/${id}/${lang}/pinterest.png`};
    for(const o of outs)if(o.language_code===lang&&KEYS.includes(o.output_key))pack[lang].outputs[o.output_key]=o.output_text;
  }
  return {ok:true,item,approval,visibility,pack,media:media.map(m=>({id:m.id,language:m.language_code,asset_type:m.asset_type,mime_type:m.mime_type,filename:m.original_filename,qa_status:m.qa_status,created_at:m.created_at}))};
}
async function exportWQ020(env){
  const base=await exportPack(env,'WQ020');
  const versions=(await env.DB.prepare(`SELECT cv.language_code,cv.adapted_text,cv.voiceover_text,cv.on_screen_text,cv.language_check_status FROM content_versions cv JOIN (SELECT content_id,language_code,MAX(version) v FROM content_versions WHERE content_id='WQ020' GROUP BY content_id,language_code) x ON x.content_id=cv.content_id AND x.language_code=cv.language_code AND x.v=cv.version ORDER BY cv.language_code`).all()).results||[];
  const pages=(await env.DB.prepare(`SELECT language_code,slug,status,canonical_path,LENGTH(COALESCE(reflection_body,'')) reflection_chars FROM quote_pages WHERE project_id='wisequotesworld' AND content_item_id='WQ020' ORDER BY language_code`).all()).results||[];
  return {...base,versions:versions.filter(x=>ALL13.includes(x.language_code)),pages};
}
export async function wq017ScheduleExport(request,env){
  const url=new URL(request.url);
  if(!env?.DB)return null;
  try{
    if(request.method==='GET'&&url.pathname==='/ops/export/wq017-9c7f4e2a')return json(await exportPack(env,'WQ017'));
    if(request.method==='GET'&&url.pathname==='/ops/export/wq018-4e8c7a19')return json(await exportPack(env,'WQ018'));
    if(request.method==='GET'&&url.pathname==='/ops/export/wq019-7f1d2c6b')return json(await exportPack(env,'WQ019'));
    if(request.method==='GET'&&url.pathname==='/ops/export/wq020-5a9e31c7')return json(await exportWQ020(env));
    return null;
  }catch(e){return json({ok:false,error:String(e?.message||e)},500)}
}
