-- Wise Quotes World migration12 — query indexes for public discovery + newsletter runtime
-- 2026-09-15
-- Idempotent. No data mutation.

-- Public home/archive/category/author queries filter quote_pages by project,
-- locale and publication status before joining content_items.
CREATE INDEX IF NOT EXISTS idx_quote_pages_project_locale_status
  ON quote_pages(project_id, language_code, status, content_item_id);

-- Editorial visibility checks are correlated by content item and scope/status.
CREATE INDEX IF NOT EXISTS idx_content_approvals_visibility
  ON content_approvals(content_item_id, approval_scope, status, language_code);

-- Hourly newsletter batches enforce the per-day delivery cap by status/sent_at.
CREATE INDEX IF NOT EXISTS idx_newsletter_deliveries_daily
  ON newsletter_deliveries(project_id, status, sent_at);
