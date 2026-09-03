import {readWQ014Package} from './wq014_decode.js';

const PROJECT_ID='wisequotesworld';
const CONTENT_ID='WQ014';
const LANGS=['uk','ru','pl','en','sv','de','es','fr'];
const SOURCE_URL='https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.01.0169%3Atext%3DApol.%3Asection%3D38a';
const ORIGINAL='ὁ δὲ ἀνεξέταστος βίος οὐ βιωτὸς ἀνθρώπῳ';

function now(){return new Date().toISOString()}

async function ensureOutputsTable(db){
  await db.exec(`CREATE TABLE IF NOT EXISTS content_outputs (id TEXT PRIMARY KEY,project_id TEXT NOT NULL,content_item_id TEXT NOT NULL,language_code TEXT NOT NULL,output_key TEXT NOT NULL,output_text TEXT,status TEXT NOT NULL DEFAULT 'draft',updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,UNIQUE(content_item_id,language_code,output_key));CREATE INDEX IF NOT EXISTS idx_content_outputs_item ON content_outputs(content_item_id,language_code,output_key);`);
}

export async function publishWQ014Site(env){
  if(!env?.DB)return {ok:false,error:'DB binding unavailable'};
  const data=await readWQ014Package();
  const ts=now();
  const missing=LANGS.filter(l=>!data?.[l]);
  if(missing.length)return {ok:false,error:'package locales missing',missing};
  await ensureOutputsTable(env.DB);

  const existing=await env.DB.prepare(`SELECT id FROM content_items WHERE project_id=? AND id=?`).bind(PROJECT_ID,CONTENT_ID).first();
  if(!existing){
    await env.DB.prepare(`INSERT INTO content_items(id,project_id,content_type,sequence_no,category,canonical_title,source_text,source_name,source_url,status,facts_verified,uniqueness_verified,notes,created_at,updated_at,quote_type,original_quote,original_language,author_name,author_source,source_work,attribution_status,category_slug,source_verified_at,source_verification_notes) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(CONTENT_ID,PROJECT_ID,'quote',14,'philosophy',data.uk.title,ORIGINAL,'Socrates',SOURCE_URL,'website_ready',1,1,'WQ014 verified Socrates quote from Plato, Apology 38a; native-language QA passed in 8 locales.',ts,ts,'verbatim',ORIGINAL,'grc','Socrates',SOURCE_URL,'Plato, Apology 38a','verified','philosophy',ts,'Verified against Plato, Apology 38a. Socrates attribution is through Plato; localized wording is production-approved per locale.').run();
  }else{
    await env.DB.prepare(`UPDATE content_items SET category='philosophy',canonical_title=?,source_text=?,source_name='Socrates',source_url=?,status='website_ready',facts_verified=1,uniqueness_verified=1,quote_type='verbatim',original_quote=?,original_language='grc',author_name='Socrates',author_source=?,source_work='Plato, Apology 38a',attribution_status='verified',category_slug='philosophy',source_verified_at=?,source_verification_notes='Verified against Plato, Apology 38a. Socrates attribution is through Plato.',updated_at=? WHERE project_id=? AND id=?`).bind(data.uk.title,ORIGINAL,SOURCE_URL,ORIGINAL,SOURCE_URL,ts,ts,PROJECT_ID,CONTENT_ID).run();
  }

  for(const lang of LANGS){
    const d=data[lang];
    const vid=`${CONTENT_ID}_${lang}_v1`;
    const canonical=`/${lang}/quotes/${d.slug}/`;
    const article=`https://wisequotesworld.com${canonical}`;
    await env.DB.prepare(`INSERT INTO content_versions(id,content_id,language_code,title,adapted_text,voiceover_text,on_screen_text,status,language_check_status,approved,verification_date,source_urls,version) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,1) ON CONFLICT(content_id,language_code,version) DO UPDATE SET title=excluded.title,adapted_text=excluded.adapted_text,voiceover_text=excluded.voiceover_text,on_screen_text=excluded.on_screen_text,status=excluded.status,language_check_status=excluded.language_check_status,verification_date=excluded.verification_date,source_urls=excluded.source_urls`).bind(vid,CONTENT_ID,lang,d.title,d.quote,d.quote,d.quote,'website_ready','native_qa_pass',0,ts,SOURCE_URL).run();
    await env.DB.prepare(`INSERT INTO quote_pages(id,project_id,content_item_id,content_version_id,language_code,slug,seo_title,meta_description,reflection_title,reflection_body,canonical_path,status,published_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(content_version_id) DO UPDATE SET slug=excluded.slug,seo_title=excluded.seo_title,meta_description=excluded.meta_description,reflection_title=excluded.reflection_title,reflection_body=excluded.reflection_body,canonical_path=excluded.canonical_path,status='published',published_at=COALESCE(quote_pages.published_at,excluded.published_at),updated_at=excluded.updated_at`).bind(`${CONTENT_ID}_${lang}_page`,PROJECT_ID,CONTENT_ID,vid,lang,d.slug,d.title,d.meta,d.title,d.reflection,canonical,'published',ts,ts).run();
    const outputs={facebook:d.facebook,instagram:d.instagram,threads:d.threads,tiktok:d.tiktok,youtube_title:d.youtube_title,youtube_description:d.youtube_description,pinterest_title:d.pinterest_title,pinterest_description:d.pinterest_description,website_reflection:d.reflection,article_url:article};
    for(const [key,value] of Object.entries(outputs)){
      await env.DB.prepare(`INSERT INTO content_outputs(id,project_id,content_item_id,language_code,output_key,output_text,status,updated_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(content_item_id,language_code,output_key) DO UPDATE SET output_text=excluded.output_text,status=excluded.status,updated_at=excluded.updated_at`).bind(`${CONTENT_ID}_${lang}_${key}`,PROJECT_ID,CONTENT_ID,lang,key,value,'ready',ts).run();
    }
  }
  await env.DB.prepare(`UPDATE content_items SET status='website_ready',updated_at=? WHERE project_id=? AND id=?`).bind(ts,PROJECT_ID,CONTENT_ID).run();
  return readbackWQ014Site(env);
}

export async function readbackWQ014Site(env){
  if(!env?.DB)return {ok:false,error:'DB binding unavailable'};
  const item=await env.DB.prepare(`SELECT id,status,quote_type,author_name,attribution_status,source_work,source_url FROM content_items WHERE project_id=? AND id=?`).bind(PROJECT_ID,CONTENT_ID).first();
  if(!item)return {ok:false,error:'content not found'};
  const versions=(await env.DB.prepare(`SELECT language_code,title,adapted_text,status,language_check_status FROM content_versions WHERE content_id=? AND version=1 ORDER BY language_code`).bind(CONTENT_ID).all()).results||[];
  const pages=(await env.DB.prepare(`SELECT language_code,slug,canonical_path,status,published_at FROM quote_pages WHERE project_id=? AND content_item_id=? ORDER BY language_code`).bind(PROJECT_ID,CONTENT_ID).all()).results||[];
  const outputs=(await env.DB.prepare(`SELECT language_code,output_key,status FROM content_outputs WHERE project_id=? AND content_item_id=? ORDER BY language_code,output_key`).bind(PROJECT_ID,CONTENT_ID).all()).results||[];
  return {ok:true,item,versions_count:versions.length,pages_count:pages.length,outputs_count:outputs.length,versions,pages,output_keys:Object.fromEntries(LANGS.map(l=>[l,outputs.filter(o=>o.language_code===l).map(o=>o.output_key)]))};
}
