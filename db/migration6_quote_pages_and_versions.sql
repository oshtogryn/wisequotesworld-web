-- Wise Quotes World migration6 — localized quote pages + approval metadata
-- 2026-08-28
-- Database-first website support. Compatible with TEXT content IDs.

CREATE TABLE IF NOT EXISTS quote_pages (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  content_item_id TEXT NOT NULL,
  content_version_id TEXT NOT NULL,
  language_code TEXT NOT NULL,
  slug TEXT NOT NULL,
  seo_title TEXT,
  meta_description TEXT,
  reflection_title TEXT,
  reflection_body TEXT,
  canonical_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(language_code, slug),
  UNIQUE(content_version_id),
  FOREIGN KEY(project_id) REFERENCES projects(id),
  FOREIGN KEY(content_item_id) REFERENCES content_items(id) ON DELETE CASCADE,
  FOREIGN KEY(content_version_id) REFERENCES content_versions(id) ON DELETE CASCADE,
  FOREIGN KEY(language_code) REFERENCES languages(code)
);

CREATE TABLE IF NOT EXISTS content_approvals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL,
  content_item_id TEXT NOT NULL,
  approval_scope TEXT NOT NULL DEFAULT 'content',
  language_code TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_by TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(content_item_id, approval_scope, language_code),
  FOREIGN KEY(project_id) REFERENCES projects(id),
  FOREIGN KEY(content_item_id) REFERENCES content_items(id) ON DELETE CASCADE,
  FOREIGN KEY(language_code) REFERENCES languages(code)
);

CREATE INDEX IF NOT EXISTS idx_quote_pages_content
  ON quote_pages(content_item_id, language_code, status);
CREATE INDEX IF NOT EXISTS idx_content_approvals_status
  ON content_approvals(content_item_id, status);
