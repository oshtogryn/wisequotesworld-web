const PROJECT='wisequotesworld',ID='WQ013';
export async function finalizeWQ013Production(env){
  if(!env?.DB)return;
  const ts=new Date().toISOString();
  const existing=await env.DB.prepare(`SELECT id,status FROM content_approvals WHERE project_id=? AND content_item_id=? AND approval_scope='content' AND language_code IS NULL ORDER BY id DESC LIMIT 1`).bind(PROJECT,ID).first();
  if(existing){
    if(existing.status!=='approved')await env.DB.prepare(`UPDATE content_approvals SET status='approved',notes=?,updated_at=? WHERE id=?`).bind('Final 8-language copy, source, site and media package approved; Metricool Planner readback confirmed 64/64 scheduled for 2026-09-01',ts,existing.id).run();
  }else{
    await env.DB.prepare(`INSERT INTO content_approvals(project_id,content_item_id,approval_scope,language_code,status,notes,updated_at) VALUES(?,?,?,?,?,?,?)`).bind(PROJECT,ID,'content',null,'approved','Final 8-language copy, source, site and media package approved; Metricool Planner readback confirmed 64/64 scheduled for 2026-09-01',ts).run();
  }
  await env.DB.prepare(`UPDATE content_items SET status='published',updated_at=? WHERE project_id=? AND sequence_no<13 AND status<>'published'`).bind(ts,PROJECT).run();
  await env.DB.prepare(`UPDATE quote_pages SET status='published',published_at=COALESCE(published_at,?),updated_at=? WHERE project_id=? AND content_item_id IN (SELECT id FROM content_items WHERE project_id=? AND sequence_no<13) AND status<>'published'`).bind(ts,ts,PROJECT,PROJECT).run();
  await env.DB.prepare(`UPDATE content_items SET status='scheduled',approved_at=COALESCE(approved_at,?),updated_at=? WHERE project_id=? AND id=?`).bind(ts,ts,PROJECT,ID).run();
}
