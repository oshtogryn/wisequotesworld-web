-- Wise Quotes World migration8 — AI generation jobs + Pinterest generation state
-- 2026-08-28
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS ai_generation_jobs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  content_item_id TEXT NOT NULL,
  content_version_id TEXT,
  language_code TEXT,
  job_type TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'cloudflare-workers-ai',
  model TEXT,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  attempt_count INTEGER NOT NULL DEFAULT 0,
  media_inbox_id TEXT,
  error_detail TEXT,
  requested_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  started_at TEXT,
  finished_at TEXT,
  FOREIGN KEY(project_id) REFERENCES projects(id),
  FOREIGN KEY(content_item_id) REFERENCES content_items(id) ON DELETE CASCADE,
  FOREIGN KEY(content_version_id) REFERENCES content_versions(id) ON DELETE CASCADE,
  FOREIGN KEY(language_code) REFERENCES languages(code),
  FOREIGN KEY(media_inbox_id) REFERENCES media_inbox(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_generation_jobs_queue
  ON ai_generation_jobs(project_id,status,job_type,requested_at);
CREATE INDEX IF NOT EXISTS idx_ai_generation_jobs_content
  ON ai_generation_jobs(content_item_id,language_code,job_type);

INSERT INTO rules(project_id,scope_type,language_code,platform_code,rule_group,rule_key,rule_value,notes,mandatory,status,version,effective_from)
SELECT 'wisequotesworld','project',NULL,'pinterest','ai_generation','pinterest_auto_generate',
'For every content version, automatically create a Pinterest 2:3 creative derived from the same semantic visual concept as the video. Use Workers AI image generation when AI binding is available, save the binary to R2, metadata to D1, set qa_status=pending, and never auto-publish before visual QA and content approval.',
'Automated Pinterest generation agreed for Wise Quotes World.',1,'approved',1,'2026-08-28'
WHERE NOT EXISTS (
  SELECT 1 FROM rules WHERE project_id='wisequotesworld' AND rule_key='pinterest_auto_generate' AND version=1
);

INSERT INTO rules(project_id,scope_type,language_code,platform_code,rule_group,rule_key,rule_value,notes,mandatory,status,version,effective_from)
SELECT 'wisequotesworld','project',NULL,NULL,'ai_generation','ai_output_storage',
'AI-generated canonical media must be stored in Wise Quotes World R2. D1 stores generation job, model, prompt, QA state and media link. A generated asset is not approved merely because generation succeeded.',
'R2 remains canonical binary media store.',1,'approved',1,'2026-08-28'
WHERE NOT EXISTS (
  SELECT 1 FROM rules WHERE project_id='wisequotesworld' AND rule_key='ai_output_storage' AND version=1
);
