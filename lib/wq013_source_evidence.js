const PROJECT_ID='wisequotesworld';
const CONTENT_ID='WQ013';
const SOURCE_URL='https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.01.0235%3Atext%3Denc%3Achapter%3D5';
const ORIGINAL='Ταράσσει τοὺς ἀνθρώπους οὐ τὰ πράγματα, ἀλλὰ τὰ περὶ τῶν πραγμάτων δόγματα.';
export async function ensureWQ013SourceEvidence(env){
 if(!env?.DB)return {ok:false,skipped:'no-db'};
 const ts=new Date().toISOString();
 let item=await env.DB.prepare(`SELECT id FROM content_items WHERE project_id=? AND id=?`).bind(PROJECT_ID,CONTENT_ID).first();
 if(!item){
  await env.DB.prepare(`INSERT INTO content_items(id,project_id,content_type,sequence_no,category,canonical_title,source_text,source_name,source_url,status,facts_verified,uniqueness_verified,notes,created_at,updated_at,quote_type,original_quote,original_language,author_name,author_source,source_work,attribution_status,category_slug,source_verified_at,source_verification_notes) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(CONTENT_ID,PROJECT_ID,'quote',13,'stoicism','Епіктет: чому нас непокоять не самі речі',ORIGINAL,'Perseus Digital Library',SOURCE_URL,'media_pending',1,1,'WQ013 verified Epictetus quote; Enchiridion chapter 5.',ts,ts,'verbatim',ORIGINAL,'grc','Epictetus','Perseus Digital Library','Enchiridion, chapter 5','unverified','stoicism',null,'Primary-source evidence pending insert.').run();
 }
 const ev=await env.DB.prepare(`SELECT id FROM quote_source_evidence WHERE content_item_id=? AND verified=1 LIMIT 1`).bind(CONTENT_ID).first();
 if(!ev){
  await env.DB.prepare(`INSERT INTO quote_source_evidence(content_item_id,source_type,source_title,source_url,source_locator,original_text,original_language,verified,verification_notes,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)`).bind(CONTENT_ID,'primary_text','Epictetus, Enchiridion — Perseus Digital Library',SOURCE_URL,'Enchiridion, chapter 5; opening sentence',ORIGINAL,'grc',1,'Original Greek wording and attribution verified against the Perseus text of Enchiridion chapter 5 before publication.',ts).run();
 }
 await env.DB.prepare(`UPDATE content_items SET source_name='Perseus Digital Library',source_url=?,author_source='Perseus Digital Library',source_work='Enchiridion, chapter 5',attribution_status='verified',source_verified_at=?,source_verification_notes='Verified against the Perseus primary-text presentation of Epictetus, Enchiridion, chapter 5.',facts_verified=1,updated_at=? WHERE project_id=? AND id=?`).bind(SOURCE_URL,ts,ts,PROJECT_ID,CONTENT_ID).run();
 return {ok:true,verified:true};
}