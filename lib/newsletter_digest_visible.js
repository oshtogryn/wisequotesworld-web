import {renderDigest,digestCopy} from './newsletter_digest.js';

const PROJECT_ID='wisequotesworld';

function normLocale(v){
  const raw=String(v||'en').toLowerCase();
  return raw==='pt-br'?'pt':raw;
}

// Newsletter eligibility follows the same editorial visibility contract as public
// discovery surfaces. Direct/indexable article publication alone is not enough.
export async function latestDigestArticles(env,languageCode,limit=5){
  const locale=normLocale(languageCode);
  const n=Math.max(3,Math.min(6,Number(limit)||5));
  const q=`SELECT qp.content_item_id,qp.slug,qp.seo_title,qp.meta_description,qp.canonical_path,
      cv.adapted_text,ci.author_name,ci.attribution_status,ci.sequence_no
    FROM quote_pages qp
    JOIN content_versions cv ON cv.id=qp.content_version_id
    JOIN content_items ci ON ci.id=qp.content_item_id
    WHERE qp.project_id=?
      AND qp.language_code=?
      AND qp.status='published'
      AND ci.project_id=?
      AND ci.status='published'
      AND (
        COALESCE(ci.sequence_no,CAST(SUBSTR(ci.id,3) AS INTEGER),0)<=15
        OR EXISTS (
          SELECT 1 FROM content_approvals sva
          WHERE sva.content_item_id=ci.id
            AND sva.approval_scope='website_visibility'
            AND sva.language_code IS NULL
            AND sva.status='approved'
        )
        OR EXISTS (
          SELECT 1 FROM website_publication_schedule ws
          WHERE ws.content_item_id=ci.id
            AND ws.project_id=?
            AND ws.status='scheduled'
            AND ws.scheduled_for<=strftime('%Y-%m-%dT%H:%M:%fZ','now')
        )
      )
    ORDER BY COALESCE(ci.sequence_no,CAST(SUBSTR(ci.id,3) AS INTEGER),0) DESC
    LIMIT ?`;
  const r=await env.DB.prepare(q).bind(PROJECT_ID,locale,PROJECT_ID,PROJECT_ID,n).all();
  return r.results||[];
}

export {renderDigest,digestCopy};
