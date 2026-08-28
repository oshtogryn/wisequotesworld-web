-- Wise Quotes World schema v3 — automation/media/admin additions
-- 2026-08-28

ALTER TABLE content_items ADD COLUMN quote_type TEXT NOT NULL DEFAULT 'adapted' CHECK (quote_type IN ('adapted','verbatim'));
ALTER TABLE content_items ADD COLUMN original_quote TEXT;
ALTER TABLE content_items ADD COLUMN author_name TEXT;
ALTER TABLE content_items ADD COLUMN author_source TEXT;
ALTER TABLE content_items ADD COLUMN attribution_status TEXT NOT NULL DEFAULT 'not_required' CHECK (attribution_status IN ('not_required','unverified','verified','rejected'));
ALTER TABLE content_items ADD COLUMN category_slug TEXT;

CREATE TABLE IF NOT EXISTS workflow_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  content_item_id INTEGER NOT NULL,
  step_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  detail TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(content_item_id, step_key)
);

CREATE TABLE IF NOT EXISTS required_outputs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  output_key TEXT NOT NULL,
  platform_key TEXT,
  language_code TEXT,
  required INTEGER NOT NULL DEFAULT 1,
  active INTEGER NOT NULL DEFAULT 1,
  UNIQUE(project_id, output_key, language_code)
);

CREATE TABLE IF NOT EXISTS language_style_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  language_code TEXT NOT NULL,
  profile_json TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  active INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, language_code, version)
);

CREATE TABLE IF NOT EXISTS media_inbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  content_item_id INTEGER,
  content_version_id INTEGER,
  r2_key TEXT NOT NULL UNIQUE,
  original_filename TEXT,
  asset_type TEXT NOT NULL,
  language_code TEXT,
  mime_type TEXT,
  size_bytes INTEGER,
  width INTEGER,
  height INTEGER,
  duration_seconds REAL,
  sha256 TEXT,
  status TEXT NOT NULL DEFAULT 'unassigned',
  keep_forever INTEGER NOT NULL DEFAULT 0,
  uploaded_via TEXT,
  expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS media_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  media_inbox_id INTEGER NOT NULL,
  usage_type TEXT NOT NULL,
  platform_key TEXT,
  publication_id INTEGER,
  status TEXT NOT NULL DEFAULT 'ready',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(media_inbox_id, usage_type, platform_key, publication_id)
);

CREATE TABLE IF NOT EXISTS quote_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  slug TEXT NOT NULL,
  canonical_name TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  UNIQUE(project_id, slug)
);

CREATE TABLE IF NOT EXISTS authors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  canonical_name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  bio TEXT,
  verification_notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pinterest_creatives (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  content_item_id INTEGER NOT NULL,
  content_version_id INTEGER NOT NULL,
  language_code TEXT NOT NULL,
  video_concept_summary TEXT NOT NULL,
  still_image_prompt TEXT NOT NULL,
  width INTEGER NOT NULL DEFAULT 1000,
  height INTEGER NOT NULL DEFAULT 1500,
  media_inbox_id INTEGER,
  qa_status TEXT NOT NULL DEFAULT 'pending',
  qa_notes TEXT,
  approved_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(content_version_id)
);

CREATE TABLE IF NOT EXISTS publication_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  publication_id INTEGER,
  provider TEXT NOT NULL,
  request_fingerprint TEXT,
  external_id TEXT,
  status TEXT NOT NULL,
  error_code TEXT,
  error_detail TEXT,
  attempted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_query_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  language_code TEXT,
  intent TEXT,
  matched_content_item_id INTEGER,
  matched_category_slug TEXT,
  response_status TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_media_inbox_content ON media_inbox(content_item_id, language_code, asset_type);
CREATE INDEX IF NOT EXISTS idx_workflow_content ON workflow_steps(content_item_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_query_intent ON ai_query_log(language_code, intent);
