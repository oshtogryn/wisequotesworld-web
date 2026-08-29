# MASTER RULES — Wise Quotes World

Останнє оновлення: 2026-08-29
Статус: CANONICAL
Версія: database-first v4.1

## 1. Джерела істини
1. `ops/MASTER_RULES.md` — канонічне джерело операційних правил.
2. D1 — канонічне джерело ВСІХ операційних даних: цитати, локалізації, платформні тексти, workflow, media, website, publications, analytics.
3. D1 `rules` — машинно-читана копія критичних правил.
4. Google Sheets використовується лише як тимчасове джерело міграції. Після контрольного cutover операційний workflow від Google Sheets повністю відмовляється; таблиця не є fallback і не може перезаписувати D1/MASTER_RULES.
5. GitHub/Cloudflare зберігають код, шаблони та assets; новий контент після database-first не повинен вимагати deployment.
6. Наданий експорт `WiseQuotes — Content System` використовується як migration/audit source для історичних цитат, мовних версій, prompt-ів, platform copy, media, scheduling, accounts та legacy rules. Він не може автоматично скасовувати новіші explicit user decisions або поточний MASTER_RULES.
7. Перед підготовкою нової теми реально читати актуальний MASTER_RULES, а не покладатися лише на пам'ять чату.

## 2. Мови
Система працює на 8 мовах: uk, ru, pl, en, sv, de, es, fr.
FR активна на website і Pinterest. Для Facebook/Instagram/Threads/TikTok/YouTube FR контент готується і зберігається, але зовнішнє планування не виконується до підключення FR каналів.

## 3. Модель і ротація контенту
Одна думка/цитата = один `content_id` (WQxxx). Мовні версії — окремі `content_versions` для всіх 8 мов.

Контент чергується між:
- `adapted` — авторська/перефразована думка Wise Quotes World без автора;
- `verbatim` — справжня, перевірена цитата відомої людини.

Кожна мовна версія проходить semantic fidelity + native naturalness QA. Переклади не є механічними. Для `verbatim` усі мовні версії створюються безпосередньо з перевіреного оригіналу мовою джерела.

## 4. Тип цитати та автор — критичне правило
Поля: `original_quote`, `original_language`, `author_name`, `author_source`, `source_work`, `source_date`, `source_url`, `attribution_status`.

Для `adapted`: author порожній і автора НЕ показувати у prompt, відео, Pinterest або website attribution.

Для `verbatim`:
1. встановити реального автора і первинне/надійне джерело;
2. встановити мову оригіналу;
3. зберегти оригінальний текст саме мовою джерела;
4. лише після цього робити локалізації;
5. не використовувати популярний переклад як master, якщо доступний оригінал;
6. якщо attribution не підтверджена — не публікувати як цитату конкретної людини.

`author_name = empty` → NO AUTHOR у всіх outputs.
`author_name != empty` + `attribution_status=verified` → author показується там, де це редакційно доречно.

## 5. Workflow
`idea -> source_check -> quote_ready -> localized -> prompt_ready -> copy_ready -> website_ready -> pinterest_ready -> media_pending -> media_ready -> approved -> scheduled -> published -> analytics`

Не ставити `scheduled/published` без зовнішнього readback. Не публікувати без `approved`.

## 6. Gemini video prompt — production standard v4.1
Це правило адаптоване з актуального MASTER RULES Sweden No Sugar і є mandatory.

Базові вимоги:
- vertical 9:16;
- target duration — до актуального максимуму Gemini, зараз до 10 секунд;
- immediate visual hook з першого кадру; без black intro/fade-in/fade-out;
- одна зрозуміла cinematic story, не перевантажувати prompt другорядними деталями;
- готове AI-video ОБОВ'ЯЗКОВО містить точний затверджений localized quote text на екрані;
- готове AI-video ОБОВ'ЯЗКОВО містить natural native-language voiceover цієї самої цитати;
- одночасно показувати один короткий завершений текстовий блок;
- якщо цитата довга — дозволено 2 послідовні блоки; попередній повністю зникає перед наступним; між ними короткий clean no-text gap;
- ніколи не використовувати typewriter/word-by-word animation або automatic subtitles;
- locked quote text не перекладати, не перефразовувати, не autocorrect, не міняти пунктуацію чи літери;
- текст має бути повністю видимий, без обрізаних першого/останнього слова і без виходу за safe area;
- voiceover не повинен втрачати перше або останнє слово; залишати достатній audio headroom/tail;
- останнє слово повністю вимовляється до завершення відео;
- не прискорювати голос неприродно; якщо текст довгий, використовувати весь доступний duration і компактні 2 text blocks;
- music/ambience тихіше voiceover;
- NO instruction labels, random letters, fake UI, unrelated readable background text або automatic captions;
- NO Wise Quotes World logo, brand mark або generated branding inside AI video;
- NO third-party logos/watermarks;
- Wise Quotes World logo користувач додає окремо в CapCut після генерації.

Кожен Gemini prompt повинен містити: format/duration, language, first-frame hook, setting, subject, action/timeline, camera, lighting/mood, EXACT LOCKED TEXT, strict text timing, native voiceover, audio, explicit NO LOGO/NO EXTRA TEXT constraints, clean final hold.

Промт не повинен дублювати або суперечити сам собі. Фінальна перевірка prompt повинна прямо вимагати: spelling/punctuation exact, all words visible, first and last spoken words complete, zero logo/branding.

### Візуальна стратегія для `adapted`
Cinematic symbolic human story, яка передає сенс цитати без мелодрами.

### Візуальна стратегія для `verbatim`
Premium author-specific treatment: tasteful statue/bust/engraving або symbolic scene, без fake documentary claims. Автор не повинен виглядати як фальшивий архівний запис.

## 7. CapCut finalization — mandatory
Після Gemini:
1. перевірити точність написання ВСІХ слів і пунктуації у generated quote text;
2. перевірити, що voiceover містить перше й останнє слово повністю;
3. відкинути generation з орфографічною помилкою, обрізаним текстом/голосом, випадковими буквами, watermark або generated logo;
4. у CapCut додати ТІЛЬКИ правильний Wise Quotes World language logo;
5. не дублювати цитату другим CapCut-текстом, якщо AI-generated quote уже правильний;
6. фінальний export 9:16 перевірити перед Media Inbox upload.

## 8. Pinterest visual
Pinterest image базується на тій самій semantic visual concept/story, що й video.
Canonical format: portrait 2:3, target 1000×1500, exact localized quote, author only when verified, mobile safe margins, no unrelated text/third-party watermark. Wise Quotes World branding допускається лише якщо користувач явно хоче його на Pinterest asset.

Автоматична AI-генерація Pinterest ЗАМОРОЖЕНА. Система готує 8 image prompts → користувач генерує вручну → Admin upload → R2 → QA → approval.

## 9. Required outputs per language
Для кожного content item зберігати:
- localized quote;
- full Gemini video prompt;
- exact voiceover/on-screen text;
- Pinterest image prompt;
- Facebook copy;
- Instagram copy;
- Threads copy;
- TikTok copy;
- YouTube Shorts title + description;
- Pinterest title + SEO description;
- localized topic article URL;
- substantive website reflection/article body.

Для FR готувати всі outputs навіть до створення соціальних акаунтів.

## 10. Social funnel, article links and working length — mandatory
Правило адаптоване з canonical Sweden No Sugar MASTER RULES: social post має давати самостійну користь, topic URL має вести на конкретну локалізовану article page, а технічний character maximum не є цільовою довжиною.

Канонічна воронка Wise Quotes World:
`social post -> localized quote article -> deeper reflection + more Wise Quotes`.

Кожна active-language article URL: `https://wisequotesworld.com/<locale>/quotes/<slug>/`.
Ніколи не вести на homepage, якщо topic article існує. Ніколи не вести на article іншою мовою.

### Facebook
1 основний пост. Структура: hook/quote → 2–4 речення осмислення → питання/висновок → CTA → localized article URL → hashtags. Робочий орієнтир зазвичай 550–1000 знаків, але naturalness важливіша за механічне число.
CTA природно: `Більше про сенс цієї цитати та інші думки: <URL>` або нативний еквівалент мовою посту.

### Instagram
Пост не повинен бути одним реченням. Структура: короткий hook → осмислення → емоційний/філософський висновок → CTA `детальніше за посиланням у профілі` або прямий URL, якщо поточний publisher робить його практично корисним → 3–5 релевантних hashtags. Орієнтир 400–800 знаків.

### Threads
Готувати 3 незалежні Threads posts на тему: 1) hook/meaning; 2) deeper interpretation; 3) question/action/reflection. Це не три частини одного тексту. Кожен має самостійний сенс і за можливості localized topic URL. Не робити hashtag wall.

### TikTok
Caption має бути коротшим за Facebook, але не порожнім: quote hook + 1–2 речення сенсу + CTA до profile/article + 3–5 hashtags. Орієнтир 250–500 знаків.

### YouTube Shorts
Title природний, не clickbait. Description: 2–4 змістовні речення про сенс цитати + localized article URL + 3–5 hashtags. Description не може складатися лише з цитати.

### Pinterest
Title SEO-natural. Description 2–4 речення: сенс/тема цитати + кому вона може відгукнутися + CTA з direct localized article URL. Keywords використовувати природно.

### Character QA
Перед scheduling перевіряти актуальні limits конкретного publisher/Metricool. Якщо текст перевищує limit — переписати природно, не обрізати механічно. Якщо текст настільки короткий, що не дає самостійної користі — доповнити.

## 11. Website article/reflection — substantive editorial standard
Quote detail page не може бути лише цитатою + одним абзацом.

Кожна мовна article page повинна мати щонайменше:
1. цитату;
2. attribution/source для verified verbatim;
3. `Що означають ці слова?` — нормальне пояснення сенсу;
4. `Чому це важливо` — 1–2 абзаци ширшої мудрої думки/контексту;
5. `Як це проявляється в житті` — конкретний людський приклад або практична рефлексія;
6. `Висновок` — короткий сильний editorial takeaway;
7. CTA: `Більше цитат і думок — Wise Quotes World` + внутрішні посилання на archive/category/author.

Робочий орієнтир article reflection/body: приблизно 250–500 слів мовою сторінки для звичайної теми. Для дуже простої цитати допускається коротше, але не менше змістовного multi-paragraph explanation. Не розтягувати текст водою.

Website content локалізується нативно, а не перекладається дослівно.

## 12. Website — database-first
Target model: `content_items -> content_versions -> quote_pages -> Worker -> wisequotesworld.com`.
Новий контент після запису/approval у D1 не повинен вимагати ручного deploy.

Обов'язкові surfaces: 8 localized homepages, FULL published archive, quote detail pages, live category pages, verified author pages, sitemap, hreflang, canonical metadata, SEO internal links.

Routes:
- `/<locale>/`
- `/<locale>/quotes/`
- `/<locale>/quotes/<slug>/`
- `/<locale>/category/<slug>/`
- `/<locale>/author/<slug>/` when applicable.

French website ACTIVE.

## 13. Media Inbox / R2
Canonical binary media storage: Cloudflare R2. D1 stores metadata and usage links. Upload once, reuse for scheduling/site/QA. Admin supports individual and batch upload. Default retention transient media: 30 days; evergreen assets may use keep_forever.

## 14. Admin Console
Admin must support create/edit topic, 8 localizations, prompts, all platform copy, article content/URL, media upload, media QA, approval/reject, workflow/status/errors, planning/readback and analytics. Empty author propagates as NO AUTHOR everywhere.

## 15. Scheduling
Metricool is PRIMARY scheduler during stabilization. D1 is the source of prepared content/status. After every scheduling write, perform Planner readback before marking `scheduled`. No FR external social scheduling until FR accounts are connected.

Перед scheduling обов'язково перевірити:
1. localized article URL існує і відкривається;
2. social copy містить правильний CTA/route;
3. потрібне media пройшло QA;
4. approval = approved;
5. network/date/time/timezone/text/media після write підтверджені readback.

## 16. Analytics
Store platform/source and metric definition. Checkpoints: 24h, 72h, 7d, 30d. Analyze by language/platform/category/quote_type/author/creative concept/publication time.

## 17. Standard command protocol
`наступна цитата`, `готуй наступну`, `працюємо по правилах` означає:
1. read MASTER_RULES + D1 rules;
2. select next topic;
3. source verification for verbatim;
4. 8 native localizations;
5. 8 stable Gemini prompts за v4.1: exact generated quote text + exact voiceover + NO generated logo/branding;
6. 8 Pinterest prompts;
7. full-length platform copy + localized article URLs;
8. substantive website article/reflection 250–500 words per active language;
9. save to D1;
10. media link/QA;
11. user approval;
12. Metricool schedule + readback;
13. analytics.

Не питати повторно про відомі brand/platform/language/format rules.

## 18. Validation protocol
Validate both content modes: adapted without author and verbatim with verified author/source/original language. Both must pass full 8-language preparation, website, Admin, media and approval workflow.

## 19. Fail-safe
If connector/API unavailable, preserve completed D1 state, mark only blocked step, do not invent external status, resume from last confirmed state.

## 20. Shared foundation with Sweden No Sugar
Wise Quotes World і Sweden No Sugar — окремі продукти. Infrastructure patterns may be reused after compatibility review, but all operational records, credentials, mappings, content, CTA, taxonomy and analytics remain isolated by project_id/language/platform. Mature universal workflow rules may be adapted; brand-specific content is never copied automatically.