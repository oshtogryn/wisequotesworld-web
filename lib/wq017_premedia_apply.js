import {WQ017_SOCIAL} from './wq017_social_payload.js';

const PROJECT='wisequotesworld';
const SOCIAL_LANGS=['uk','ru','pl','en','sv','de','es','fr'];
const OUTPUT_KEYS=['pinterest_prompt','facebook','instagram','threads','tiktok','youtube_title','youtube_description','pinterest_title','pinterest_description','website_reflection','article_url'];
const now=()=>new Date().toISOString();

async function upsertOutput(env,id,lang,key,text,ts){
  const rid=`${id}_${lang}_${key}`;
  await env.DB.prepare(`INSERT INTO content_outputs(id,project_id,content_item_id,language_code,output_key,output_text,status,updated_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(content_item_id,language_code,output_key) DO UPDATE SET output_text=excluded.output_text,status=excluded.status,updated_at=excluded.updated_at`).bind(rid,PROJECT,id,lang,key,text,'ready',ts).run();
}

export async function applyWQ017Premedia(env){
  if(!env?.DB)return{ok:false,error:'DB unavailable'};
  const id=WQ017_SOCIAL.id,ts=now();
  const item=await env.DB.prepare(`SELECT id,status,quote_type,attribution_status FROM content_items WHERE project_id=? AND id=?`).bind(PROJECT,id).first();
  if(!item)return{ok:false,error:'WQ017 missing'};
  if(item.quote_type!=='verbatim'||item.attribution_status!=='verified')return{ok:false,error:'WQ017 provenance gate not satisfied',item};

  for(const lang of SOCIAL_LANGS){
    const d=WQ017_SOCIAL.languages[lang];
    if(!d)return{ok:false,error:`missing payload ${lang}`};
    const v=await env.DB.prepare(`SELECT id,version FROM content_versions WHERE content_id=? AND language_code=? ORDER BY version DESC LIMIT 1`).bind(id,lang).first();
    if(!v)return{ok:false,error:`missing content_version ${lang}`};
    const visible=`${d.quote} — ${d.author}`;
    await env.DB.prepare(`UPDATE content_versions SET ai_prompt=?,voiceover_text=?,on_screen_text=?,status='media_pending',language_check_status='native_qa_pass',approved=1,verification_date=?,editor_notes=?,updated_at=? WHERE id=?`).bind(d.video_prompt,visible,visible,ts,'WQ017 social/video package reviewed for semantic fidelity, native naturalness, exact-text handling and platform routing.',ts,v.id).run();
    const page=await env.DB.prepare(`SELECT reflection_body,canonical_path,status FROM quote_pages WHERE project_id=? AND content_item_id=? AND language_code=? ORDER BY updated_at DESC LIMIT 1`).bind(PROJECT,id,lang).first();
    if(!page||page.status!=='published')return{ok:false,error:`published article missing ${lang}`,page};
    const url=`https://wisequotesworld.com${page.canonical_path}`;
    const outputs={
      pinterest_prompt:d.pinterest_prompt,facebook:d.facebook,instagram:d.instagram,threads:d.threads,tiktok:d.tiktok,
      youtube_title:d.youtube_title,youtube_description:d.youtube_description,pinterest_title:d.pinterest_title,pinterest_description:d.pinterest_description,
      website_reflection:page.reflection_body,article_url:url
    };
    for(const key of OUTPUT_KEYS)await upsertOutput(env,id,lang,key,outputs[key],ts);
  }

  await env.DB.prepare(`UPDATE content_items SET status='media_pending',notes=?,updated_at=? WHERE project_id=? AND id=?`).bind('WQ017 complete pre-media package: source verified; 13 website articles published; 8 active social locales native-QA complete; video prompts, Pinterest prompts, social copy and exact article URLs ready. Awaiting user-generated video and Pinterest media in Admin.',ts,PROJECT,id).run();
  return await readbackWQ017Premedia(env);
}

export async function readbackWQ017Premedia(env){
  if(!env?.DB)return{ok:false,error:'DB unavailable'};
  const id='WQ017';
  const item=await env.DB.prepare(`SELECT id,status,quote_type,author_name,source_work,attribution_status,facts_verified,notes FROM content_items WHERE project_id=? AND id=?`).bind(PROJECT,id).first();
  const pages=(await env.DB.prepare(`SELECT language_code,canonical_path,status FROM quote_pages WHERE project_id=? AND content_item_id=? ORDER BY language_code`).bind(PROJECT,id).all()).results||[];
  const versions=(await env.DB.prepare(`SELECT language_code,status,language_check_status,LENGTH(COALESCE(ai_prompt,'')) prompt_len FROM content_versions WHERE content_id=? AND language_code IN ('uk','ru','pl','en','sv','de','es','fr') ORDER BY language_code`).bind(id).all()).results||[];
  const outs=(await env.DB.prepare(`SELECT language_code,output_key,LENGTH(COALESCE(output_text,'')) n FROM content_outputs WHERE project_id=? AND content_item_id=? ORDER BY language_code,output_key`).bind(PROJECT,id).all()).results||[];
  const langs=SOCIAL_LANGS.map(lang=>{const v=versions.find(x=>x.language_code===lang);const keys=outs.filter(x=>x.language_code===lang&&x.n>0).map(x=>x.output_key).sort();const p=pages.find(x=>x.language_code===lang);return{language:lang,article_published:p?.status==='published',article_url:p?`https://wisequotesworld.com${p.canonical_path}`:null,video_prompt:!!v?.prompt_len,native_qa:v?.language_check_status==='native_qa_pass',version_status:v?.status||null,output_count:keys.length,output_keys:keys,ready_for_media:!!v?.prompt_len&&v?.language_check_status==='native_qa_pass'&&keys.length===11&&p?.status==='published'};});
  return{ok:item?.status==='media_pending'&&pages.length===13&&langs.every(x=>x.ready_for_media),item,pages_count:pages.length,published_pages:pages.filter(x=>x.status==='published').length,outputs_count:outs.length,languages:langs,ready_for_user_media:langs.every(x=>x.ready_for_media)};
}
