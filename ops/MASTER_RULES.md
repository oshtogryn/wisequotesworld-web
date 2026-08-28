# MASTER RULES — Wise Quotes World

Останнє оновлення: 2026-08-28
Статус: CANONICAL
Версія: database-first v2

## 1. Джерела істини
1. `ops/MASTER_RULES.md` — канонічне джерело операційних правил.
2. D1 — канонічне джерело ВСІХ операційних даних: цитати, локалізації, платформні тексти, workflow, media, website, publications, analytics.
3. D1 `rules` — машинно-читана копія критичних правил.
4. Google Sheets використовується лише як тимчасове джерело міграції. Після контрольного cutover операційний workflow від Google Sheets повністю відмовляється; таблиця не є fallback і не може перезаписувати D1/MASTER_RULES.
5. GitHub/Cloudflare зберігають код, шаблони та assets; новий контент після database-first не повинен вимагати deployment.

## 2. Мови
Система відразу проектується на 8 мов:
- uk — Ukrainian
- ru — Russian
- pl — Polish
- en — English
- sv — Swedish
- de — German
- es — Spanish
- fr — French

FR має бути повністю підтримана в schema, API, Admin, website routes, localization profiles, required outputs, media naming, Pinterest, sitemap/hreflang та analytics, навіть якщо соціальні акаунти FR ще не створені. До підключення каналів FR має status `prepared/inactive_social` і не планується назовні.

## 3. Модель контенту
Одна думка/цитата = один `content_id` (WQxxx).
Мовні версії — окремі `content_versions` для всіх 8 мов.
Кожна версія має naturalness QA і не є механічним перекладом.

## 4. Тип цитати та автор — критичне правило
Кожен content item має `quote_type`:
- `adapted` — авторська/перефразована думка Wise Quotes World;
- `verbatim` — дослівна атрибутована цитата.

Поля: `original_quote`, `original_language`, `author_name`, `author_source`, `source_work`, `source_date`, `source_url`, `attribution_status`.

Для `adapted`:
- author за замовчуванням порожній;
- автора НЕ показувати у prompt, відео, Pinterest або website attribution.

Для `verbatim`:
1. Спочатку встановити реального автора і первинне/надійне джерело.
2. Встановити МОВУ ОРИГІНАЛУ.
3. Зберегти оригінальний текст саме мовою джерела як canonical source quote.
4. Лише після цього робити адаптації/переклади на решту мов.
5. Не використовувати популярний переклад як master, якщо доступний оригінал.
6. Не приписувати людині фразу лише тому, що вона її повторила/популяризувала. Перевіряти першоджерело та контекст.
7. Якщо attribution не підтверджена — не публікувати як авторську цитату конкретної людини.

`author_name = empty` → NO AUTHOR у всіх outputs.
`author_name != empty` + `attribution_status=verified` → author може/має бути присутнім у відповідних rendered outputs за шаблоном.

## 5. Workflow
`idea -> source_check -> quote_ready -> localized -> prompt_ready -> copy_ready -> website_ready -> pinterest_ready -> media_pending -> media_ready -> approved -> scheduled -> published -> analytics`
Не ставити `scheduled/published` без зовнішнього readback.
Не публікувати без `approved`.

## 6. Video prompt
- vertical 9:16;
- exactly 8 seconds unless explicitly changed;
- immediate visual hook; no black intro;
- visible quote text mandatory;
- first text block early, second later; never simultaneously;
- render ONLY exact localized quote wording plus author only when author exists and attribution is verified;
- never render instruction labels, automatic captions, unrelated words or third-party watermarks;
- native-language calm reflective voiceover;
- music below voice;
- text safe area upper-middle;
- own Wise Quotes World branding allowed; third-party branding forbidden;
- each language may have distinct visual treatment while preserving the same semantic core.

For attributed quotes the visual concept may use one of these premium treatments when appropriate:
- tasteful cinematic representation of the author speaking;
- elegant animated sculpture/bust/engraving associated with the author;
- archival-inspired environment without fake documentary claims;
- symbolic scene reflecting the author's words.
The visual must remain respectful, readable and non-kitsch. Do not imply authentic footage/recording where none exists. Author identity should not overwhelm the quote.

## 7. Pinterest visual — mandatory semantic continuity
Pinterest image is derived from the SAME visual concept/story as the corresponding video prompt.
If the video concept contains, for example, a mother and daughter, the Pinterest image must preserve that semantic scene/relationship rather than replace it with an unrelated generic image.
The image should communicate the quote before the viewer reads all text.

Canonical Pinterest creative format:
- portrait 2:3;
- target 1000×1500 px;
- readable localized quote;
- author shown only when verified author exists;
- small `Wise Quotes World XX` branding;
- mobile-readable safe margins;
- no clutter, fake UI, unrelated text or third-party watermark;
- composition/characters consistent with the video concept, optimized as a still image.
Pinterest image generation is part of the standard pipeline and is automated where tooling permits. Generated images require visual QA and are previewable in Admin before final approval.

## 8. Required outputs per language
For each content item prepare/store:
- localized quote;
- video prompt + voiceover/on-screen text;
- Instagram;
- Facebook;
- Threads;
- TikTok;
- YouTube Shorts title + description;
- Pinterest title + SEO description + topic article URL + generated image;
- website quote/reflection page.

For FR, prepare/store all content outputs even before social accounts exist; external scheduling remains disabled until accounts are connected.

## 9. Website — database-first
Target model:
`content_items -> content_versions -> quote_pages -> Worker -> wisequotesworld.com`
Routes are generated from published D1 records. No manual homepage editing per quote.
Required dynamic surfaces: localized homepage/latest quotes, archive, quote detail, category pages, author pages when attribution exists, sitemap, hreflang, canonical metadata.
Supported locales: `/uk/ /ru/ /pl/ /en/ /sv/ /de/ /es/ /fr/`.
Pinterest links to corresponding localized website page by default.

## 10. Media Inbox / R2
Canonical binary media storage: Cloudflare R2. D1 stores metadata and usage links.
Upload once, reuse for scheduling/site/QA.
Admin supports batch upload and automatic filename classification such as `WQ006_UA_VIDEO.mov`, `WQ006_FR_VIDEO.mov`, `WQ006_UA_PIN.png`.
Media states include unassigned/ready/scheduled/publishing/published/expired/error.
Default retention for transient production media: 30 days; evergreen website assets may use keep_forever.

## 11. Admin Console
Admin must support:
- create/edit content item manually;
- enter exact quote text;
- choose adapted/verbatim;
- original language;
- optional author + source/work/date/URL;
- category/topic;
- inspect/edit 8 localizations;
- inspect prompts/platform copy/website content;
- upload/browse media;
- preview generated Pinterest images;
- approve/reject/regenerate Pinterest image;
- inspect workflow/status/publication errors;
- final approval before scheduling.
Empty author field must propagate as NO AUTHOR through prompts and rendered outputs.

## 12. Private mobile ingest
Preferred mobile paths: private Telegram admin bot and website Admin Media Inbox. Only authorized admin may upload/control operational media.

## 13. Public multilingual AI
Public `Ask Wise Quotes` is separate from admin/upload bot.
It supports uk/ru/pl/en/sv/de/es/fr, searches D1 content first, then uses AI to formulate a response. It may recommend relevant quote pages. Anonymous query intents may be aggregated for content-gap analytics. Never expose private admin/workflow data.

## 14. Scheduling
D1 is the source of prepared content/status. Metricool remains scheduling/analytics integration for supported connected platforms.
After every scheduling write, perform planner readback. Only then set `scheduled` with external id/time/timezone/media/status.
No FR external scheduling until FR social accounts are explicitly connected and enabled.

## 15. Analytics
Store platform/source and metric definition. Checkpoints: 24h, 72h, 7d and later aggregate analysis. Analyze performance by language/platform/category/quote_type/author/creative concept/publication time.

## 16. Standard command protocol
Commands such as `наступна цитата`, `готуй наступну`, `працюємо по правилах` mean:
1. read current MASTER_RULES + D1 rules;
2. select next unfinished WQ content item unless user supplied one;
3. if verbatim: verify author, source and original language first;
4. prepare/adapt all 8 languages;
5. create 8 video prompts;
6. create all platform copy;
7. create website content;
8. create 8 Pinterest creatives and generate images where tooling permits;
9. save all results to D1;
10. link available media;
11. present final approval package;
12. after explicit publication approval, schedule connected channels and read back;
13. collect analytics.
Do not ask again for known brand/platform/language/format rules.

## 17. Two-content test protocol
Before full production cutover validate two consecutive content items:
A. one `adapted` Wise Quotes World quote with no author;
B. one `verbatim` quote with verified author/source/original language.
Both must pass full 8-language preparation, website/Pinterest/Admin/database workflow. Only connected 7-language social accounts are scheduled; FR remains prepared but inactive until channels exist.

## 18. Fail-safe
If an external connector/API is unavailable, preserve completed D1 workflow state, mark only the blocked step, do not invent external status, and resume from the last confirmed state when access returns.