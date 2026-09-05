export async function wq017ScheduleExport(request,env){
  const url=new URL(request.url);
  if(url.pathname!=='/ops/export/wq017-9c7f4e2a')return null;
  if(!env?.DB)return new Response(JSON.stringify({ok:false,error:'DB unavailable'}),{status:503,headers:{'content-type':'application/json'}});
  const q=async(sql,...args)=>(await env.DB.prepare(sql).bind(...args).all()).results||[];
  try{
    const [item,versions,outputs,pages,media,reviews,approvals]=await Promise.all([
      q(`SELECT * FROM content_items WHERE project_id='wisequotesworld' AND id='WQ017'`),
      q(`SELECT * FROM content_versions WHERE content_id='WQ017' ORDER BY language_code, version DESC`),
      q(`SELECT * FROM content_outputs WHERE project_id='wisequotesworld' AND content_item_id='WQ017' ORDER BY language_code, output_key`),
      q(`SELECT * FROM quote_pages WHERE project_id='wisequotesworld' AND content_item_id='WQ017' ORDER BY language_code`),
      q(`SELECT * FROM media_inbox WHERE project_id='wisequotesworld' AND content_item_id='WQ017' ORDER BY language_code, created_at DESC`),
      q(`SELECT r.* FROM media_reviews r JOIN media_inbox m ON m.id=r.media_inbox_id WHERE m.project_id='wisequotesworld' AND m.content_item_id='WQ017' ORDER BY r.reviewed_at DESC`),
      q(`SELECT * FROM content_approvals WHERE content_item_id='WQ017' ORDER BY updated_at DESC`)
    ]);
    return new Response(JSON.stringify({ok:true,item,versions,outputs,pages,media,reviews,approvals}),{headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
  }catch(e){return new Response(JSON.stringify({ok:false,error:String(e?.message||e)}),{status:500,headers:{'content-type':'application/json'}})}
}
