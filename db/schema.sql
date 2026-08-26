CREATE TABLE IF NOT EXISTS authors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  canonical_name TEXT NOT NULL,
  birth_year INTEGER,
  death_year INTEGER,
  bio_source_url TEXT,
  verified INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author_id INTEGER,
  source_language TEXT,
  source_text TEXT NOT NULL,
  source_work TEXT,
  source_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'unverified',
  theme_slug TEXT,
  featured INTEGER NOT NULL DEFAULT 0,
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(author_id) REFERENCES authors(id)
);

CREATE TABLE IF NOT EXISTS quote_translations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id INTEGER NOT NULL,
  language TEXT NOT NULL,
  text TEXT NOT NULL,
  slug TEXT NOT NULL,
  seo_title TEXT,
  seo_description TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  UNIQUE(quote_id, language),
  UNIQUE(language, slug),
  FOREIGN KEY(quote_id) REFERENCES quotes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS author_translations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author_id INTEGER NOT NULL,
  language TEXT NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  seo_title TEXT,
  seo_description TEXT,
  UNIQUE(author_id, language),
  FOREIGN KEY(author_id) REFERENCES authors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS publications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id INTEGER NOT NULL,
  language TEXT NOT NULL,
  platform TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned',
  scheduled_at TEXT,
  post_url TEXT,
  external_id TEXT,
  FOREIGN KEY(quote_id) REFERENCES quotes(id) ON DELETE CASCADE
);
