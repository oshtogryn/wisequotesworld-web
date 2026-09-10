-- Wise Quotes World migration11 — platform hardening foundation
-- 2026-09-10
-- Non-destructive schema additions for auditability, provenance, media QA,
-- newsletter suppression, job observability and backup evidence.
-- IMPORTANT: validate on staging D1 before production.
PRAGMA foreign_keys=ON;

-- 1. Status-transition history. This complements the older generic audit_log
-- and guarantees a minimum history even when a status change does not pass
-- through a particular application module.
CREATE TABLE IF NOT EXISTS status_transition_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL DEFAULT 'wisequotesworld',
  content_id TEXT,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT,
  changed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  changed_by TEXT NOT NULL DEFAULT 'database-trigger',
  source TEXT NOT NULL DEFAULT 'd1-trigger',
  verification TEXT
);
CREATE INDEX IF NOT EXISTS idx_status_transition_content
  ON status_transition_log(project_id,content_id,changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_status_transition_entity
  ON status_transition_log(entity_type,entity_id,changed_at DESC);

CREATE TRIGGER IF NOT EXISTS trg_status_content_items
AFTER UPDATE OF status ON content_items
WHEN COALESCE(OLD.status,'') <> COALESCE(NEW.status,'')
BEGIN
  INSERT INTO status_transition_log(project_id,content_id,entity_type,entity_id,old_status,new_status)
  VALUES(COALESCE(NEW.project_id,'wisequotesworld'),NEW.id,'content_item',NEW.id,OLD.status,NEW.status);
END;

CREATE TRIGGER IF NOT EXISTS trg_status_content_versions
AFTER UPDATE OF status ON content_versions
WHEN COALESCE(OLD.status,'') <> COALESCE(NEW.status,'')
BEGIN
  INSERT INTO status_transition_log(project_id,content_id,entity_type,entity_id,old_status,new_status)
  VALUES('wisequotesworld',NEW.content_id,'content_version',NEW.id,OLD.status,NEW.status);
END;

CREATE TRIGGER IF NOT EXISTS trg_status_quote_pages
AFTER UPDATE OF status ON quote_pages
WHEN COALESCE(OLD.status,'') <> COALESCE(NEW.status,'')
BEGIN
  INSERT INTO status_transition_log(project_id,content_id,entity_type,entity_id,old_status,new_status)
  VALUES(COALESCE(NEW.project_id,'wisequotesworld'),NEW.content_item_id,'quote_page',NEW.id,OLD.status,NEW.status);
END;

CREATE TRIGGER IF NOT EXISTS trg_status_publications
AFTER UPDATE OF status ON publications
WHEN COALESCE(OLD.status,'') <> COALESCE(NEW.status,'')
BEGIN
  INSERT INTO status_transition_log(project_id,content_id,entity_type,entity_id,old_status,new_status)
  VALUES(
    'wisequotesworld',
    (SELECT content_id FROM content_versions WHERE id=NEW.content_version_id LIMIT 1),
    'publication',NEW.id,OLD.status,NEW.status
  );
END;

CREATE TRIGGER IF NOT EXISTS trg_status_workflow_steps
AFTER UPDATE OF status ON workflow_steps
WHEN COALESCE(OLD.status,'') <> COALESCE(NEW.status,'')
BEGIN
  INSERT INTO status_transition_log(project_id,content_id,entity_type,entity_id,old_status,new_status)
  VALUES(COALESCE(NEW.project_id,'wisequotesworld'),NEW.content_item_id,'workflow_step',CAST(NEW.id AS TEXT),OLD.status,NEW.status);
END;

CREATE TRIGGER IF NOT EXISTS trg_status_content_approvals
AFTER UPDATE OF status ON content_approvals
WHEN COALESCE(OLD.status,'') <> COALESCE(NEW.status,'')
BEGIN
  INSERT INTO status_transition_log(project_id,content_id,entity_type,entity_id,old_status,new_status)
  VALUES(COALESCE(NEW.project_id,'wisequotesworld'),NEW.content_item_id,'content_approval',CAST(NEW.id AS TEXT),OLD.status,NEW.status);
END;

-- 2. Explicit quote provenance model. Existing content_items attribution fields
-- remain for compatibility; this table is the normalized source-of-record for
-- provenance depth and future discovery/verification UI.
CREATE TABLE IF NOT EXISTS quote_provenance (
  content_item_id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL DEFAULT 'wisequotesworld',
  quote_text TEXT,
  author TEXT,
  provenance_type TEXT NOT NULL DEFAULT 'original_reflection'
    CHECK (provenance_type IN ('verbatim','paraphrase','attributed','original_reflection')),
  source TEXT,
  source_url TEXT,
  source_work TEXT,
  source_year TEXT,
  edition TEXT,
  page TEXT,
  attribution_status TEXT NOT NULL DEFAULT 'not_required'
    CHECK (attribution_status IN ('not_required','unverified','verified','rejected')),
  verified_at TEXT,
  translation_type TEXT
    CHECK (translation_type IS NULL OR translation_type IN ('original','human','adapted','machine_assisted','unknown')),
  translator TEXT,
  public_domain_status TEXT
    CHECK (public_domain_status IS NULL OR public_domain_status IN ('public_domain','copyrighted','unknown','not_applicable')),
  source_quality TEXT
    CHECK (source_quality IS NULL OR source_quality IN ('primary','scholarly','reputable_secondary','weak_secondary','unknown')),
  confidence_score REAL CHECK (confidence_score IS NULL OR (confidence_score>=0 AND confidence_score<=1)),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(content_item_id) REFERENCES content_items(id) ON DELETE CASCADE,
  FOREIGN KEY(project_id) REFERENCES projects(id)
);
CREATE INDEX IF NOT EXISTS idx_quote_provenance_status
  ON quote_provenance(project_id,provenance_type,attribution_status,source_quality);

-- 3. Media validation. Binary remains in R2; media_inbox remains canonical
-- metadata identity. This table stores deterministic validation output.
CREATE TABLE IF NOT EXISTS media_validation (
  media_inbox_id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL DEFAULT 'wisequotesworld',
  asset_profile TEXT,
  width INTEGER,
  height INTEGER,
  aspect_ratio REAL,
  duration_seconds REAL,
  file_size_bytes INTEGER,
  codec TEXT,
  container TEXT,
  automated_qa_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (automated_qa_status IN ('pending','passed','failed','warning')),
  manual_qa_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (manual_qa_status IN ('pending','approved','rejected')),
  checks_json TEXT,
  duplicate_of_media_id TEXT,
  validated_at TEXT,
  reviewed_at TEXT,
  reviewed_by TEXT,
  notes TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(media_inbox_id) REFERENCES media_inbox(id) ON DELETE CASCADE,
  FOREIGN KEY(duplicate_of_media_id) REFERENCES media_inbox(id) ON DELETE SET NULL,
  FOREIGN KEY(project_id) REFERENCES projects(id)
);
CREATE INDEX IF NOT EXISTS idx_media_inbox_sha256
  ON media_inbox(project_id,sha256);
CREATE INDEX IF NOT EXISTS idx_media_validation_status
  ON media_validation(project_id,automated_qa_status,manual_qa_status);

-- 4. Newsletter provider events and suppressions. Store subscriber identity by
-- subscriber row id; do not duplicate plaintext e-mail into event logs.
CREATE TABLE IF NOT EXISTS newsletter_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL DEFAULT 'wisequotesworld',
  subscriber_id INTEGER,
  delivery_id INTEGER,
  event_type TEXT NOT NULL
    CHECK (event_type IN ('reserved','sent','delivered','soft_bounce','hard_bounce','complaint','unsubscribe','retry','failed')),
  provider TEXT,
  provider_event_id TEXT,
  detail TEXT,
  occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_provider_event
  ON newsletter_events(provider,provider_event_id)
  WHERE provider_event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_newsletter_events_subscriber
  ON newsletter_events(project_id,subscriber_id,occurred_at DESC);

CREATE TABLE IF NOT EXISTS newsletter_suppressions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL DEFAULT 'wisequotesworld',
  subscriber_id INTEGER NOT NULL,
  reason TEXT NOT NULL
    CHECK (reason IN ('hard_bounce','complaint','unsubscribe','manual')),
  provider TEXT,
  provider_event_id TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cleared_at TEXT,
  notes TEXT,
  UNIQUE(project_id,subscriber_id,reason)
);
CREATE INDEX IF NOT EXISTS idx_newsletter_suppressions_active
  ON newsletter_suppressions(project_id,subscriber_id,active);

-- 5. Background job observability.
CREATE TABLE IF NOT EXISTS job_runs (
  job_id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL DEFAULT 'wisequotesworld',
  job_type TEXT NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  attempt INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL
    CHECK (status IN ('started','queued','running','succeeded','failed','retrying','cancelled','skipped')),
  source TEXT,
  correlation_id TEXT,
  processed_count INTEGER,
  success_count INTEGER,
  failure_count INTEGER,
  error TEXT,
  metadata_json TEXT
);
CREATE INDEX IF NOT EXISTS idx_job_runs_type_time
  ON job_runs(project_id,job_type,started_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_runs_failures
  ON job_runs(project_id,status,started_at DESC);

CREATE TABLE IF NOT EXISTS health_check_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL DEFAULT 'wisequotesworld',
  component TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ok','degraded','down','unknown')),
  latency_ms INTEGER,
  detail TEXT,
  checked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_health_component_time
  ON health_check_snapshots(project_id,component,checked_at DESC);

-- 6. Backup evidence and restore-drill history.
CREATE TABLE IF NOT EXISTS backup_runs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL DEFAULT 'wisequotesworld',
  backup_type TEXT NOT NULL CHECK (backup_type IN ('daily','weekly','monthly','manual','restore_test')),
  target TEXT,
  status TEXT NOT NULL CHECK (status IN ('started','succeeded','failed','verified')),
  object_key TEXT,
  checksum TEXT,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  error TEXT,
  metadata_json TEXT
);
CREATE INDEX IF NOT EXISTS idx_backup_runs_time
  ON backup_runs(project_id,backup_type,started_at DESC);

-- Machine-readable canonical rules for the new controls.
INSERT INTO rules(project_id,scope_type,language_code,platform_code,rule_group,rule_key,rule_value,notes,mandatory,status,version,effective_from)
SELECT 'wisequotesworld','project',NULL,NULL,'audit','status_transition_history',
'Every status transition must be persisted with old/new status, timestamp, actor/source and verification when available. Database triggers provide the minimum fallback history.',
'Application code should enrich actor/source/verification for explicit admin, scheduler and provider actions.',1,'approved',1,'2026-09-10'
WHERE NOT EXISTS (SELECT 1 FROM rules WHERE project_id='wisequotesworld' AND rule_key='status_transition_history' AND version=1);

INSERT INTO rules(project_id,scope_type,language_code,platform_code,rule_group,rule_key,rule_value,notes,mandatory,status,version,effective_from)
SELECT 'wisequotesworld','project',NULL,NULL,'provenance','provenance_classification',
'Quote provenance is explicitly classified as verbatim, paraphrase, attributed, or original_reflection. Verbatim may be presented as verified only with verified source evidence.',
'Legacy quote_type adapted/verbatim remains for compatibility until the content model migration is complete.',1,'approved',1,'2026-09-10'
WHERE NOT EXISTS (SELECT 1 FROM rules WHERE project_id='wisequotesworld' AND rule_key='provenance_classification' AND version=1);

INSERT INTO rules(project_id,scope_type,language_code,platform_code,rule_group,rule_key,rule_value,notes,mandatory,status,version,effective_from)
SELECT 'wisequotesworld','project',NULL,NULL,'media','media_hash_and_qa',
'Every new R2 media upload must compute SHA-256, detect duplicates, record technical metadata, pass automated profile checks and then manual QA before publication.',
'Unknown dimensions/duration must remain unknown rather than being invented from target prompt dimensions.',1,'approved',1,'2026-09-10'
WHERE NOT EXISTS (SELECT 1 FROM rules WHERE project_id='wisequotesworld' AND rule_key='media_hash_and_qa' AND version=1);

INSERT INTO rules(project_id,scope_type,language_code,platform_code,rule_group,rule_key,rule_value,notes,mandatory,status,version,effective_from)
SELECT 'wisequotesworld','project',NULL,NULL,'newsletter','newsletter_async_delivery',
'Newsletter delivery must execute asynchronously through scheduled selection plus queue/consumer processing. Hard bounces, complaints and unsubscribes suppress future delivery. Hidden/non-public articles are never eligible.',
'Pages may be a queue producer but queue consumption requires a Worker consumer.',1,'approved',1,'2026-09-10'
WHERE NOT EXISTS (SELECT 1 FROM rules WHERE project_id='wisequotesworld' AND rule_key='newsletter_async_delivery' AND version=1);
