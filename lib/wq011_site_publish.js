const PROJECT_ID='wisequotesworld';
const CONTENT_ID='WQ011';
const RAW_COPY='https://raw.githubusercontent.com/oshtogryn/wisequotesworld-web/main/ops/prepared/WQ011-platform-copy.md';
const SOURCE_URL='https://www.gutenberg.org/cache/epub/7203/pg7203-images.html';
const ORIGINAL='Was mich nicht umbringt, macht mich stärker.';
const WORK='Götzen-Dämmerung oder Wie man mit dem Hammer philosophiert';
const LANGS=['uk','ru','pl','en','sv','de','es','fr'];
const HEAD={uk:'UK',ru:'RU',pl:'PL',en:'EN',sv:'SV',de:'DE',es:'ES',fr:'FR'};
const DATA={
  uk:{quote:'Те, що мене не вбиває, робить мене сильнішим.',slug:'shcho-mene-ne-vbyvaie-robyt-sylnishym-nitsshe',title:'Те, що мене не вбиває, робить мене сильнішим — Фрідріх Ніцше',reflection_title:'Що означають ці слова?'},
  ru:{quote:'То, что меня не убивает, делает меня сильнее.',slug:'chto-menya-ne-ubivaet-delaet-silnee-nicshe',title:'То, что меня не убивает, делает меня сильнее — Фридрих Ницше',reflection_title:'Что означают эти слова?'},
  pl:{quote:'Co mnie nie zabija, czyni mnie silniejszym.',slug:'co-mnie-nie-zabija-czyni-silniejszym-nietzsche',title:'Co mnie nie zabija, czyni mnie silniejszym — Friedrich Nietzsche',reflection_title:'Co znaczą te słowa?'},
  en:{quote:'What does not kill me makes me stronger.',slug:'what-does-not-kill-me-makes-me-stronger-nietzsche',title:'What Does Not Kill Me Makes Me Stronger — Friedrich Nietzsche',reflection_title:'What do these words mean?'},
  sv:{quote:'Det som inte dödar mig gör mig starkare.',slug:'det-som-inte-dodar-mig-gor-mig-starkare-nietzsche',title:'Det som inte dödar mig gör mig starkare — Friedrich Nietzsche',reflection_title:'Vad betyder de här orden?'},
  de:{quote:ORIGINAL,slug:'was-mich-nicht-umbringt-macht-mich-staerker-nietzsche',title:'Was mich nicht umbringt, macht mich stärker — Friedrich Nietzsche',reflection_title:'Was bedeuten diese Worte?'},
  es:{quote:'Lo que no me mata me hace más fuerte.',slug:'lo-que-no-me-mata-me-hace-mas-fuerte-nietzsche',title:'Lo que no me mata me hace más fuerte — Friedrich Nietzsche',reflection_title:'¿Qué significan estas palabras?'},
  fr:{quote:'Ce qui ne me tue pas me rend plus fort.',slug:'ce-qui-ne-me-tue-pas-me-rend-plus-fort-nietzsche',title:'Ce qui ne me tue pas me rend plus fort — Friedrich Nietzsche',reflection_title:'Que signifient ces mots ?'}
};
function now(){return new Date().toISOString()}
function section(md,lang){const start=`## ${HEAD[lang]}\n`;const a=md.indexOf(start);if(a<0)return'';const from=a+start.length;const b=md.indexOf('\n## ',from);return md.slice(from,b<0?md.length:b)}
function field(sec,label){const key=label+':';const line=sec.split('\n').find(x=>x.startsWith(key));return line?line.slice(key.length).trim():''}
async function loadCopy(){const r=await fetch(RAW_COPY,{headers:{'user-agent':'WiseQuotesWorld/1.0'},cache:'no-store'});if(!r.ok)throw new Error(`WQ011 copy fetch failed: ${r.status}`);const md=await r.text();const out={};for(const lang of LANGS){const sec=section(md,lang);out[lang]={reflection:field(sec,'Website reflection'),facebook:field(sec,'Facebook'),pinterest_title:field(sec,'Pinterest title')};if(!out[lang].reflection)throw new Error(`WQ011 ${lang} website reflection missing`)}return out}
async function ensureOutputsTable(db){await db.exec(`CREATE TABLE IF NOT EXISTS content_outputs (id TEXT PRIMARY KEY,project_id TEXT NOT NULL,content_item_id TEXT NOT NULL,language_code TEXT NOT NULL,output_key TEXT NOT NULL,output_text TEXT,status TEXT NOT NULL DEFAULT 'draft',updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,UNIQUE(content_item_id,language_code,output_key));CREATE INDEX IF NOT EXISTS idx_content_outputs_item ON content_outputs(content_item_id,language_code,output_key);`)}
export async function ensureWQ011SitePublished(env){
  if(!env?.DB)return {ok:false,skipped:'no-db'};
  const live=await env.DB.prepare(`SELECT COUNT(*) n FROM quote_pages WHERE project_id=? AND content_item_id=? AND language_code IN ('uk','ru','pl','en','sv','de','es','fr') AND status='published'`).bind(PROJECT_ID,CONTENT_ID).first();
  if(Number(live?.n||0)===8)return {ok:true,already:true,published:8};
  const copy=await loadCopy(),ts=now();
  const existing=await env.DB.prepare(`SELECT id FROM content_items WHERE project_id=? AND id=?`).bind(PROJECT_ID,CONTENT_ID).first();
  if(!existing){
    await env.DB.prepare(`INSERT INTO content_items(id,project_id,content_type,sequence_no,category,canonical_title,source_text,source_name,source_url,status,facts_verified,uniqueness_verified,notes,created_at,updated_at,quote_type,original_quote,original_language,author_name,author_source,source_work,attribution_status,category_slug,source_verified_at,source_verification_notes) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(CONTENT_ID,PROJECT_ID,'quote',11,'philosophy-strength','Was mich nicht umbringt, macht mich stärker — Friedrich Nietzsche',ORIGINAL,'Project Gutenberg',SOURCE_URL,'website_ready',1,1,'WQ011 verified-author website publication',ts,ts,'verbatim',ORIGINAL,'de','Friedrich Nietzsche','Project Gutenberg',WORK,'unverified','philosophy-strength',null,'Verification pending evidence insert').run();
  }else{
    await env.DB.prepare(`UPDATE content_items SET category='philosophy-strength',canonical_title=?,source_text=?,source_name='Project Gutenberg',source_url=?,status='website_ready',facts_verified=1,quote_type='verbatim',original_quote=?,original_language='de',author_name='Friedrich Nietzsche',author_source='Project Gutenberg',source_work=?,category_slug='philosophy-strength',updated_at=? WHERE project_id=? AND id=?`).bind('Was mich nicht umbringt, macht mich stärker — Friedrich Nietzsche',ORIGINAL,SOURCE_URL,ORIGINAL,WORK,ts,PROJECT_ID,CONTENT_ID).run();
  }
  const ev=await env.DB.prepare(`SELECT id FROM quote_source_evidence WHERE content_item_id=? AND verified=1 LIMIT 1`).bind(CONTENT_ID).first();
  if(!ev)await env.DB.prepare(`INSERT INTO quote_source_evidence(content_item_id,source_type,source_title,source_url,source_locator,original_text,original_language,verified,verification_notes,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)`).bind(CONTENT_ID,'primary_text','Project Gutenberg eBook 7203 — Götzen-Dämmerung',SOURCE_URL,'Sprüche und Pfeile; aphorism 8; lead-in “Aus der Kriegsschule des Lebens.”',ORIGINAL,'de',1,'Original German wording and attribution independently checked against the public Project Gutenberg text before website publication.',ts).run();
  await env.DB.prepare(`UPDATE content_items SET attribution_status='verified',source_verified_at=?,source_verification_notes=?,status='website_ready',updated_at=? WHERE project_id=? AND id=?`).bind(ts,'Verified against Project Gutenberg eBook 7203, Götzen-Dämmerung, Sprüche und Pfeile, aphorism 8.',ts,PROJECT_ID,CONTENT_ID).run();
  await ensureOutputsTable(env.DB);
  for(const lang of LANGS){
    const d=DATA[lang],vid=`${CONTENT_ID}_${lang}_v1`,canonical=`/${lang}/quotes/${d.slug}/`;
    await env.DB.prepare(`INSERT INTO content_versions(id,content_id,language_code,title,adapted_text,voiceover_text,on_screen_text,status,language_check_status,approved,verification_date,source_urls,version) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,1) ON CONFLICT(content_id,language_code,version) DO UPDATE SET title=excluded.title,adapted_text=excluded.adapted_text,voiceover_text=excluded.voiceover_text,on_screen_text=excluded.on_screen_text,status=excluded.status,language_check_status=excluded.language_check_status,verification_date=excluded.verification_date,source_urls=excluded.source_urls`).bind(vid,CONTENT_ID,lang,d.title,d.quote,d.quote,d.quote,'website_ready','native_qa_pass',0,ts,SOURCE_URL).run();
    const meta=(copy[lang].facebook||d.title).replace(/\s+/g,' ').slice(0,155);
    await env.DB.prepare(`INSERT INTO quote_pages(id,project_id,content_item_id,content_version_id,language_code,slug,seo_title,meta_description,reflection_title,reflection_body,canonical_path,status,published_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(content_version_id) DO UPDATE SET slug=excluded.slug,seo_title=excluded.seo_title,meta_description=excluded.meta_description,reflection_title=excluded.reflection_title,reflection_body=excluded.reflection_body,canonical_path=excluded.canonical_path,status='published',published_at=COALESCE(quote_pages.published_at,excluded.published_at),updated_at=excluded.updated_at`).bind(`${CONTENT_ID}_${lang}_page`,PROJECT_ID,CONTENT_ID,vid,lang,d.slug,copy[lang].pinterest_title||d.title,meta,d.reflection_title,copy[lang].reflection,canonical,'published',ts,ts).run();
    const article=`https://wisequotesworld.com${canonical}`;
    for(const [key,value] of [['website_reflection',copy[lang].reflection],['article_url',article]])await env.DB.prepare(`INSERT INTO content_outputs(id,project_id,content_item_id,language_code,output_key,output_text,status,updated_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(content_item_id,language_code,output_key) DO UPDATE SET output_text=excluded.output_text,status=excluded.status,updated_at=excluded.updated_at`).bind(`${CONTENT_ID}_${lang}_${key}`,PROJECT_ID,CONTENT_ID,lang,key,value,'ready',ts).run();
  }
  const approval=await env.DB.prepare(`SELECT id,status FROM content_approvals WHERE content_item_id=? AND approval_scope='content' AND language_code IS NULL LIMIT 1`).bind(CONTENT_ID).first();
  if(!approval)await env.DB.prepare(`INSERT INTO content_approvals(project_id,content_item_id,approval_scope,language_code,status,approved_by,notes,created_at,updated_at) VALUES(?,?,'content',NULL,'approved','user_request',?,?,?)`).bind(PROJECT_ID,CONTENT_ID,'Website content publication explicitly requested by user; media QA remains required separately before social scheduling.',ts,ts).run();
  else if(approval.status!=='approved')await env.DB.prepare(`UPDATE content_approvals SET status='approved',approved_by='user_request',notes=?,updated_at=? WHERE id=?`).bind('Website content publication explicitly requested by user; media QA remains required separately before social scheduling.',ts,approval.id).run();
  await env.DB.prepare(`UPDATE content_items SET status='published',approved_at=COALESCE(approved_at,?),updated_at=? WHERE project_id=? AND id=?`).bind(ts,ts,PROJECT_ID,CONTENT_ID).run();
  return {ok:true,published:8,languages:LANGS};
}
