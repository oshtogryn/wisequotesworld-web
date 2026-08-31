const PROJECT='wisequotesworld',ID='WQ013';
export async function finalizeWQ013Production(env){
  if(!env?.DB)return;
  const ts=new Date().toISOString();
  const existing=await env.DB.prepare(`SELECT id,status FROM content_approvals WHERE project_id=? AND content_item_id=? AND approval_scope='content' AND language_code IS NULL ORDER BY id DESC LIMIT 1`).bind(PROJECT,ID).first();
  if(existing){
    if(existing.status!=='approved')await env.DB.prepare(`UPDATE content_approvals SET status='approved',notes=?,updated_at=? WHERE id=?`).bind('Final 8-language copy, source, site and media package approved for Metricool scheduling',ts,existing.id).run();
  }else{
    await env.DB.prepare(`INSERT INTO content_approvals(project_id,content_item_id,approval_scope,language_code,status,notes,updated_at) VALUES(?,?,?,?,?,?,?)`).bind(PROJECT,ID,'content',null,'approved','Final 8-language copy, source, site and media package approved for Metricool scheduling',ts).run();
  }
  await env.DB.prepare(`UPDATE content_items SET status='approved',approved_at=COALESCE(approved_at,?),updated_at=? WHERE project_id=? AND id=?`).bind(ts,ts,PROJECT,ID).run();
}
