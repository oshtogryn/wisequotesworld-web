# Admin Access hotfix — 2026-09-10

Cloudflare Access is the primary browser authentication layer for `/admin/*`, `/api/admin/*`, and `/ops/*`.

Backend `lib/admin_auth.js` was updated so a valid Cloudflare Access JWT assertion can supply the authenticated identity from its JWT payload when the separate `cf-access-authenticated-user-email` header is absent. The allowed admin email list remains enforced.

Do not weaken Cloudflare Access route protection. Legacy `ADMIN_TOKEN` remains only as a non-browser automation fallback.
