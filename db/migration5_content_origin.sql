-- Wise Quotes World migration5 — source verification evidence
-- Apply after schema_v3 + migration4.
-- Compatible with schema_v2/v3 TEXT content_items.id.
-- Note: original_language already exists in schema_v3; do not add it again here.

ALTER TABLE content_items ADD COLUMN source_verified_at TEXT;
ALTER TABLE content_items ADD COLUMN source_verification_notes TEXT;

CREATE TABLE IF NOT EXISTS quote_source_evidence (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_item_id TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_title TEXT,
  source_url TEXT,
  source_locator TEXT,
  original_text TEXT,
  original_language TEXT,
  verified INTEGER NOT NULL DEFAULT 0,
  verification_notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(content_item_id) REFERENCES content_items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_quote_source_evidence_content
  ON quote_source_evidence(content_item_id, verified);
