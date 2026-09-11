import {readBuffer022031} from './prepared_buffer_022_031.js';

const PROJECT='wisequotesworld';
const SOCIAL=['uk','ru','pl','en','sv','de','es','fr'];
const LANG={uk:'Ukrainian',ru:'Russian',pl:'Polish',en:'English',sv:'Swedish',de:'German',es:'Spanish',fr:'French'};

function safePrompt(lang,quote){return `Create a premium photorealistic vertical 9:16 cinematic video in ${LANG[lang]}.

A quiet late-1920s theoretical-physics study after dark. No historical person, portrait, face, human figure, bust, sculpture, painting, photograph, or likeness of the quoted author appears anywhere. An empty wooden chair stands beside a desk with closed notebooks and a lamp. In the foreground, elegant chalk equations reach the edge of a blackboard. The camera slowly leaves the equations and drifts toward an open window where a vast star field appears, turning imagination into the visual bridge beyond established knowledge. Restrained warm desk light, deep blue night outside, subtle dust in the air, slow premium camera movement, contemplative intellectual mood.

Show the exact localized quote in one stable, large, elegant text card in the upper-middle safe area. Render exactly:
${quote}

Typography: clean, large, elegant, mobile-readable; complete stable card; no word-by-word or letter-by-letter animation.

Audio: a calm native ${LANG[lang]} narrator reads the exact quote and attribution naturally and completely, using the standard native pronunciation of the author's name. Restrained cinematic music stays below the voice.

No subtitles. No captions. No emoji. No decorative symbols. No logo. No branding. No watermark. No other readable text. No visual depiction or likeness of the quoted author.

End on the open window and star field, then hold briefly.`}
}

async function ensureHistory(env){await env.DB.exec(`CREATE TABLE IF NOT EXISTS editorial_status_history(id INTEGER PRIMARY KEY AUTOINCREMENT,project_id TEXT NOT NULL,content_item_id TEXT NOT NULL,from_status TEXT,to_status TEXT NOT NULL,notes TEXT,actor TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);`)}

async function publish021(env,ts){
 await ensureHistory(env);
 const before=await env.DB.prepare(`SELECT status FROM content_items WHERE project_id=? AND id='WQ021'`).bind(PROJECT).first();
 if(!before)return{ok:false,error:'WQ021 missing'};
 if(before.status!=='published'){
  await env.DB.prepare(`UPDATE content_items SET status='published',notes=COALESCE(notes,'')||?,updated_at=? WHERE project_id=? AND id='WQ021'`).bind(' User-confirmed actual publication on 2026-09-10.',ts,PROJECT).run();
  await env.DB.prepare(`UPDATE content_versions SET status='published',updated_at=? WHERE content_id='WQ021'`).bind(ts).run();
  await env.DB.prepare(`INSERT INTO editorial_status_history(project_id,content_item_id,from_status,to_status,notes,actor,created_at) VALUES(?,?,?,?,?,?,?)`).bind(PROJECT,'WQ021',before.status,'published','User confirmed actual publication on 2026-09-10','user-confirmed-publication',ts).run();
 }
 const after=await env.DB.prepare(`SELECT id,status,updated_at FROM content_items WHERE project_id=? AND id='WQ021'`).bind(PROJECT).first();
 return{ok:after?.status==='published',before:before.status,after};
}

async function fix022(env,ts){
 const rows=[];
 for(const lang of SOCIAL){
  const row=await env.DB.prepare(`SELECT id,adapted_text,version FROM content_versions WHERE content_id='WQ022' AND language_code=? ORDER BY version DESC LIMIT 1`).bind(lang).first();
  if(!row?.id||!String(row.adapted_text||'').trim())throw new Error(`WQ022 ${lang}: localized version missing`);
  const p=safePrompt(lang,String(row.adapted_text).trim());
  await env.DB.prepare(`UPDATE content_versions SET ai_prompt=?,editor_notes=COALESCE(editor_notes,'')||?,updated_at=? WHERE id=?`).bind(p,' Gemini-safe revision 2026-09-11: no visual depiction or likeness of Albert Einstein; scientific setting and metaphor only.',ts,row.id).run();
  rows.push({language:lang,version:row.version,chars:p.length,no_likeness:p.includes('No visual depiction or likeness of the quoted author.'),no_portrait:p.includes('No historical person, portrait, face, human figure, bust, sculpture, painting, photograph, or likeness')});
 }
 return{ok:rows.length===8&&rows.every(x=>x.no_likeness&&x.no_portrait),rows};
}

async function verify(env){
 const rb=await readBuffer022031(env);
 const rows=(rb.rows||[]).filter(x=>{const n=Number(String(x.id||'').replace('WQ',''));return n>=22&&n<=30});
 const prompts=(await env.DB.prepare(`SELECT language_code,ai_prompt FROM content_versions WHERE content_id='WQ022' AND language_code IN ('uk','ru','pl','en','sv','de','es','fr') AND version=(SELECT MAX(v2.version) FROM content_versions v2 WHERE v2.content_id='WQ022' AND v2.language_code=content_versions.language_code) ORDER BY language_code`).all()).results||[];
 const safe=prompts.length===8&&prompts.every(x=>String(x.ai_prompt||'').includes('No visual depiction or likeness of the quoted author.')&&!String(x.ai_prompt||'').includes('Einstein in a quiet'));
 const ready=rows.length===9&&rows.every(x=>x.ready_for_user_media===true);
 return{ok:ready&&safe,count:rows.length,rows,wq022_prompts:{ok:safe,count:prompts.length,languages:prompts.map(x=>x.language_code)}};
}

export async function applyWQ021030FinalFix(env){
 if(!env?.DB)return{ok:false,error:'DB unavailable'};
 const ts=new Date().toISOString();
 const wq021=await publish021(env,ts);
 const wq022=await fix022(env,ts);
 const verification=await verify(env);
 return{ok:wq021.ok&&wq022.ok&&verification.ok,ts,wq021,wq022,verification};
}
