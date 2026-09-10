const PROJECT='wisequotesworld';
const DEFAULT_TIMEZONE='Europe/Stockholm';

function nowIso(){return new Date().toISOString()}
function parseIso(v){const d=new Date(String(v||''));return Number.isFinite(d.getTime())?d:null}

export async function ensureWebsiteSchedule(env){
  if(!env?.DB)throw new Error('DB unavailable');
  await env.DB.exec(`CREATE TABLE IF NOT EXISTS website_publication_schedule(
    content_item_id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    scheduled_for TEXT NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'Europe/Stockholm',
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled','released','cancelled')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    released_at TEXT,
    last_error TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_website_publication_schedule_due
    ON website_publication_schedule(project_id,status,scheduled_for);`);
}

export async function getWebsiteSchedule(env,id){
  await ensureWebsiteSchedule(env);
  return env.DB.prepare(`SELECT content_item_id,scheduled_for,timezone,status,created_at,updated_at,released_at,last_error FROM website_publication_schedule WHERE project_id=? AND content_item_id=?`).bind(PROJECT,id).first();
}

export async function scheduleWebsitePublication(env,id,scheduledFor,timezone=DEFAULT_TIMEZONE){
  await ensureWebsiteSchedule(env);
  const d=parseIso(scheduledFor);
  if(!d)throw new Error('invalid scheduled_for');
  if(d.getTime()<=Date.now()+15000)throw new Error('scheduled_for must be in the future');
  const ts=nowIso();
  await env.DB.prepare(`INSERT INTO website_publication_schedule(content_item_id,project_id,scheduled_for,timezone,status,created_at,updated_at,released_at,last_error)
    VALUES(?,?,?,?, 'scheduled',?,?,NULL,NULL)
    ON CONFLICT(content_item_id) DO UPDATE SET scheduled_for=excluded.scheduled_for,timezone=excluded.timezone,status='scheduled',updated_at=excluded.updated_at,released_at=NULL,last_error=NULL`)
    .bind(id,PROJECT,d.toISOString(),String(timezone||DEFAULT_TIMEZONE),ts,ts).run();
  return getWebsiteSchedule(env,id);
}

export async function cancelWebsitePublication(env,id){
  await ensureWebsiteSchedule(env);
  const ts=nowIso();
  await env.DB.prepare(`UPDATE website_publication_schedule SET status='cancelled',updated_at=?,last_error=NULL WHERE project_id=? AND content_item_id=? AND status='scheduled'`).bind(ts,PROJECT,id).run();
  return getWebsiteSchedule(env,id);
}

export async function markWebsiteScheduleReleased(env,id,ts=nowIso()){
  await ensureWebsiteSchedule(env);
  await env.DB.prepare(`UPDATE website_publication_schedule SET status='released',updated_at=?,released_at=?,last_error=NULL WHERE project_id=? AND content_item_id=?`).bind(ts,ts,PROJECT,id).run();
}

async function approveVisibility(env,id,ts,note){
  const row=await env.DB.prepare(`SELECT id FROM content_approvals WHERE content_item_id=? AND approval_scope='website_visibility' AND language_code IS NULL ORDER BY id DESC LIMIT 1`).bind(id).first();
  if(row){
    await env.DB.prepare(`UPDATE content_approvals SET status='approved',approved_by='scheduler',notes=?,updated_at=? WHERE id=?`).bind(note,ts,row.id).run();
  }else{
    await env.DB.prepare(`INSERT INTO content_approvals(project_id,content_item_id,approval_scope,language_code,status,approved_by,notes,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)`).bind(PROJECT,id,'website_visibility',null,'approved','scheduler',note,ts,ts).run();
  }
}

export async function releaseDueWebsitePublications(env,limit=20){
  if(!env?.DB)return{released:[],blocked:[],checked:0};
  await ensureWebsiteSchedule(env);
  const ts=nowIso();
  const rows=(await env.DB.prepare(`SELECT content_item_id,scheduled_for,timezone FROM website_publication_schedule WHERE project_id=? AND status='scheduled' AND scheduled_for<=? ORDER BY scheduled_for LIMIT ?`).bind(PROJECT,ts,Math.max(1,Math.min(100,Number(limit)||20))).all()).results||[];
  const released=[],blocked=[];
  for(const row of rows){
    const id=row.content_item_id;
    const pages=await env.DB.prepare(`SELECT COUNT(*) n FROM quote_pages WHERE project_id=? AND content_item_id=? AND status='published'`).bind(PROJECT,id).first();
    if(Number(pages?.n||0)<13){
      const error=`website package incomplete: ${Number(pages?.n||0)}/13 published pages`;
      await env.DB.prepare(`UPDATE website_publication_schedule SET last_error=?,updated_at=? WHERE project_id=? AND content_item_id=?`).bind(error,ts,PROJECT,id).run();
      blocked.push({id,error});
      continue;
    }
    await approveVisibility(env,id,ts,`Editorial website visibility automatically released at scheduled time ${row.scheduled_for} (${row.timezone||DEFAULT_TIMEZONE}).`);
    await markWebsiteScheduleReleased(env,id,ts);
    released.push(id);
  }
  return{released,blocked,checked:rows.length,at:ts};
}
