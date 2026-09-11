import {readBuffer022031} from './prepared_buffer_022_031.js';

const PROJECT='wisequotesworld';
const SOCIAL=['uk','ru','pl','en','sv','de','es','fr'];
const LANG={uk:'Ukrainian',ru:'Russian',pl:'Polish',en:'English',sv:'Swedish',de:'German',es:'Spanish',fr:'French'};

function prompt(lang,quote){return `Create a premium photorealistic vertical 9:16 cinematic video in ${LANG[lang]}.

A quiet late-1920s study with no living historical person on screen. A small static bronze museum bust of an early-20th-century theoretical physicist with unruly hair sits on a bookshelf in partial shadow; it remains an inanimate sculpture throughout. In the foreground, chalk equations reach the edge of a blackboard. The camera slowly leaves the equations and drifts toward an open window where a vast star field appears, turning imagination into the visual bridge beyond established knowledge. Restrained warm desk light, deep blue night outside, subtle dust in the air, slow premium camera movement, contemplative intellectual mood.

Show the exact localized quote in one stable, large, elegant text card in the upper-middle safe area. Render exactly:
${quote}

Typography: clean, large, elegant, mobile-readable; complete stable card; no word-by-word or letter-by-letter animation.

Audio: a calm native ${LANG[lang]} narrator reads the exact quote and attribution naturally and completely, using the standard native pronunciation of the author's name. Restrained cinematic music stays below the voice.

No subtitles. No captions. No emoji. No decorative symbols. No logo. No branding. No watermark. No other readable text. Do not depict any living or animated likeness of the quoted author; the bronze bust is only a static museum object.

End on the open window and star field, then hold briefly.`}

async function ensureHistory(env){await env.DB.exec(`CREATE TABLE IF NOT EXISTS editorial_status_history(id INTEGER PRIMARY KEY AUTOINCREMENT,project_id TEXT NOT NULL,content_item_id TEXT NOT NULL,from_status TEXT,to_status TEXT NOT NULL,notes TEXT,actor TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);`)}

async function markWQ021Published(env,ts){
 await ensureHistory(env);
 const cur=await env.DB.prepare(`SELECT status FROM content_items WHERE project_id=? AND id='WQ021'`).bind(PROJECT).first();
 if(!cur)return{ok:false,error:'WQ021 missing'};
 if(cur.status!=='published'){
  await env.DB.prepare(`UPDATE content_items SET status='published',updated_at=? WHERE project_id=? AND id='WQ021'`).bind(ts,PROJECT).run();
  await env.DB.prepare(`UPDATE content_versions SET status='published' WHERE content_id='WQ021'`).run();
  await env.DB.prepare(`INSERT INTO editorial_status_history(project_id,content_item_id,from_status,to_status,notes,actor,created_at) VALUES(?,?,?,?,?,?,?)`).bind(PROJECT,'WQ021',cur.status,'published','User confirmed WQ021 was actually published on 2026-09-10','user-confirmed-publication',ts).run();
 }
 const after=await env.DB.prepare(`SELECT id,status,updated_at FROM content_items WHERE project_id=? AND id='WQ021'`).bind(PROJECT).first();
 return{ok:after?.status==='published',before:cur.status,after};
}

async function rewriteWQ022Prompts(env,ts){
 const changed=[];
 for(const lang of SOCIAL){
  const row=await env.DB.prepare(`SELECT id,adapted_text,version FROM content_versions WHERE content_id='WQ022' AND language_code=? ORDER BY version DESC LIMIT 1`).bind(lang).first();
  if(!row?.id||!String(row.adapted_text||'').trim())throw new Error(`WQ022 ${lang}: latest localized quote missing`);
  const p=prompt(lang,String(row.adapted_text).trim());
  await env.DB.prepare(`UPDATE content_versions SET ai_prompt=?,video_concept=? WHERE id=?`).bind(p,'Static bronze museum bust in a 1920s study; equations give way to an open window and a vast star field. No living or animated depiction of Albert Einstein.',row.id).run();
  changed.push({language:lang,version:row.version,chars:p.length,static_artwork:p.includes('static bronze museum bust'),no_living:p.includes('no living historical person')});
 }
 return{ok:changed.length===8&&changed.every(x=>x.static_artwork&&x.no_living),changed};
}

async function verify022030(env){
 const base=await readBuffer022031(env);
 const rows=(base.rows||[]).filter(r=>Number(r.id.slice(2))>=22&&Number(r.id.slice(2))<=30);
 const promptRows=(await env.DB.prepare(`SELECT language_code,ai_prompt FROM content_versions WHERE content_id='WQ022' AND language_code IN ('uk','ru','pl','en','sv','de','es','fr') AND version=(SELECT MAX(v2.version) FROM content_versions v2 WHERE v2.content_id='WQ022' AND v2.language_code=content_versions.language_code) ORDER BY language_code`).all()).results||[];
 const promptSafe=promptRows.length===8&&promptRows.every(r=>String(r.ai_prompt||'').includes('static bronze museum bust')&&!String(r.ai_prompt||'').includes('Einstein in a quiet'));
 const ready=rows.length===9&&rows.every(r=>r.ready_for_user_media===true);
 return{ok:ready&&promptSafe,count:rows.length,rows,wq022_prompt_safety:{ok:promptSafe,count:promptRows.length,languages:promptRows.map(x=>x.language_code)}};
}

export async function applyWQ021030Fix(env){
 if(!env?.DB)return{ok:false,error:'DB unavailable'};
 const ts=new Date().toISOString();
 const published=await markWQ021Published(env,ts);
 const prompts=await rewriteWQ022Prompts(env,ts);
 const verification=await verify022030(env);
 return{ok:published.ok&&prompts.ok&&verification.ok,ts,published,prompts,verification};
}
