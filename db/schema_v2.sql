PRAGMA foreign_keys=ON;

CREATE TABLE projects (
 id TEXT PRIMARY KEY, name TEXT NOT NULL, timezone TEXT NOT NULL DEFAULT 'Europe/Stockholm', active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE languages (
 code TEXT PRIMARY KEY, name TEXT NOT NULL, native_name TEXT, active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE platforms (
 code TEXT PRIMARY KEY, name TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE project_languages (
 project_id TEXT NOT NULL, language_code TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1,
 PRIMARY KEY(project_id,language_code),
 FOREIGN KEY(project_id) REFERENCES projects(id), FOREIGN KEY(language_code) REFERENCES languages(code)
);
CREATE TABLE social_accounts (
 id TEXT PRIMARY KEY, project_id TEXT NOT NULL, language_code TEXT, platform_code TEXT NOT NULL,
 account_name TEXT, url TEXT, analytics_available INTEGER, publishing_available INTEGER, scheduling_available INTEGER,
 tool TEXT, notes TEXT,
 FOREIGN KEY(project_id) REFERENCES projects(id), FOREIGN KEY(language_code) REFERENCES languages(code), FOREIGN KEY(platform_code) REFERENCES platforms(code)
);
CREATE TABLE rules (
 id INTEGER PRIMARY KEY AUTOINCREMENT, project_id TEXT NOT NULL,
 scope_type TEXT NOT NULL DEFAULT 'project', language_code TEXT, platform_code TEXT,
 rule_group TEXT NOT NULL, rule_key TEXT NOT NULL, rule_value TEXT, notes TEXT,
 mandatory INTEGER NOT NULL DEFAULT 1, status TEXT DEFAULT 'approved', version INTEGER NOT NULL DEFAULT 1,
 effective_from TEXT, source_sheet TEXT, source_row INTEGER,
 FOREIGN KEY(project_id) REFERENCES projects(id),
 FOREIGN KEY(language_code) REFERENCES languages(code), FOREIGN KEY(platform_code) REFERENCES platforms(code)
);
CREATE INDEX idx_rules_scope ON rules(project_id,scope_type,language_code,platform_code);
CREATE TABLE validation_rules (
 id INTEGER PRIMARY KEY AUTOINCREMENT, project_id TEXT NOT NULL, language_code TEXT, platform_code TEXT,
 code TEXT NOT NULL, description TEXT NOT NULL, rule_type TEXT NOT NULL, config_json TEXT,
 severity TEXT NOT NULL DEFAULT 'error', active INTEGER NOT NULL DEFAULT 1,
 FOREIGN KEY(project_id) REFERENCES projects(id)
);
CREATE TABLE content_items (
 id TEXT PRIMARY KEY, project_id TEXT NOT NULL, content_type TEXT NOT NULL, sequence_no INTEGER,
 category TEXT, priority TEXT, canonical_title TEXT, source_text TEXT, source_name TEXT, source_url TEXT,
 status TEXT, facts_verified INTEGER, uniqueness_verified INTEGER, monetization_status TEXT, notes TEXT,
 approved_at TEXT, created_at TEXT, updated_at TEXT,
 FOREIGN KEY(project_id) REFERENCES projects(id)
);
CREATE INDEX idx_content_project_status ON content_items(project_id,status);
CREATE TABLE content_versions (
 id TEXT PRIMARY KEY, content_id TEXT NOT NULL, language_code TEXT NOT NULL,
 title TEXT, hook TEXT, adapted_text TEXT, line_breaks TEXT, key_facts TEXT, voiceover_text TEXT,
 video_concept TEXT, ai_prompt TEXT, on_screen_text TEXT, cta TEXT, status TEXT,
 language_check_status TEXT, approved INTEGER NOT NULL DEFAULT 0, verification_date TEXT, source_urls TEXT,
 editor_notes TEXT, version INTEGER NOT NULL DEFAULT 1,
 FOREIGN KEY(content_id) REFERENCES content_items(id) ON DELETE CASCADE,
 FOREIGN KEY(language_code) REFERENCES languages(code),
 UNIQUE(content_id,language_code,version)
);
CREATE TABLE platform_content (
 id TEXT PRIMARY KEY, content_version_id TEXT NOT NULL, platform_code TEXT NOT NULL, variant TEXT NOT NULL DEFAULT 'main',
 title TEXT, body TEXT, hashtags TEXT, cta TEXT, topic_tag TEXT, char_count INTEGER, status TEXT, notes TEXT,
 FOREIGN KEY(content_version_id) REFERENCES content_versions(id) ON DELETE CASCADE,
 FOREIGN KEY(platform_code) REFERENCES platforms(code)
);
CREATE TABLE prompt_templates (
 id INTEGER PRIMARY KEY AUTOINCREMENT, project_id TEXT NOT NULL, language_code TEXT, platform_code TEXT,
 prompt_type TEXT NOT NULL, name TEXT NOT NULL, template_text TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1,
 active INTEGER NOT NULL DEFAULT 1, notes TEXT,
 FOREIGN KEY(project_id) REFERENCES projects(id)
);
CREATE TABLE media_assets (
 id TEXT PRIMARY KEY, content_version_id TEXT, asset_type TEXT NOT NULL, provider TEXT,
 raw_url TEXT, final_url TEXT, storage_file_id TEXT, generated_at TEXT, duration_seconds REAL,
 aspect_ratio TEXT, resolution TEXT, logo_status TEXT, status TEXT, notes TEXT,
 FOREIGN KEY(content_version_id) REFERENCES content_versions(id) ON DELETE SET NULL
);
CREATE TABLE publications (
 id TEXT PRIMARY KEY, content_version_id TEXT NOT NULL, social_account_id TEXT,
 platform_code TEXT NOT NULL, content_type TEXT, file_url TEXT, text_snapshot TEXT,
 scheduled_at TEXT, published_at TEXT, timezone TEXT DEFAULT 'Europe/Stockholm',
 external_id TEXT, external_url TEXT, status TEXT, notes TEXT,
 FOREIGN KEY(content_version_id) REFERENCES content_versions(id) ON DELETE CASCADE,
 FOREIGN KEY(platform_code) REFERENCES platforms(code)
);
CREATE INDEX idx_publications_schedule ON publications(scheduled_at,status);
CREATE TABLE analytics_snapshots (
 id INTEGER PRIMARY KEY AUTOINCREMENT, project_id TEXT NOT NULL, content_version_id TEXT,
 publication_id TEXT, platform_code TEXT, captured_at TEXT, checkpoint TEXT,
 views INTEGER, reach INTEGER, likes INTEGER, comments INTEGER, shares INTEGER, saves INTEGER,
 interactions INTEGER, followers INTEGER, watch_time_seconds REAL, raw_json TEXT, source TEXT,
 FOREIGN KEY(project_id) REFERENCES projects(id)
);
CREATE TABLE monetization_offers (
 id TEXT PRIMARY KEY, project_id TEXT NOT NULL, content_id TEXT, brand TEXT, revenue_model TEXT, source_network TEXT,
 registration TEXT, program_url TEXT, status TEXT, personal_url TEXT, tracking_url TEXT, tested INTEGER DEFAULT 0,
 notes TEXT, FOREIGN KEY(project_id) REFERENCES projects(id)
);
CREATE TABLE import_rows (
 id INTEGER PRIMARY KEY AUTOINCREMENT, project_id TEXT NOT NULL, source_workbook TEXT NOT NULL,
 source_sheet TEXT NOT NULL, source_row INTEGER NOT NULL, row_json TEXT NOT NULL, imported_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE audit_log (
 id INTEGER PRIMARY KEY AUTOINCREMENT, project_id TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT,
 action TEXT NOT NULL, actor TEXT NOT NULL DEFAULT 'migration', old_json TEXT, new_json TEXT,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
