# MASTER RULES — Wise Quotes World

Останнє оновлення: 2026-08-29
Статус: CANONICAL
Версія: database-first v3

## 1. Джерела істини
1. `ops/MASTER_RULES.md` — канонічне джерело операційних правил.
2. D1 — канонічне джерело ВСІХ операційних даних: цитати, локалізації, платформні тексти, workflow, media, website, publications, analytics.
3. D1 `rules` — машинно-читана копія критичних правил.
4. Google Sheets використовується лише як тимчасове джерело міграції. Після контрольного cutover операційний workflow від Google Sheets повністю відмовляється; таблиця не є fallback і не може перезаписувати D1/MASTER_RULES.
5. GitHub/Cloudflare зберігають код, шаблони та assets; новий контент після database-first не повинен вимагати deployment.
6. Наданий експорт `WiseQuotes — Content System` використовується як migration/audit source для історичних цитат, мовних версій, prompt-ів, platform copy, media, scheduling, accounts та legacy rules. Він не може автоматично скасовувати новіші explicit user decisions або поточний MASTER_RULES.

## 2. Мови
Система працює на 8 мовах:
- uk — Ukrainian
- ru — Russian
- pl — Polish
- en — English
- sv — Swedish
- de — German
- es — Spanish
- fr — French

FR активна на website і Pinterest уже зараз. Для Facebook/Instagram/Threads/TikTok/YouTube FR контент готується і зберігається, але зовнішнє планування не виконується до підключення відповідних FR каналів.

## 3. Модель і ротація контенту
Одна думка/цитата = один `content_id` (WQxxx). Мовні версії — окремі `content_versions` для всіх 8 мов.

Контент свідомо чергується між двома типами:
- `adapted` — авторська/перефразована думка Wise Quotes World без автора;
- `verbatim` — справжня, перевірена цитата відомої людини, філософа, письменника, мислителя тощо.

Не допускати довгих серій лише одного типу. Ротація має давати відчуття повноцінного медіа-бренду, а не однотипного генератора цитат.

Кожна мовна версія проходить naturalness QA. Переклади ніколи не є механічними або дослівними, якщо це звучить неприродно. Зміст, тон і сила оригіналу зберігаються, але фраза адаптується природно для носія мови.

Для `verbatim` усі мовні версії створюються безпосередньо з перевіреного оригіналу мовою джерела, а не через проміжний переклад.

## 4. Тип цитати та автор — критичне правило
Поля: `original_quote`, `original_language`, `author_name`, `author_source`, `source_work`, `source_date`, `source_url`, `attribution_status`.

Для `adapted`:
- author за замовчуванням порожній;
- автора НЕ показувати у prompt, відео, Pinterest або website attribution.

Для `verbatim`:
1. Спочатку встановити реального автора і первинне/надійне джерело.
2. Встановити МОВУ ОРИГІНАЛУ.
3. Зберегти оригінальний текст саме мовою джерела як canonical source quote.
4. Лише після цього робити природні адаптації на решту мов.
5. Не використовувати популярний переклад як master, якщо доступний оригінал.
6. Не приписувати людині фразу лише тому, що вона її повторила/популяризувала.
7. Якщо attribution не підтверджена — не публікувати як авторську цитату конкретної людини.

`author_name = empty` → NO AUTHOR у всіх outputs.
`author_name != empty` + `attribution_status=verified` → author може/має бути присутнім у відповідних rendered outputs.

## 5. Workflow
`idea -> source_check -> quote_ready -> localized -> prompt_ready -> copy_ready -> website_ready -> pinterest_ready -> media_pending -> media_ready -> approved -> scheduled -> published -> analytics`

Не ставити `scheduled/published` без зовнішнього readback. Не публікувати без `approved`.

## 6. Gemini video prompt — production standard
- vertical 9:16;
- target duration = максимально корисна тривалість, доступна в Gemini, зараз до 10 секунд;
- НЕ фіксувати 8 секунд, якщо модель дозволяє 10;
- використовувати до 10 секунд, коли це покращує темп, voiceover, читабельність і сцену;
- ніколи не просити тривалість більшу, ніж дозволяє актуальна модель;
- immediate visual hook з першого кадру; без black intro;
- visible quote text mandatory;
- перший текстовий блок з'являється рано, другий пізніше; не показувати обидва одночасно, якщо цитата потребує двох блоків;
- render ONLY exact localized quote wording plus author only when author exists and attribution is verified;
- never render instruction labels, automatic captions, unrelated words or third-party watermarks;
- native-language calm reflective voiceover;
- music below voice;
- text safe area upper-middle;
- own Wise Quotes World branding allowed; third-party branding forbidden;
- each language may have distinct visual treatment while preserving the same semantic core.

Кожен Gemini prompt має бути ПОВНИМ production prompt, а не коротким описом. Обов'язково включати:
1. формат і максимальну/цільову тривалість;
2. first-frame visual hook;
3. setting і атмосферу;
4. персонажа/об'єкт;
5. camera framing, lens feel, movement;
6. action/timeline по ходу ролика;
7. lighting/color/mood;
8. точний localized quote text;
9. логіку появи тексту;
10. native voiceover;
11. music/ambience;
12. branding;
13. explicit negative constraints;
14. фінальний кадр/емоційний результат.

Кожен мовний prompt є самодостатнім і повинен містити повну структуру без посилань на окремий master prompt: `GENERATE IMMEDIATELY -> FORMAT/DURATION/LANGUAGE/STYLE/MOOD -> CORE IDEA -> EXACT LOCKED TEXT -> STRICT TEXT TIMING -> TEXT POSITION -> VOICEOVER -> VISUAL STORY -> CAMERA -> ORIGINAL MUSIC -> ABSOLUTELY NO OTHER TEXT -> FINAL CHECK`.

Locked text rule: точна затверджена локалізація переноситься в on-screen text і voiceover без translate/paraphrase/rewrite/autocorrect/change punctuation. Для довших цитат дозволено TEXT 1 / TEXT 2 лише як інструкційні поняття в prompt; самі labels ніколи не рендеряться у відео. Блоки не перекриваються; між ними короткий чистий no-text gap; без typewriter/word-by-word animation.

### Візуальна стратегія для `adapted`
Переважно cinematic symbolic story: люди, рішення, стосунки, природа, розвиток, робота, час, дорога, вибір тощо. Відео повинно передавати думку ще до повного прочитання тексту.

### Візуальна стратегія для `verbatim`
Для цитат відомих людей використовувати окремий premium treatment, коли доречно:
- tasteful cinematic representation of the author;
- animated statue/bust/sculpture/engraving;
- figure/statue subtly rotating while the quote appears;
- statue/figure may appear to speak with native-language voiceover, без заяви що це автентичний запис;
- archival-inspired environment without fake documentary claims;
- symbolic scene reflecting the author's words.

Візуал має бути поважним, елегантним, не кітчевим. Особа автора не повинна перекривати саму цитату.

## 7. Pinterest visual
Pinterest image базується на ТІЙ САМІЙ semantic visual concept/story, що й video prompt.

Canonical format:
- portrait 2:3;
- target 1000×1500 px;
- readable localized quote;
- author only when verified;
- small `Wise Quotes World XX` branding;
- mobile-readable safe margins;
- no clutter/fake UI/unrelated text/third-party watermark.

Автоматична AI-генерація Pinterest ЗАМОРОЖЕНА до окремого рішення. Поточний production workflow: система готує 8 детальних image prompts → користувач генерує image вручну → Admin upload → R2 → QA → approval.

## 8. Required outputs per language
Для кожного content item зберігати:
- localized quote;
- full Gemini video prompt;
- voiceover/on-screen text;
- Pinterest image prompt;
- Instagram copy;
- Facebook copy;
- Threads copy;
- TikTok copy;
- YouTube Shorts title + description;
- Pinterest title + SEO description + localized article URL;
- website quote/reflection page.

Для FR готувати всі outputs навіть до створення соціальних акаунтів.

## 9. Website — database-first
Target model:
`content_items -> content_versions -> quote_pages -> Worker -> wisequotesworld.com`

Новий контент після запису/approval у D1 не повинен вимагати ручного deploy.

Обов'язкові surfaces:
- localized homepage для кожної з 8 мов;
- FULL published archive, не лише 3 останні цитати;
- quote detail pages;
- live category pages з усіма опублікованими цитатами відповідної категорії;
- author pages для verified authors;
- sitemap;
- hreflang;
- canonical metadata;
- SEO-friendly internal links.

Routes:
- `/<locale>/`
- `/<locale>/quotes/`
- `/<locale>/quotes/<slug>/`
- `/<locale>/category/<slug>/`
- `/<locale>/author/<slug>/` when applicable.

Supported locales: `/uk/ /ru/ /pl/ /en/ /sv/ /de/ /es/ /fr/`.
French website is ACTIVE now.

## 10. Media Inbox / R2
Canonical binary media storage: Cloudflare R2. D1 stores metadata and usage links.
Upload once, reuse for scheduling/site/QA.
Admin supports individual and batch upload plus filename classification such as `WQ006_UA_VIDEO.mov`, `WQ006_FR_VIDEO.mov`, `WQ006_UA_PIN.png`.
Media states include unassigned/ready/scheduled/publishing/published/expired/error.
Default retention for transient production media: 30 days; evergreen website assets may use keep_forever.

## 11. Admin Console
Admin must support:
- dashboard;
- create/edit content item;
- exact quote text;
- adapted/verbatim;
- original language;
- optional author + verified source/work/date/URL;
- category/topic;
- inspect/edit all 8 localizations;
- inspect full video/image prompts;
- inspect/edit platform copy and website content;
- manual/batch media upload;
- media QA;
- approval/reject;
- workflow/status/errors;
- Metricool preparation/readback status;
- analytics.

Empty author field propagates as NO AUTHOR everywhere.

## 12. Private mobile ingest
Preferred mobile paths: website Admin Media Inbox and later private Telegram admin bot. Only authorized admin may upload/control operational media.

## 13. Public multilingual AI
Public `Ask Wise Quotes` is separate from admin/upload tooling. It supports all 8 languages, searches D1 first, may recommend relevant quote pages, and never exposes private admin/workflow data.

## 14. Scheduling
Metricool is the PRIMARY scheduler during the current stabilization phase.
D1 is the source of prepared content/status. After every Metricool scheduling write, perform planner readback before marking `scheduled`.
Native scheduler development is deferred until Admin + database-first website + media workflow are stable.
No FR external social scheduling until FR accounts are explicitly connected.

## 15. Analytics
Store platform/source and metric definition. Checkpoints: 24h, 72h, 7d and 30d, plus later aggregate analysis. Analyze by language/platform/category/quote_type/author/creative concept/publication time.

## 16. Standard command protocol
Commands such as `наступна цитата`, `готуй наступну`, `працюємо по правилах` mean:
1. read current MASTER_RULES + D1 rules;
2. choose next content item with deliberate adapted/verbatim rotation;
3. if verbatim: verify author, source, work/context and original language first;
4. prepare natural native-level adaptations for all 8 languages with double QA: semantic fidelity + native naturalness;
5. create 8 full production Gemini prompts up to the current Gemini max duration;
6. create 8 Pinterest image prompts;
7. create all platform copy;
8. create website content/categories/metadata;
9. save all results to D1;
10. link manually uploaded media from R2;
11. present final approval package;
12. after explicit approval, schedule connected channels through Metricool and read back;
13. collect analytics.

Do not ask again for known brand/platform/language/format rules.

## 17. Validation protocol
Validate both content modes:
A. `adapted` Wise Quotes World quote with no author;
B. `verbatim` quote with verified author/source/original language.

Both must pass full 8-language preparation, website, Admin, media and approval workflow. Only connected social accounts are externally scheduled.

## 18. Fail-safe
If an external connector/API is unavailable, preserve completed D1 workflow state, mark only the blocked step, do not invent external status, and resume from the last confirmed state when access returns.

## 19. Shared foundation with Sweden No Sugar
Wise Quotes World і Sweden No Sugar є окремими продуктами, але майбутня infrastructure/control-plane може бути спільною: admin patterns, scheduler engine, publication adapters, readback, analytics collectors, health/diagnostics, media pipeline, queue/retry/error handling, permissions та deployment patterns можуть повторно використовуватися між проєктами.

Обов'язкова межа: спільний код НЕ означає спільні операційні дані. Кожен content/media/publication/account/rule/analytics record повинен бути scoped by `project_id`, language і platform за потреби. Credentials/account mappings також проєктно ізольовані. Заборонено cross-project defaulting або автоматичне перенесення контенту між Wise Quotes World та Sweden No Sugar.

Якщо в MASTER_RULES Sweden No Sugar є зріле технічне правило, яке універсально покращує scheduler/admin/media/analytics/website infrastructure, його дозволено адаптувати для Wise Quotes World після перевірки сумісності. Контентні правила, CTA, brand voice, taxonomy, platform accounts і мовна політика ніколи не копіюються автоматично.
