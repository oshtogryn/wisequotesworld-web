const PROJECT_ID='wisequotesworld';
const CONTENT_ID='WQ014';
const LANGS=['uk','ru','pl','en','sv','de','es','fr'];
const KEYS=['facebook','instagram','threads','tiktok','youtube_title','youtube_description','pinterest_title','pinterest_description','article_url'];
export async function exportWQ014Schedule(env,lang){
 if(!env?.DB)return {ok:false,error:'DB binding unavailable'};
 if(!LANGS.includes(lang))return {ok:false,error:'unsupported language'};
 const rows=(await env.DB.prepare(`SELECT output_key,output_text,status FROM content_outputs WHERE project_id=? AND content_item_id=? AND language_code=?`).bind(PROJECT_ID,CONTENT_ID,lang).all()).results||[];
 const out={};for(const r of rows)if(KEYS.includes(r.output_key))out[r.output_key]=r.output_text;
 const missing=KEYS.filter(k=>!String(out[k]||'').trim());
 if(missing.length)return {ok:false,error:'missing outputs',missing};
 const approval=await env.DB.prepare(`SELECT status FROM content_approvals WHERE content_item_id=? AND approval_scope='content' AND language_code IS NULL ORDER BY id DESC LIMIT 1`).bind(CONTENT_ID).first();
 return {ok:true,content_id:CONTENT_ID,language:lang,approval:approval?.status||'pending',outputs:out,media:{video:`https://wisequotesworld.com/media/approved/${CONTENT_ID}/${lang}/video.mov`,pinterest:`https://wisequotesworld.com/media/approved/${CONTENT_ID}/${lang}/pinterest.png`}};
}
