const PROJECT='wisequotesworld';
const ID='WQ023';
const LANGS=['uk','ru','pl','en','sv','de','es','fr'];

export async function readWQ023SocialPack(env){
  if(!env?.DB)return {ok:false,error:'DB unavailable'};
  const rows=[];
  for(const lang of LANGS){
    const version=await env.DB.prepare(`SELECT adapted_text,voiceover_text,on_screen_text,ai_prompt,language_check_status FROM content_versions WHERE content_id=? AND language_code=? ORDER BY version DESC LIMIT 1`).bind(ID,lang).first();
    const page=await env.DB.prepare(`SELECT canonical_path,status FROM quote_pages WHERE project_id=? AND content_item_id=? AND language_code=? ORDER BY updated_at DESC LIMIT 1`).bind(PROJECT,ID,lang).first();
    const outputs=(await env.DB.prepare(`SELECT output_key,output_text,status FROM content_outputs WHERE project_id=? AND content_item_id=? AND language_code=? AND output_key IN ('facebook','instagram','threads','tiktok','youtube_title','youtube_description','pinterest_title','pinterest_description','article_url') ORDER BY output_key`).bind(PROJECT,ID,lang).all()).results||[];
    const media=(await env.DB.prepare(`SELECT m.asset_type,m.mime_type,m.original_filename,m.r2_key,r.qa_status FROM media_inbox m LEFT JOIN media_reviews r ON r.media_inbox_id=m.id WHERE m.project_id=? AND m.content_item_id=? AND m.language_code=? ORDER BY m.created_at DESC`).bind(PROJECT,ID,lang).all()).results||[];
    rows.push({lang,quote:version?.adapted_text||null,voiceover:version?.voiceover_text||null,on_screen:version?.on_screen_text||null,language_check_status:version?.language_check_status||null,canonical_path:page?.canonical_path||null,page_status:page?.status||null,outputs:Object.fromEntries(outputs.map(x=>[x.output_key,{text:x.output_text,status:x.status}])),media});
  }
  return {ok:rows.length===8,content_id:ID,count:rows.length,rows};
}
