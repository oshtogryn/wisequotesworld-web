const PROJECT_ID='wisequotesworld';
export async function readNewLocalesSourceCatalog(env){
  if(!env?.DB)return {ok:false,error:'DB binding unavailable'};
  const rows=(await env.DB.prepare(`SELECT ci.id content_id,ci.sequence_no,ci.quote_type,ci.author_name,ci.attribution_status,ci.category,ci.category_slug,ci.original_quote,ci.original_language,ci.source_work,cv.title,cv.adapted_text,qp.slug,qp.seo_title,qp.meta_description,qp.reflection_title,qp.reflection_body,qp.canonical_path,qp.status,qp.published_at FROM quote_pages qp JOIN content_versions cv ON cv.id=qp.content_version_id JOIN content_items ci ON ci.id=qp.content_item_id WHERE qp.project_id=? AND qp.language_code='en' AND qp.status='published' ORDER BY COALESCE(ci.sequence_no,CAST(SUBSTR(ci.id,3) AS INTEGER),0),qp.published_at`).bind(PROJECT_ID).all()).results||[];
  return {ok:true,count:rows.length,rows};
}
