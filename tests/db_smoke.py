from pathlib import Path
import sqlite3

ROOT = Path(__file__).resolve().parents[1]
DB = sqlite3.connect(':memory:')
DB.execute('PRAGMA foreign_keys=ON')


def run(path):
    DB.executescript((ROOT / path).read_text(encoding='utf-8'))


run('db/schema_v2.sql')
DB.execute("INSERT INTO projects(id,name,timezone,active) VALUES('wisequotesworld','Wise Quotes World','Europe/Stockholm',1)")
for code, name in [('uk','Ukrainian'),('ru','Russian'),('pl','Polish'),('en','English'),('sv','Swedish'),('de','German'),('es','Spanish')]:
    DB.execute('INSERT INTO languages(code,name,native_name,active) VALUES(?,?,?,1)', (code, name, name))
for code in ['website','pinterest','facebook','instagram','threads','tiktok','youtube']:
    DB.execute('INSERT INTO platforms(code,name,active) VALUES(?,?,1)', (code, code.title()))
DB.commit()

for path in [
    'db/schema_v3.sql',
    'db/migration4_prepare_fr_and_cutover.sql',
    'db/migration5_content_origin.sql',
    'db/migration6_quote_pages_and_versions.sql',
    'db/migration7_seed_required_outputs.sql',
    'db/migration8_ai_generation.sql',
    'db/migration9_runtime_hardening.sql',
    'db/migration10_database_guardrails.sql',
]:
    run(path)

# Schema/rules expected after v10.
assert DB.execute("SELECT 1 FROM languages WHERE code='fr'").fetchone()
assert DB.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='ai_generation_jobs'").fetchone()
assert DB.execute("SELECT 1 FROM sqlite_master WHERE type='trigger' AND name='trg_publications_require_approval_insert'").fetchone()
assert DB.execute("SELECT status FROM rules WHERE rule_key='fr_social_disabled_until_connected'").fetchone()[0] == 'superseded'
assert DB.execute("SELECT 1 FROM rules WHERE rule_key='fr_website_enabled' AND status='approved'").fetchone()
assert DB.execute("SELECT 1 FROM rules WHERE rule_key='fr_pinterest_enabled' AND status='approved'").fetchone()

# Adapted quote attribution is scrubbed by D1 even if a caller attempts to store it.
DB.execute("""
INSERT INTO content_items(
 id,project_id,content_type,canonical_title,source_text,source_name,status,created_at,updated_at,
 quote_type,original_quote,original_language,author_name,author_source,source_work,source_date,attribution_status
) VALUES('TEST_ADAPTED','wisequotesworld','quote','Test','Test','Fake Author','idea',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,
'adapted','Test','en','Fake Author','fake source','fake work','2020','verified')
""")
row = DB.execute("SELECT author_name,author_source,source_work,source_date,source_name,attribution_status FROM content_items WHERE id='TEST_ADAPTED'").fetchone()
assert row == (None, None, None, None, None, 'not_required')

# Verbatim verification cannot be asserted without complete evidence.
DB.execute("""
INSERT INTO content_items(
 id,project_id,content_type,canonical_title,source_text,status,created_at,updated_at,
 quote_type,original_quote,original_language,author_name,attribution_status
) VALUES('TEST_VERBATIM','wisequotesworld','quote','Test V','Original','idea',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,
'verbatim','Original','de','Author','unverified')
""")
blocked = False
try:
    DB.execute("UPDATE content_items SET attribution_status='verified' WHERE id='TEST_VERBATIM'")
except sqlite3.IntegrityError:
    blocked = True
assert blocked, 'verbatim verification must be blocked without evidence'

DB.execute("""
INSERT INTO quote_source_evidence(
 content_item_id,source_type,source_title,source_url,source_locator,original_text,original_language,verified,verification_notes,created_at
) VALUES('TEST_VERBATIM','book','Primary Work','https://example.test/source','chapter 1','Original','de',1,'Checked against primary source',CURRENT_TIMESTAMP)
""")
DB.execute("UPDATE content_items SET source_verified_at=CURRENT_TIMESTAMP,source_verification_notes='checked',attribution_status='verified' WHERE id='TEST_VERBATIM'")
assert DB.execute("SELECT attribution_status FROM content_items WHERE id='TEST_VERBATIM'").fetchone()[0] == 'verified'

# Content approval is blocked until all eight language versions exist.
DB.execute("INSERT INTO content_approvals(project_id,content_item_id,approval_scope,status,created_at,updated_at) VALUES('wisequotesworld','TEST_VERBATIM','content','pending',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)")
blocked = False
try:
    DB.execute("UPDATE content_approvals SET status='approved' WHERE content_item_id='TEST_VERBATIM' AND approval_scope='content'")
except sqlite3.IntegrityError:
    blocked = True
assert blocked, 'approval must require eight locales'

for lang in ['uk','ru','pl','en','sv','de','es','fr']:
    DB.execute("""
    INSERT INTO content_versions(id,content_id,language_code,adapted_text,status,version)
    VALUES(?,?,?,?,?,1)
    """, (f'TEST_VERBATIM_{lang}_v1','TEST_VERBATIM',lang,f'Text {lang}','localized'))
DB.execute("UPDATE content_approvals SET status='approved' WHERE content_item_id='TEST_VERBATIM' AND approval_scope='content'")
assert DB.execute("SELECT status FROM content_approvals WHERE content_item_id='TEST_VERBATIM'").fetchone()[0] == 'approved'

# Approved content may enter the native publication queue.
DB.execute("""
INSERT INTO publications(id,content_version_id,platform_code,scheduled_at,timezone,status)
VALUES('PUB_ALLOWED','TEST_VERBATIM_en_v1','facebook','2026-08-30T12:00:00+02:00','Europe/Stockholm','scheduled')
""")
assert DB.execute("SELECT status FROM publications WHERE id='PUB_ALLOWED'").fetchone()[0] == 'scheduled'
DB.execute("UPDATE publications SET status='published',external_id='external-123',external_url='https://example.test/post',published_at='2026-08-30T12:01:00+02:00' WHERE id='PUB_ALLOWED'")
DB.execute("INSERT INTO publication_attempts(publication_id,provider,external_id,status,attempted_at) VALUES('PUB_ALLOWED','native-api','external-123','published','2026-08-30T12:01:01+02:00')")
assert DB.execute("SELECT external_id,status FROM publications WHERE id='PUB_ALLOWED'").fetchone() == ('external-123','published')

# Latest-snapshot-per-publication aggregation must not double-count historical snapshots.
DB.execute("""
INSERT INTO analytics_snapshots(project_id,content_version_id,publication_id,platform_code,captured_at,checkpoint,views,likes,source)
VALUES('wisequotesworld','TEST_VERBATIM_en_v1','PUB_ALLOWED','facebook','2026-08-30T13:00:00+02:00','1h',100,10,'test')
""")
DB.execute("""
INSERT INTO analytics_snapshots(project_id,content_version_id,publication_id,platform_code,captured_at,checkpoint,views,likes,source)
VALUES('wisequotesworld','TEST_VERBATIM_en_v1','PUB_ALLOWED','facebook','2026-08-30T14:00:00+02:00','2h',180,17,'test')
""")
DB.execute("""
INSERT INTO analytics_snapshots(project_id,content_version_id,publication_id,platform_code,captured_at,checkpoint,views,likes,source)
VALUES('wisequotesworld','TEST_VERBATIM_de_v1','PUB_SECOND','facebook','2026-08-30T14:05:00+02:00','2h',70,6,'test')
""")
latest = DB.execute("""
WITH ranked AS (
  SELECT a.*,ROW_NUMBER() OVER (PARTITION BY a.publication_id ORDER BY datetime(a.captured_at) DESC,a.id DESC) rn
  FROM analytics_snapshots a WHERE a.project_id='wisequotesworld'
)
SELECT SUM(COALESCE(views,0)),SUM(COALESCE(likes,0)) FROM ranked WHERE rn=1 AND platform_code='facebook'
""").fetchone()
assert latest == (250, 23), latest

# Publications are blocked without approval.
DB.execute("""
INSERT INTO content_items(id,project_id,content_type,canonical_title,source_text,status,created_at,updated_at,quote_type,original_quote,original_language,attribution_status)
VALUES('TEST_UNAPPROVED','wisequotesworld','quote','U','U','idea',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'adapted','U','en','not_required')
""")
DB.execute("INSERT INTO content_versions(id,content_id,language_code,adapted_text,status,version) VALUES('TEST_UNAPPROVED_en_v1','TEST_UNAPPROVED','en','U','localized',1)")
blocked = False
try:
    DB.execute("INSERT INTO publications(id,content_version_id,platform_code,status) VALUES('PUB_BLOCK','TEST_UNAPPROVED_en_v1','facebook','scheduled')")
except sqlite3.IntegrityError:
    blocked = True
assert blocked, 'scheduled publication must require explicit approval'

# NULL-safe content approval uniqueness must prevent duplicates.
DB.execute("INSERT INTO content_approvals(project_id,content_item_id,approval_scope,status,created_at,updated_at) VALUES('wisequotesworld','TEST_UNAPPROVED','content','pending',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)")
blocked = False
try:
    DB.execute("INSERT INTO content_approvals(project_id,content_item_id,approval_scope,status,created_at,updated_at) VALUES('wisequotesworld','TEST_UNAPPROVED','content','pending',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)")
except sqlite3.IntegrityError:
    blocked = True
assert blocked, 'content approval uniqueness must treat NULL language as one scope'

print('D1 migration/guardrail/publication/analytics smoke tests passed')
