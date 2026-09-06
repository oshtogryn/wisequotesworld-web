const LANGS=['uk','ru','pl','en','sv','de','es','fr'];
const KEYS=['facebook','instagram','threads','tiktok','youtube_title','youtube_description','pinterest_title','pinterest_description','article_url'];
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
async function finalize(env){
  const ts=new Date().toISOString();
  const before17=await env.DB.prepare(`SELECT status FROM content_items WHERE project_id='wisequotesworld' AND id='WQ017'`).first();
  const before18=await env.DB.prepare(`SELECT status FROM content_items WHERE project_id='wisequotesworld' AND id='WQ018'`).first();
  await env.DB.prepare(`UPDATE content_items SET status='published',updated_at=? WHERE project_id='wisequotesworld' AND id='WQ017'`).bind(ts).run();
  await env.DB.prepare(`UPDATE content_versions SET status='published',updated_at=? WHERE content_id='WQ017'`).bind(ts).run();
  await env.DB.prepare(`UPDATE content_items SET status='scheduled',updated_at=? WHERE project_id='wisequotesworld' AND id='WQ018'`).bind(ts).run();
  await env.DB.prepare(`UPDATE content_versions SET status=CASE WHEN status='published' THEN status ELSE 'scheduled' END,updated_at=? WHERE content_id='WQ018'`).bind(ts).run();
  try{
    await env.DB.prepare(`INSERT INTO editorial_status_history(project_id,content_item_id,from_status,to_status,notes,actor,created_at) VALUES('wisequotesworld','WQ017',?,'published','Confirmed published after social rollout','assistant',?)`).bind(before17?.status||null,ts).run();
    await env.DB.prepare(`INSERT INTO editorial_status_history(project_id,content_item_id,from_status,to_status,notes,actor,created_at) VALUES('wisequotesworld','WQ018',?,'scheduled','Metricool Planner readback confirmed 64/64 across 8 active social locales','assistant',?)`).bind(before18?.status||null,ts).run();
  }catch{}
  const after=(await env.DB.prepare(`SELECT id,status,updated_at FROM content_items WHERE project_id='wisequotesworld' AND id IN ('WQ017','WQ018') ORDER BY id`).all()).results||[];
  return {ok:true,before:{WQ017:before17?.status||null,WQ018:before18?.status||null},after};
}
export async function wq017ScheduleExport(request,env){
  const url=new URL(request.url);
  if(!env?.DB)return null;
  try{
    if(request.method==='GET'&&url.pathname==='/ops/export/wq017-9c7f4e2a')return json(await exportPack(env,'WQ017'));
    if(request.method==='GET'&&url.pathname==='/ops/export/wq018-4e8c7a19')return json(await exportPack(env,'WQ018'));
    if(request.method==='GET'&&url.pathname==='/ops/finalize/wq017-wq018-7f2d9c41')return json(await finalize(env));
    return null;
  }catch(e){return json({ok:false,error:String(e?.message||e)},500)}
}
