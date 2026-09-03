const PROJECT_ID='wisequotesworld';
const CONTENT_ID='WQ014';
export async function markWQ014Scheduled(env){
  if(!env?.DB)return {ok:false,error:'DB binding unavailable'};
  const ts=new Date().toISOString();
  const approval=await env.DB.prepare(`SELECT status FROM content_approvals WHERE content_item_id=? AND approval_scope='content' AND language_code IS NULL ORDER BY id DESC LIMIT 1`).bind(CONTENT_ID).first();
  if(approval?.status!=='approved')return {ok:false,error:'content is not approved',approval:approval?.status||null};
  await env.DB.prepare(`UPDATE content_items SET status='scheduled',updated_at=? WHERE project_id=? AND id=?`).bind(ts,PROJECT_ID,CONTENT_ID).run();
  await env.DB.prepare(`UPDATE content_versions SET status='scheduled' WHERE content_id=? AND version=1`).bind(CONTENT_ID).run();
  const item=await env.DB.prepare(`SELECT id,status,updated_at FROM content_items WHERE project_id=? AND id=?`).bind(PROJECT_ID,CONTENT_ID).first();
  const versions=(await env.DB.prepare(`SELECT language_code,status FROM content_versions WHERE content_id=? AND version=1 ORDER BY language_code`).bind(CONTENT_ID).all()).results||[];
  return {ok:true,item,versions};
}
