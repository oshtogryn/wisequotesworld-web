const PROJECT_ID='wisequotesworld';
const CONTENT_ID='WQ011';
const LANGS=['uk','ru','pl','en','sv','de','es','fr'];
const HEAD={uk:'UK',ru:'RU',pl:'PL',en:'EN',sv:'SV',de:'DE',es:'ES',fr:'FR'};
const RAW='https://raw.githubusercontent.com/oshtogryn/wisequotesworld-web/main/ops/prepared/WQ011-nietzsche-production-package.md';

function section(md,start,end){const a=md.indexOf(start);if(a<0)return'';const from=a+start.length;const b=end?md.indexOf(end,from):-1;return md.slice(from,b<0?md.length:b)}
function headed(md,start,end){const s=section(md,start,end),o={};for(const l of LANGS){const m=s.match(new RegExp(`(?:^|\\n)## ${HEAD[l]}(?: — original)?\\s*\\n([\\s\\S]*?)(?=\\n## |$)`));if(m)o[l]=m[1].trim()}return o}
async function load(){const r=await fetch(RAW,{headers:{'user-agent':'WiseQuotesWorld/1.0'},cache:'no-store'});if(!r.ok)throw new Error(`WQ011 package fetch failed: ${r.status}`);const md=await r.text();const video=headed(md,'# Gemini / Veo prompts — VERBATIM AUTHOR-SPECIFIC v4.5','# Pinterest prompts');const pin=headed(md,'# Pinterest prompts','# Website');for(const l of LANGS){if(!video[l])throw new Error(`WQ011 ${l} video prompt missing`);if(!pin[l])throw new Error(`WQ011 ${l} Pinterest prompt missing`)}return{video,pin}}
async function ensureOutputsTable(db){await db.exec(`CREATE TABLE IF NOT EXISTS content_outputs (id TEXT PRIMARY KEY,project_id TEXT NOT NULL,content_item_id TEXT NOT NULL,language_code TEXT NOT NULL,output_key TEXT NOT NULL,output_text TEXT,status TEXT NOT NULL DEFAULT 'draft',updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,UNIQUE(content_item_id,language_code,output_key));CREATE INDEX IF NOT EXISTS idx_content_outputs_item ON content_outputs(content_item_id,language_code,output_key);`)}
export async function ensureWQ011PromptsSynced(env){
  if(!env?.DB)return {ok:false,skipped:'no-db'};
  const item=await env.DB.prepare(`SELECT id FROM content_items WHERE project_id=? AND id=?`).bind(PROJECT_ID,CONTENT_ID).first();
  if(!item)return {ok:false,skipped:'content-missing'};
  const {video,pin}=await load();
  await ensureOutputsTable(env.DB);
  const ts=new Date().toISOString();
  for(const lang of LANGS){
    await env.DB.prepare(`UPDATE content_versions SET ai_prompt=?,status=CASE WHEN status='published' THEN status ELSE 'prompt_ready' END,updated_at=COALESCE(updated_at,?) WHERE content_id=? AND language_code=? AND version=(SELECT MAX(version) FROM content_versions WHERE content_id=? AND language_code=?)`).bind(video[lang],ts,CONTENT_ID,lang,CONTENT_ID,lang).run().catch(async()=>{
      await env.DB.prepare(`UPDATE content_versions SET ai_prompt=?,status=CASE WHEN status='published' THEN status ELSE 'prompt_ready' END WHERE content_id=? AND language_code=? AND version=(SELECT MAX(version) FROM content_versions WHERE content_id=? AND language_code=?)`).bind(video[lang],CONTENT_ID,lang,CONTENT_ID,lang).run();
    });
    await env.DB.prepare(`INSERT INTO content_outputs(id,project_id,content_item_id,language_code,output_key,output_text,status,updated_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(content_item_id,language_code,output_key) DO UPDATE SET output_text=excluded.output_text,status=excluded.status,updated_at=excluded.updated_at`).bind(`${CONTENT_ID}_${lang}_pinterest_prompt`,PROJECT_ID,CONTENT_ID,lang,'pinterest_prompt',pin[lang],'ready',ts).run();
  }
  return {ok:true,languages:LANGS,video_prompts:8,pinterest_prompts:8,version:'v4.5'};
}

export async function readbackWQ011Prompts(env){
  if(!env?.DB)return {ok:false,error:'no-db'};
  const rows=(await env.DB.prepare(`SELECT cv.language_code,cv.ai_prompt,co.output_text pinterest_prompt FROM content_versions cv LEFT JOIN content_outputs co ON co.content_item_id=cv.content_id AND co.language_code=cv.language_code AND co.output_key='pinterest_prompt' WHERE cv.content_id=? AND cv.version=(SELECT MAX(v2.version) FROM content_versions v2 WHERE v2.content_id=cv.content_id AND v2.language_code=cv.language_code) ORDER BY cv.language_code`).bind(CONTENT_ID).all()).results||[];
  const languages=rows.map(r=>({language:r.language_code,video_prompt:!!String(r.ai_prompt||'').trim(),pinterest_prompt:!!String(r.pinterest_prompt||'').trim(),video_chars:String(r.ai_prompt||'').length,pinterest_chars:String(r.pinterest_prompt||'').length,v45:String(r.ai_prompt||'').includes('Prestigious, intellectual, restrained; never superhero-like.')}));
  return {ok:true,content_id:CONTENT_ID,languages,video_count:languages.filter(x=>x.video_prompt).length,pinterest_count:languages.filter(x=>x.pinterest_prompt).length,v45_count:languages.filter(x=>x.v45).length};
}
