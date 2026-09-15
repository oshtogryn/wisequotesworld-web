-- Wise Quotes World migration 11
-- Runtime lifecycle hardening: schema is created explicitly, never from public/admin request handling.

CREATE TABLE IF NOT EXISTS website_publication_schedule (
  content_item_id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  scheduled_for TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Europe/Stockholm',
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','released','cancelled')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  released_at TEXT,
  last_error TEXT
);

CREATE INDEX IF NOT EXISTS idx_website_publication_schedule_due
  ON website_publication_schedule(project_id,status,scheduled_for);

CREATE TABLE IF NOT EXISTS newsletter_settings (
  project_id TEXT PRIMARY KEY,
  enabled INTEGER NOT NULL DEFAULT 1,
  cadence_days INTEGER NOT NULL DEFAULT 14,
  daily_cap INTEGER NOT NULL DEFAULT 300,
  run_hour_utc INTEGER NOT NULL DEFAULT 8,
  execution_cap INTEGER NOT NULL DEFAULT 40,
  last_run_at TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS newsletter_deliveries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL,
  subscriber_id INTEGER NOT NULL,
  cycle_key TEXT NOT NULL,
  language_code TEXT,
  email_masked TEXT,
  status TEXT NOT NULL,
  provider_message_id TEXT,
  error TEXT,
  sent_at TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(project_id,subscriber_id,cycle_key)
);

CREATE INDEX IF NOT EXISTS idx_newsletter_deliveries_lookup
  ON newsletter_deliveries(project_id,subscriber_id,cycle_key,status);

INSERT INTO newsletter_settings(
  project_id,enabled,cadence_days,daily_cap,run_hour_utc,execution_cap,last_run_at,updated_at
)
SELECT 'wisequotesworld',1,14,300,8,40,NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM newsletter_settings WHERE project_id='wisequotesworld'
);
