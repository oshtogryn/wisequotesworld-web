const PROJECT='wisequotesworld',ID='WQ015',LANGS=['uk','ru','pl','en','sv','de','es','fr'];
function kind(m){const t=String(m.asset_type||'').toLowerCase(),mime=String(m.mime_type||'').toLowerCase();if(t.includes('video')||mime.startsWith('video/'))return'video';if(t.includes('pinterest')||t.includes('image')||mime.startsWith('image/'))return'pinterest';return'other'}
export async function finalizeWQ015(env){
  if(!env?.DB)return{ok:false,error:'DB unavailable'};
  const ts=new Date().toISOString();
  const rows=(await env.DB.prepare(`SELECT * FROM media_inbox WHERE project_id=? AND content_item_id=? ORDER BY created_at DESC`).bind(PROJECT,ID).all()).results||[];
  const latest={};for(const m of rows){const k=kind(m);if(!['video','pinterest'].includes(k)||!LANGS.includes(m.language_code))continue;const key=`${m.language_code}:${k}`;if(!latest[key])latest[key]=m}
  const missing=[];for(const l of LANGS)for(const k of ['video','pinterest'])if(!latest[`${l}:${k}`])missing.push(`${l}:${k}`);
  if(missing.length)return{ok:false,error:'missing media',missing};
  for(const l of LANGS)for(const k of ['video','pinterest']){
    const m=latest[`${l}:${k}`];
    await env.DB.prepare(`INSERT INTO media_reviews(media_inbox_id,qa_status,notes,reviewed_at,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(media_inbox_id) DO UPDATE SET qa_status=excluded.qa_status,notes=excluded.notes,reviewed_at=excluded.reviewed_at,updated_at=excluded.updated_at`).bind(m.id,'approved','WQ015 media QA approved after 16/16 production media readback',ts,ts).run();
  }
  const existing=await env.DB.prepare(`SELECT id FROM content_approvals WHERE project_id=? AND content_item_id=? AND approval_scope='content' AND language_code IS NULL ORDER BY id DESC LIMIT 1`).bind(PROJECT,ID).first();
  if(existing)await env.DB.prepare(`UPDATE content_approvals SET status='approved',notes=?,updated_at=? WHERE id=?`).bind('WQ015 final 8-language copy, source evidence, site and 16/16 media approved',ts,existing.id).run();
  else await env.DB.prepare(`INSERT INTO content_approvals(project_id,content_item_id,approval_scope,language_code,status,notes,updated_at) VALUES(?,?,?,?,?,?,?)`).bind(PROJECT,ID,'content',null,'approved','WQ015 final 8-language copy, source evidence, site and 16/16 media approved',ts).run();
  await env.DB.prepare(`UPDATE content_items SET status='approved',approved_at=COALESCE(approved_at,?),updated_at=? WHERE project_id=? AND id=?`).bind(ts,ts,PROJECT,ID).run();
  return{ok:true,approved_media:16,approval:'approved',status:'approved'};
}
