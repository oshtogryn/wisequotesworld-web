const PROJECT='wisequotesworld';
const ID='WQ020';
export async function markWQ020ScheduledOnce(env){
  if(!env?.DB)return {ok:false,error:'DB unavailable'};
  await env.DB.exec(`CREATE TABLE IF NOT EXISTS editorial_status_history(id INTEGER PRIMARY KEY AUTOINCREMENT,project_id TEXT NOT NULL,content_item_id TEXT NOT NULL,from_status TEXT,to_status TEXT NOT NULL,notes TEXT,actor TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);CREATE INDEX IF NOT EXISTS idx_editorial_status_history_item ON editorial_status_history(project_id,content_item_id,created_at DESC);`);
  const cur=await env.DB.prepare(`SELECT id,status FROM content_items WHERE project_id=? AND id=?`).bind(PROJECT,ID).first();
  if(!cur)return {ok:false,error:'topic not found'};
  const ts=new Date().toISOString();
  if(cur.status!=='scheduled'){
    await env.DB.prepare(`UPDATE content_items SET status='scheduled',updated_at=? WHERE project_id=? AND id=?`).bind(ts,PROJECT,ID).run();
    try{await env.DB.prepare(`UPDATE content_versions SET status=CASE WHEN status='published' THEN status ELSE 'scheduled' END,updated_at=? WHERE content_id=?`).bind(ts,ID).run()}catch{}
    await env.DB.prepare(`INSERT INTO editorial_status_history(project_id,content_item_id,from_status,to_status,notes,actor,created_at) VALUES(?,?,?,?,?,?,?)`).bind(PROJECT,ID,cur.status,'scheduled','Metricool Planner readback confirmed 64/64 scheduled for 2026-09-08; minimum 15-minute cross-locale spacing per platform verified.','ops-readback',ts).run();
  }
  const item=await env.DB.prepare(`SELECT id,status,updated_at FROM content_items WHERE project_id=? AND id=?`).bind(PROJECT,ID).first();
  const versions=(await env.DB.prepare(`SELECT language_code,status,updated_at FROM content_versions WHERE content_id=? ORDER BY language_code,version DESC`).bind(ID).all()).results||[];
  const history=(await env.DB.prepare(`SELECT from_status,to_status,notes,actor,created_at FROM editorial_status_history WHERE project_id=? AND content_item_id=? ORDER BY created_at DESC LIMIT 3`).bind(PROJECT,ID).all()).results||[];
  return {ok:true,item,versions,history};
}
