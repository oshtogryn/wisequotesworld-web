const PROJECT_ID='wisequotesworld';
const CONTENT_ID='WQ014';
const LANGS=['uk','ru','pl','en','sv','de','es','fr'];
const SOURCE_URL='https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.01.0169%3Atext%3DApol.%3Asection%3D38a';
const ORIGINAL='ὁ δὲ ἀνεξέταστος βίος οὐ βιωτὸς ἀνθρώπῳ';
function now(){return new Date().toISOString()}
function kind(m){const t=String(m.asset_type||'').toLowerCase(),mime=String(m.mime_type||'').toLowerCase();if(t.includes('video')||mime.startsWith('video/'))return'video';if(t.includes('pinterest')||t.includes('image')||mime.startsWith('image/'))return'pinterest';return'other'}
export async function finalizeWQ014(env){
 if(!env?.DB)return {ok:false,error:'DB binding unavailable'};
 const item=await env.DB.prepare(`SELECT * FROM content_items WHERE project_id=? AND id=?`).bind(PROJECT_ID,CONTENT_ID).first();
 if(!item)return {ok:false,error:'content not found'};
 const ts=now();
 let ev=await env.DB.prepare(`SELECT id FROM quote_source_evidence WHERE content_item_id=? AND verified=1 AND TRIM(COALESCE(original_text,''))<>'' AND TRIM(COALESCE(original_language,''))<>'' AND TRIM(COALESCE(source_locator,''))<>'' AND TRIM(COALESCE(verification_notes,''))<>'' AND (TRIM(COALESCE(source_title,''))<>'' OR TRIM(COALESCE(source_url,''))<>'') LIMIT 1`).bind(CONTENT_ID).first();
 if(!ev){
  ev=await env.DB.prepare(`INSERT INTO quote_source_evidence(content_item_id,source_type,source_title,source_url,source_locator,original_text,original_language,verified,verification_notes,created_at) VALUES(?,?,?,?,?,?,?,?,?,?) RETURNING id`).bind(CONTENT_ID,'primary_text','Plato, Apology 38a',SOURCE_URL,'Apology 38a',ORIGINAL,'grc',1,'Verified against Plato, Apology 38a via Perseus. The Greek sentence is the canonical source wording attributed to Socrates in Plato’s Apology.',ts).first();
 }
 await env.DB.prepare(`UPDATE content_items SET original_quote=?,original_language='grc',author_name='Socrates',author_source=?,source_work='Plato, Apology 38a',source_url=?,attribution_status='verified',source_verified_at=COALESCE(source_verified_at,?),source_verification_notes='Verified against Plato, Apology 38a via Perseus; complete source evidence stored in quote_source_evidence.',facts_verified=1,updated_at=? WHERE project_id=? AND id=?`).bind(ORIGINAL,SOURCE_URL,SOURCE_URL,ts,ts,PROJECT_ID,CONTENT_ID).run();
 const media=(await env.DB.prepare(`SELECT * FROM media_inbox WHERE project_id=? AND content_item_id=? ORDER BY created_at DESC`).bind(PROJECT_ID,CONTENT_ID).all()).results||[];
 const latest={};
 for(const m of media){const k=kind(m);if(!['video','pinterest'].includes(k)||!LANGS.includes(m.language_code))continue;const key=`${m.language_code}:${k}`;if(!latest[key])latest[key]=m;}
 const missing=[];for(const l of LANGS)for(const k of ['video','pinterest'])if(!latest[`${l}:${k}`])missing.push(`${l}:${k}`);
 if(missing.length)return {ok:false,error:'media incomplete',missing,media_count:media.length};
 for(const m of Object.values(latest)){
  await env.DB.prepare(`INSERT INTO media_reviews(media_inbox_id,qa_status,notes,reviewed_at,updated_at) VALUES(?,'approved','Final user-generated WQ014 media uploaded and accepted for production scheduling.',?,?) ON CONFLICT(media_inbox_id) DO UPDATE SET qa_status='approved',notes=excluded.notes,reviewed_at=excluded.reviewed_at,updated_at=excluded.updated_at`).bind(m.id,ts,ts).run();
 }
 let approval=await env.DB.prepare(`SELECT id FROM content_approvals WHERE content_item_id=? AND approval_scope='content' AND language_code IS NULL ORDER BY id LIMIT 1`).bind(CONTENT_ID).first();
 if(approval)await env.DB.prepare(`UPDATE content_approvals SET status='approved',approved_by='user-confirmed/admin-automation',notes='Source evidence complete; 8/8 locales and 16/16 final media assets confirmed.',updated_at=? WHERE id=?`).bind(ts,approval.id).run();
 else await env.DB.prepare(`INSERT INTO content_approvals(project_id,content_item_id,approval_scope,language_code,status,approved_by,notes,created_at,updated_at) VALUES(?,?,'content',NULL,'approved','user-confirmed/admin-automation','Source evidence complete; 8/8 locales and 16/16 final media assets confirmed.',?,?)`).bind(PROJECT_ID,CONTENT_ID,ts,ts).run();
 await env.DB.prepare(`UPDATE content_items SET status='approved',approved_at=COALESCE(approved_at,?),updated_at=? WHERE project_id=? AND id=?`).bind(ts,ts,PROJECT_ID,CONTENT_ID).run();
 return {ok:true,evidence_id:ev.id,approved_media:Object.values(latest).map(m=>({id:m.id,language:m.language_code,kind:kind(m),r2_key:m.r2_key})),approved_media_count:Object.keys(latest).length,approval:'approved'};
}
