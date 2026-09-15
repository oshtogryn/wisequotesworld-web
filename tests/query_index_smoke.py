import importlib.util
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('db_smoke_base', ROOT / 'tests' / 'db_smoke.py')
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)

base.run('db/migration12_query_indexes.sql')
for index in [
    'idx_quote_pages_project_locale_status',
    'idx_content_approvals_visibility',
    'idx_newsletter_deliveries_daily',
]:
    assert base.DB.execute(
        "SELECT 1 FROM sqlite_master WHERE type='index' AND name=?", (index,)
    ).fetchone(), index

# The migration is intentionally safe to re-apply.
base.run('db/migration12_query_indexes.sql')
for index in [
    'idx_quote_pages_project_locale_status',
    'idx_content_approvals_visibility',
    'idx_newsletter_deliveries_daily',
]:
    assert base.DB.execute(
        "SELECT COUNT(*) FROM sqlite_master WHERE type='index' AND name=?", (index,)
    ).fetchone()[0] == 1, index

print('Query index migration smoke tests passed')
