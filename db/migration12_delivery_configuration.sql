-- Wise Quotes World migration12 — configuration-driven delivery model
-- 2026-09-10
-- IMPORTANT: validate on staging D1 before production.
-- Separates website-language readiness from social delivery/provider state.
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS delivery_channels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL,
  language_code TEXT NOT NULL,
  channel_type TEXT NOT NULL CHECK (channel_type IN ('website','social')),
  provider TEXT,
  delivery_mode TEXT NOT NULL CHECK (delivery_mode IN ('automatic','manual','prepared','disabled')),
  active INTEGER NOT NULL DEFAULT 1,
  effective_from TEXT,
  notes TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id,language_code,channel_type),
  FOREIGN KEY(project_id) REFERENCES projects(id),
  FOREIGN KEY(language_code) REFERENCES languages(code)
);

-- All 13 website locales are active.
INSERT INTO delivery_channels(project_id,language_code,channel_type,provider,delivery_mode,active,effective_from,notes)
SELECT 'wisequotesworld',l.code,'website','wisequotesworld','automatic',1,'2026-09-10','All website locales require prepared/indexable quote pages.'
FROM languages l
WHERE l.code IN ('uk','ru','pl','en','sv','de','es','fr','it','pt','id','tr','ar')
ON CONFLICT(project_id,language_code,channel_type) DO UPDATE SET
 provider=excluded.provider,delivery_mode=excluded.delivery_mode,active=excluded.active,notes=excluded.notes,updated_at=CURRENT_TIMESTAMP;

-- Current temporary social state. This is intentionally data-driven and may
-- be updated without code changes when the remaining Metricool brands are connected.
INSERT INTO delivery_channels(project_id,language_code,channel_type,provider,delivery_mode,active,effective_from,notes) VALUES
('wisequotesworld','uk','social','metricool','automatic',1,'2026-09-10','Temporary Metricool-connected locale'),
('wisequotesworld','ru','social','metricool','automatic',1,'2026-09-10','Temporary Metricool-connected locale'),
('wisequotesworld','pl','social','metricool','automatic',1,'2026-09-10','Temporary Metricool-connected locale'),
('wisequotesworld','en','social','metricool','automatic',1,'2026-09-10','Temporary Metricool-connected locale'),
('wisequotesworld','sv','social','metricool','automatic',1,'2026-09-10','Temporary Metricool-connected locale'),
('wisequotesworld','de','social','metricool','automatic',1,'2026-09-10','Temporary Metricool-connected locale'),
('wisequotesworld','es','social','metricool','automatic',1,'2026-09-10','Temporary Metricool-connected locale'),
('wisequotesworld','fr','social','metricool','automatic',1,'2026-09-10','Temporary Metricool-connected locale'),
('wisequotesworld','it','social','manual','manual',1,'2026-09-10','Temporary manual publication until Metricool connection'),
('wisequotesworld','pt','social','manual','manual',1,'2026-09-10','Temporary manual publication until Metricool connection'),
('wisequotesworld','id','social',NULL,'prepared',0,'2026-09-10','Prepare content/media; social account not yet connected'),
('wisequotesworld','tr','social',NULL,'prepared',0,'2026-09-10','Prepare content/media; social account not yet connected'),
('wisequotesworld','ar','social',NULL,'prepared',0,'2026-09-10','Prepare content/media; social account not yet connected')
ON CONFLICT(project_id,language_code,channel_type) DO UPDATE SET
 provider=excluded.provider,delivery_mode=excluded.delivery_mode,active=excluded.active,notes=excluded.notes,updated_at=CURRENT_TIMESTAMP;

-- Replace the historical hard-coded “8 language versions” content-approval
-- trigger with a website-locale count derived from configuration. This avoids
-- turning the temporary Metricool count into a permanent content invariant.
DROP TRIGGER IF EXISTS trg_content_approvals_verified_source_insert;
DROP TRIGGER IF EXISTS trg_content_approvals_verified_source_update;

CREATE TRIGGER trg_content_approvals_verified_source_insert
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
    SELECT COUNT(DISTINCT cv.language_code)
    FROM content_versions cv
    JOIN delivery_channels dc
      ON dc.project_id=NEW.project_id
     AND dc.language_code=cv.language_code
     AND dc.channel_type='website'
     AND dc.active=1
    WHERE cv.content_id=NEW.content_item_id
  ) < (
    SELECT COUNT(*) FROM delivery_channels
    WHERE project_id=NEW.project_id AND channel_type='website' AND active=1
  ) THEN RAISE(ABORT,'content approval blocked: all active website languages are required') END;
END;

CREATE TRIGGER trg_content_approvals_verified_source_update
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
    SELECT COUNT(DISTINCT cv.language_code)
    FROM content_versions cv
    JOIN delivery_channels dc
      ON dc.project_id=NEW.project_id
     AND dc.language_code=cv.language_code
     AND dc.channel_type='website'
     AND dc.active=1
    WHERE cv.content_id=NEW.content_item_id
  ) < (
    SELECT COUNT(*) FROM delivery_channels
    WHERE project_id=NEW.project_id AND channel_type='website' AND active=1
  ) THEN RAISE(ABORT,'content approval blocked: all active website languages are required') END;
END;

INSERT INTO rules(project_id,scope_type,language_code,platform_code,rule_group,rule_key,rule_value,notes,mandatory,status,version,effective_from)
SELECT 'wisequotesworld','project',NULL,NULL,'delivery','delivery_configuration_driven',
'Website readiness and social delivery are separate configuration-driven concepts. Website currently has 13 active locales. Social provider mode must be read from delivery configuration and must not treat the temporary 8 Metricool locales as a permanent invariant.',
'Near-term target is all 13 Wise Quotes World locales in Metricool; Italy and pt-BR are temporarily manual.',1,'approved',1,'2026-09-10'
WHERE NOT EXISTS (SELECT 1 FROM rules WHERE project_id='wisequotesworld' AND rule_key='delivery_configuration_driven' AND version=1);
