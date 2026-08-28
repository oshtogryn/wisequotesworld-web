-- Wise Quotes World migration10 — database-enforced guardrails
-- 2026-08-29
-- Critical safety rules are enforced in D1, not only in Admin/Worker UI.
PRAGMA foreign_keys=ON;

-- Adapted/original Wise Quotes thoughts must never retain attribution metadata.
CREATE TRIGGER IF NOT EXISTS trg_content_items_adapted_insert_cleanup
AFTER INSERT ON content_items
WHEN NEW.quote_type='adapted'
BEGIN
  UPDATE content_items
  SET author_name=NULL,
      author_source=NULL,
      source_work=NULL,
      source_date=NULL,
      source_name=NULL,
      attribution_status='not_required'
  WHERE id=NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_content_items_adapted_update_cleanup
AFTER UPDATE OF quote_type,author_name,author_source,source_work,source_date,source_name ON content_items
WHEN NEW.quote_type='adapted' AND (
  NEW.author_name IS NOT NULL OR NEW.author_source IS NOT NULL OR
  NEW.source_work IS NOT NULL OR NEW.source_date IS NOT NULL OR
  NEW.source_name IS NOT NULL OR COALESCE(NEW.attribution_status,'')<>'not_required'
)
BEGIN
  UPDATE content_items
  SET author_name=NULL,
      author_source=NULL,
      source_work=NULL,
      source_date=NULL,
      source_name=NULL,
      attribution_status='not_required'
  WHERE id=NEW.id;
END;

-- A verbatim quote cannot be marked verified without complete source evidence.
CREATE TRIGGER IF NOT EXISTS trg_content_items_verbatim_verified_insert
BEFORE INSERT ON content_items
WHEN NEW.quote_type='verbatim' AND NEW.attribution_status='verified'
BEGIN
  SELECT CASE WHEN
    NULLIF(TRIM(COALESCE(NEW.author_name,'')),'') IS NULL OR
    NULLIF(TRIM(COALESCE(NEW.original_quote,'')),'') IS NULL OR
    NULLIF(TRIM(COALESCE(NEW.original_language,'')),'') IS NULL
  THEN RAISE(ABORT,'verbatim verification requires author, original quote and original language') END;
END;

CREATE TRIGGER IF NOT EXISTS trg_content_items_verbatim_verified_update
BEFORE UPDATE OF attribution_status ON content_items
WHEN NEW.quote_type='verbatim' AND NEW.attribution_status='verified'
BEGIN
  SELECT CASE WHEN
    NULLIF(TRIM(COALESCE(NEW.author_name,'')),'') IS NULL OR
    NULLIF(TRIM(COALESCE(NEW.original_quote,'')),'') IS NULL OR
    NULLIF(TRIM(COALESCE(NEW.original_language,'')),'') IS NULL OR
    NOT EXISTS (
      SELECT 1 FROM quote_source_evidence q
      WHERE q.content_item_id=NEW.id
        AND q.verified=1
        AND NULLIF(TRIM(COALESCE(q.original_text,'')),'') IS NOT NULL
        AND NULLIF(TRIM(COALESCE(q.original_language,'')),'') IS NOT NULL
        AND NULLIF(TRIM(COALESCE(q.source_locator,'')),'') IS NOT NULL
        AND NULLIF(TRIM(COALESCE(q.verification_notes,'')),'') IS NOT NULL
        AND (
          NULLIF(TRIM(COALESCE(q.source_title,'')),'') IS NOT NULL OR
          NULLIF(TRIM(COALESCE(q.source_url,'')),'') IS NOT NULL
        )
    )
  THEN RAISE(ABORT,'verbatim verification requires complete verified source evidence') END;
END;

-- Explicit content approval cannot be granted to incomplete verbatim attribution.
CREATE TRIGGER IF NOT EXISTS trg_content_approvals_verified_source_insert
BEFORE INSERT ON content_approvals
WHEN NEW.status='approved' AND NEW.approval_scope='content'
BEGIN
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM content_items c
    WHERE c.id=NEW.content_item_id
      AND c.project_id=NEW.project_id
      AND (
        c.quote_type<>'verbatim' OR (
          c.attribution_status='verified'
          AND c.source_verified_at IS NOT NULL
          AND NULLIF(TRIM(COALESCE(c.author_name,'')),'') IS NOT NULL
          AND NULLIF(TRIM(COALESCE(c.original_quote,'')),'') IS NOT NULL
          AND NULLIF(TRIM(COALESCE(c.original_language,'')),'') IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM quote_source_evidence q
            WHERE q.content_item_id=c.id AND q.verified=1
              AND NULLIF(TRIM(COALESCE(q.original_text,'')),'') IS NOT NULL
              AND NULLIF(TRIM(COALESCE(q.original_language,'')),'') IS NOT NULL
              AND NULLIF(TRIM(COALESCE(q.source_locator,'')),'') IS NOT NULL
              AND NULLIF(TRIM(COALESCE(q.verification_notes,'')),'') IS NOT NULL
              AND (NULLIF(TRIM(COALESCE(q.source_title,'')),'') IS NOT NULL OR NULLIF(TRIM(COALESCE(q.source_url,'')),'') IS NOT NULL)
          )
        )
      )
  ) THEN RAISE(ABORT,'content approval blocked: source verification incomplete') END;

  SELECT CASE WHEN (
    SELECT COUNT(DISTINCT language_code) FROM content_versions WHERE content_id=NEW.content_item_id
  ) < 8 THEN RAISE(ABORT,'content approval blocked: all 8 language versions are required') END;
END;

CREATE TRIGGER IF NOT EXISTS trg_content_approvals_verified_source_update
BEFORE UPDATE OF status ON content_approvals
WHEN NEW.status='approved' AND NEW.approval_scope='content'
BEGIN
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM content_items c
    WHERE c.id=NEW.content_item_id
      AND c.project_id=NEW.project_id
      AND (
        c.quote_type<>'verbatim' OR (
          c.attribution_status='verified'
          AND c.source_verified_at IS NOT NULL
          AND NULLIF(TRIM(COALESCE(c.author_name,'')),'') IS NOT NULL
          AND NULLIF(TRIM(COALESCE(c.original_quote,'')),'') IS NOT NULL
          AND NULLIF(TRIM(COALESCE(c.original_language,'')),'') IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM quote_source_evidence q
            WHERE q.content_item_id=c.id AND q.verified=1
              AND NULLIF(TRIM(COALESCE(q.original_text,'')),'') IS NOT NULL
              AND NULLIF(TRIM(COALESCE(q.original_language,'')),'') IS NOT NULL
              AND NULLIF(TRIM(COALESCE(q.source_locator,'')),'') IS NOT NULL
              AND NULLIF(TRIM(COALESCE(q.verification_notes,'')),'') IS NOT NULL
              AND (NULLIF(TRIM(COALESCE(q.source_title,'')),'') IS NOT NULL OR NULLIF(TRIM(COALESCE(q.source_url,'')),'') IS NOT NULL)
          )
        )
      )
  ) THEN RAISE(ABORT,'content approval blocked: source verification incomplete') END;

  SELECT CASE WHEN (
    SELECT COUNT(DISTINCT language_code) FROM content_versions WHERE content_id=NEW.content_item_id
  ) < 8 THEN RAISE(ABORT,'content approval blocked: all 8 language versions are required') END;
END;

-- No publication may enter scheduled/published state without explicit content approval.
CREATE TRIGGER IF NOT EXISTS trg_publications_require_approval_insert
BEFORE INSERT ON publications
WHEN NEW.status IN ('scheduled','publishing','published')
BEGIN
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1
    FROM content_versions cv
    JOIN content_approvals ca ON ca.content_item_id=cv.content_id
    WHERE cv.id=NEW.content_version_id
      AND ca.approval_scope='content'
      AND ca.language_code IS NULL
      AND ca.status='approved'
  ) THEN RAISE(ABORT,'publication blocked: content approval required') END;
END;

CREATE TRIGGER IF NOT EXISTS trg_publications_require_approval_update
BEFORE UPDATE OF status ON publications
WHEN NEW.status IN ('scheduled','publishing','published')
BEGIN
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1
    FROM content_versions cv
    JOIN content_approvals ca ON ca.content_item_id=cv.content_id
    WHERE cv.id=NEW.content_version_id
      AND ca.approval_scope='content'
      AND ca.language_code IS NULL
      AND ca.status='approved'
  ) THEN RAISE(ABORT,'publication blocked: content approval required') END;
END;

INSERT INTO rules(project_id,scope_type,language_code,platform_code,rule_group,rule_key,rule_value,notes,mandatory,status,version,effective_from)
SELECT 'wisequotesworld','project',NULL,NULL,'database_guardrails','d1_hard_publication_gate',
'D1 triggers enforce adapted attribution cleanup, verbatim source verification, eight-language content approval, and publication approval before scheduled/publishing/published states.',
'Critical guardrails remain active even if Admin or Worker validation is bypassed.',1,'approved',1,'2026-08-29'
WHERE NOT EXISTS (SELECT 1 FROM rules WHERE project_id='wisequotesworld' AND rule_key='d1_hard_publication_gate' AND version=1);
