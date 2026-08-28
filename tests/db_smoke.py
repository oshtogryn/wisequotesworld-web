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

# Publications are blocked without approval and allowed after approval.
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

print('D1 migration/guardrail smoke tests passed')
