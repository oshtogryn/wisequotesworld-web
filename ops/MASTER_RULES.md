# MASTER RULES — Wise Quotes World

Останнє оновлення: 2026-08-28
Статус: CANONICAL
Версія: database-first v1

## 1. Джерела істини
1. `ops/MASTER_RULES.md` — канонічне джерело операційних правил.
2. D1 — канонічне джерело операційних даних: цитати, локалізації, платформні тексти, workflow, media, website, publications, analytics.
3. D1 `rules` — машинно-читана копія критичних правил.
4. Google Sheets після cutover — legacy/import/read-only; не може перезаписувати новіші MASTER RULES/D1.
5. GitHub/Cloudflare зберігають код, шаблони та assets; новий контент після database-first не повинен вимагати deployment.

## 2. Модель контенту
Одна думка/цитата = один `content_id` (WQxxx).
Мовні версії — окремі `content_versions`: uk, ru, pl, en, sv, de, es.
Кожна версія має naturalness QA і не є механічним перекладом.

## 3. Тип цитати та автор
Кожен content item має `quote_type`:
- `adapted` — авторська/перефразована думка Wise Quotes World;
- `verbatim` — дослівна атрибутована цитата.
Поля: `original_quote`, `author_name`, `author_source`, `attribution_status`.
Якщо `author_name` порожнє — автора НЕ показувати у відео, Pinterest, website attribution або prompt.
Якщо `author_name` заповнене і quote_type=verbatim — prompt, Pinterest та website можуть/мають показувати автора відповідно до шаблону; attribution має пройти QA.
Не приписувати авторство неперевіреній цитаті.

## 4. Workflow
`idea -> quote_ready -> localized -> prompt_ready -> copy_ready -> website_ready -> media_pending -> media_ready -> approved -> scheduled -> published -> analytics`
Не ставити `scheduled/published` без зовнішнього readback.
Не публікувати без `approved`.

## 5. Video prompt
- vertical 9:16;
- exactly 8 seconds unless explicitly changed;
- immediate visual hook; no black intro;
- visible quote text mandatory;
- first text block early, second later; never simultaneously;
- render ONLY exact quote wording plus author only when author exists and attribution is approved;
- never render instruction labels, automatic captions, unrelated words or third-party watermarks;
- native-language calm reflective voiceover; protagonist voice gender matches protagonist when relevant;
- music below voice;
- text safe area upper-middle;
- own Wise Quotes World branding allowed; third-party branding forbidden;
- each language should have a distinct visual treatment while preserving the same semantic core.

## 6. Pinterest visual — mandatory semantic continuity
Pinterest image is derived from the SAME visual concept/story as the corresponding video prompt.
If the video concept contains, for example, a mother and daughter, the Pinterest image must preserve that semantic scene/relationship rather than replacing it with a generic unrelated image.
The image should communicate the quote before the viewer reads all text.

Canonical Pinterest creative format:
- portrait 2:3;
- target 1000×1500 px;
- readable localized quote;
- author shown only when approved author exists;
- small `Wise Quotes World XX` branding;
- mobile-readable safe margins;
- no clutter, fake UI, unrelated text or third-party watermark;
- composition and characters consistent with the video concept, while optimized as a still image.
Pinterest image generation is part of the standard content pipeline and may be generated automatically. Generated images require visual QA before approval/publication.

## 7. Required outputs per language
For each approved content item prepare/store:
- localized quote;
- video prompt + voiceover/on-screen text;
- Instagram;
- Facebook;
- Threads;
- TikTok;
- YouTube Shorts title + description;
- Pinterest title + SEO description + topic article URL + generated image;
- website quote/reflection page.

## 8. Website — database-first
Target model:
`content_items -> content_versions -> website_articles/quote_pages -> Worker -> wisequotesworld.com`
Routes are generated from published D1 records. No manual homepage editing for each quote.
Required dynamic surfaces: localized homepage latest quotes, quote archive, quote detail, category pages, author pages when attribution exists, sitemap, hreflang, canonical metadata.
Pinterest links to the corresponding localized website page by default.

## 9. Media Inbox / R2
Canonical binary media storage: Cloudflare R2. D1 stores metadata and usage links.
Upload once, reuse for scheduling/site/QA.
Admin supports batch upload and automatic filename classification such as `WQ006_UA_VIDEO.mov` and `WQ006_UA_PIN.png`.
Media states include unassigned/ready/scheduled/publishing/published/expired/error.
Default retention for transient production media: 30 days; evergreen website assets may use keep_forever.

## 10. Admin Console
Admin must support:
- create/edit content item manually;
- enter exact quote text;
- choose adapted/verbatim;
- optional author name and source;
- category/topic;
- inspect/edit 7 localizations;
- inspect prompts/platform copy/website content;
- upload/browse media;
- preview generated Pinterest images;
- approve/reject/regenerate Pinterest image;
- inspect workflow/status/publication errors;
- final approval before scheduling.
Empty author field must propagate as NO AUTHOR through prompts and rendered outputs.

## 11. Private mobile ingest
Preferred mobile paths: private Telegram admin bot and website Admin Media Inbox. Only authorized admin may upload/control operational media.

## 12. Public multilingual AI
Public `Ask Wise Quotes` is separate from admin/upload bot.
It supports uk/ru/pl/en/sv/de/es, searches D1 content first, then uses AI to formulate a response. It may recommend relevant quote pages. Anonymous query intents may be aggregated for content-gap analytics. Never expose private admin/workflow data.

## 13. Scheduling
D1 is the internal source of prepared content/status. Metricool remains scheduling/analytics integration for supported platforms.
After every scheduling write, perform planner readback. Only then set `scheduled` with external id/time/timezone/media/status.

## 14. Analytics
Store platform/source and metric definition. Checkpoints: 24h, 72h, 7d and later aggregate analysis. Use performance by language/platform/category/creative concept to improve future prompts and publication times.

## 15. Standard command protocol
Commands such as `наступна цитата`, `готуй наступну`, `працюємо по правилах` mean:
1. read current MASTER_RULES + D1 rules;
2. select next unfinished WQ content item unless user supplied one;
3. prepare/adapt 7 languages;
4. create 7 video prompts;
5. create all platform copy;
6. create website content;
7. create 7 Pinterest image specifications and generate images where tooling permits;
8. save all results to D1;
9. link available media;
10. present final approval package;
11. after explicit publication approval, schedule and read back;
12. collect analytics.
Do not ask again for known brand/platform/language/format rules.

## 16. Fail-safe
If an external connector/API is unavailable, preserve completed D1 workflow state, mark only the blocked step, do not invent external status, and resume from the last confirmed state when access returns.