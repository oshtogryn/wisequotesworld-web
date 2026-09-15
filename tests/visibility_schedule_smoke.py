import sqlite3

DB = sqlite3.connect(':memory:')
DB.executescript('''
CREATE TABLE content_items (
  id TEXT PRIMARY KEY,
  sequence_no INTEGER
);
CREATE TABLE content_approvals (
  content_item_id TEXT NOT NULL,
  approval_scope TEXT NOT NULL,
  language_code TEXT,
  status TEXT NOT NULL
);
CREATE TABLE website_publication_schedule (
  project_id TEXT NOT NULL,
  content_item_id TEXT NOT NULL,
  scheduled_for TEXT NOT NULL,
  status TEXT NOT NULL
);
''')

VISIBLE = """
(
  COALESCE(ci.sequence_no, CAST(SUBSTR(ci.id,3) AS INTEGER), 0) <= 15
  OR EXISTS (
    SELECT 1 FROM content_approvals sva
    WHERE sva.content_item_id=ci.id
      AND sva.approval_scope='website_visibility'
      AND sva.language_code IS NULL
      AND sva.status='approved'
  )
  OR EXISTS (
    SELECT 1 FROM website_publication_schedule ws
    WHERE ws.project_id='wisequotesworld'
      AND ws.content_item_id=ci.id
      AND ws.status='scheduled'
      AND ws.scheduled_for<=strftime('%Y-%m-%dT%H:%M:%fZ','now')
  )
)
"""

for item_id, seq in [('WQ015',15),('WQ016',16),('WQ017',17),('WQ018',18)]:
    DB.execute('INSERT INTO content_items(id,sequence_no) VALUES(?,?)',(item_id,seq))

# Legacy visible range remains visible.
assert DB.execute(f"SELECT COUNT(*) FROM content_items ci WHERE ci.id='WQ015' AND {VISIBLE}").fetchone()[0] == 1

# New content is hidden until explicit approval or a due visibility schedule.
assert DB.execute(f"SELECT COUNT(*) FROM content_items ci WHERE ci.id='WQ016' AND {VISIBLE}").fetchone()[0] == 0

DB.execute("INSERT INTO content_approvals VALUES('WQ016','website_visibility',NULL,'approved')")
assert DB.execute(f"SELECT COUNT(*) FROM content_items ci WHERE ci.id='WQ016' AND {VISIBLE}").fetchone()[0] == 1

# A future schedule must not reveal the topic early.
DB.execute("INSERT INTO website_publication_schedule VALUES('wisequotesworld','WQ017','2999-01-01T00:00:00.000Z','scheduled')")
assert DB.execute(f"SELECT COUNT(*) FROM content_items ci WHERE ci.id='WQ017' AND {VISIBLE}").fetchone()[0] == 0

# A due schedule makes discovery visible immediately, even before housekeeping
# changes the schedule row to released / writes an approval row.
DB.execute("INSERT INTO website_publication_schedule VALUES('wisequotesworld','WQ018','2000-01-01T00:00:00.000Z','scheduled')")
assert DB.execute(f"SELECT COUNT(*) FROM content_items ci WHERE ci.id='WQ018' AND {VISIBLE}").fetchone()[0] == 1

# Cancelled/released housekeeping states are not independently discovery-visible;
# the canonical approval row is what persists visibility after release.
DB.execute("UPDATE website_publication_schedule SET status='cancelled' WHERE content_item_id='WQ018'")
assert DB.execute(f"SELECT COUNT(*) FROM content_items ci WHERE ci.id='WQ018' AND {VISIBLE}").fetchone()[0] == 0
DB.execute("INSERT INTO content_approvals VALUES('WQ018','website_visibility',NULL,'approved')")
assert DB.execute(f"SELECT COUNT(*) FROM content_items ci WHERE ci.id='WQ018' AND {VISIBLE}").fetchone()[0] == 1

print('visibility schedule smoke: OK')
