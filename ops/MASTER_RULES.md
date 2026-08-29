# MASTER RULES — Wise Quotes World

Останнє оновлення: 2026-08-29
Статус: CANONICAL
Версія: database-first v4.2

## 1. Джерела істини
1. `ops/MASTER_RULES.md` — канонічне джерело операційних правил.
2. D1 — канонічне джерело ВСІХ операційних даних: цитати, локалізації, платформні тексти, workflow, media, website, publications, analytics.
3. D1 `rules` — машинно-читана копія критичних правил.
4. Google Sheets — лише migration source/archive; не fallback і не може перезаписувати D1/MASTER_RULES.
5. GitHub/Cloudflare зберігають код, шаблони та assets; новий database-first контент не повинен вимагати deployment.
6. `WiseQuotes — Content System` — migration/audit source; новіші explicit user decisions і MASTER_RULES мають пріоритет.
7. Перед підготовкою нової теми реально читати актуальний MASTER_RULES.

## 2. Мови
8 мов: uk, ru, pl, en, sv, de, es, fr. FR активна на website і Pinterest; social outputs готуються, але не плануються до підключення FR каналів.

## 3. Контент-модель
Одна думка/цитата = один `content_id` (WQxxx), 8 `content_versions`.
Ротація: `adapted` Wise Quotes thought без автора / `verbatim` перевірена авторська цитата.

### Native-language rule — mandatory
Кожна локалізація проходить ДВА окремі QA:
1. semantic fidelity — збережено сенс master quote;
2. native naturalness — фраза звучить так, як її реально сформулював би носій мови.

Literal translation заборонений, якщо він створює неприродний, двозначний або емоційно неправильний сенс. Дозволено змінювати конструкцію, займенники й ідіоми, але не центральну думку. Перед production локалізації перечитуються окремо для uk/ru/pl/en/sv/de/es/fr.

## 4. Тип цитати та автор
Поля: `original_quote`, `original_language`, `author_name`, `author_source`, `source_work`, `source_date`, `source_url`, `attribution_status`.
Для `adapted`: author порожній, автора ніде не показувати.
Для `verbatim`: реальний автор + надійне джерело + мова оригіналу + точний original wording; локалізації лише з оригіналу. Непідтверджену attribution не публікувати.

## 5. Quote-length gate — mandatory BEFORE production
До написання prompts/copy кожну цитату перевірити на придатність до короткого відео.
- Цитата повинна природно читатися/озвучуватися в межах актуального максимуму Gemini (зараз до 10 секунд), без тараторіння.
- Потрібен час на чистий початок, природні паузи, перехід між text blocks і завершення останнього слова.
- Якщо adapted quote задовга — спочатку скоротити/відредагувати master quote, зберігши сенс, потім заново адаптувати всі 8 мов.
- Не намагатися рятувати надто довгу цитату прискоренням voiceover, дрібним шрифтом або надмірною кількістю text blocks.
- Для verbatim exact wording не скорочувати як нібито дослівну цитату; якщо вона не підходить формату, вибрати іншу verified quote або інший формат.

## 6. Workflow
`idea -> source_check -> quote_length_qa -> quote_ready -> localized -> native_language_qa -> prompt_ready -> copy_ready -> website_ready -> pinterest_ready -> media_pending -> media_ready -> approved -> scheduled -> published -> analytics`
Не ставити `scheduled/published` без зовнішнього readback. Не публікувати без `approved`.

## 7. Gemini video prompt — production standard v4.2
Mandatory:
- vertical 9:16, до актуального максимуму Gemini, зараз до 10 s;
- immediate visual hook, no black intro/fade-in/fade-out;
- одна проста cinematic story, яка читається за секунди; не перевантажувати prompt декораціями/мікродеталями;
- готове AI-video ОБОВ'ЯЗКОВО містить EXACT approved localized quote text на екрані;
- natural native-language voiceover вимовляє ТОЙ САМИЙ exact quote;
- для двох речень/довшої цитати: максимум 2 завершені text blocks; block 1 повністю зникає → короткий clean no-text gap → block 2;
- ніколи не показувати два blocks одночасно;
- text upper-middle safe area, великий mobile-readable type;
- NO typewriter, word-by-word animation, automatic subtitles/captions;
- locked quote не перекладати, не перефразовувати, не autocorrect, не змінювати літери/діакритику/пунктуацію;
- усі слова повністю видимі; voiceover містить повністю перше й останнє слово;
- останнє слово закінчується ДО кінця відео; після нього короткий clean final hold;
- natural voice pace; не прискорювати для вміщення тексту;
- music/ambience нижче voiceover;
- NO instruction labels, random letters, fake UI, unrelated readable background text;
- ABSOLUTELY NO Wise Quotes World logo, brand mark або generated branding inside AI video;
- NO third-party watermark/logo;
- Wise Quotes World language logo користувач додає ТІЛЬКИ в CapCut після генерації.

Кожен prompt містить: format/duration, language, first-frame hook, setting, subject, action/timeline, camera, lighting/mood, EXACT LOCKED TEXT, block timing, exact native voiceover, audio, NO LOGO/NO EXTRA TEXT, clean final hold.

### Prompt simplicity rule
Якість виконання важливіша за кількість слів у prompt. Не дублювати однакові інструкції багато разів і не задавати надмірно складну 10-секундну сцену. Пріоритет Gemini: 1) correct exact text; 2) complete voiceover; 3) coherent visual story; 4) clean technical output. Якщо prompt complexity шкодить цим чотирьом пунктам — спростити prompt.

### adapted visual
Cinematic symbolic human story, яка передає сенс без мелодрами.
### verbatim visual
Premium author-specific treatment: tasteful statue/bust/engraving або symbolic scene; без fake documentary claims.

## 8. Generated-video QA + CapCut — mandatory
Generation REJECT, якщо є хоча б одне:
- помилка/заміна/пропуск у quote text;
- неправильна діакритика або пунктуація;
- обрізане перше/останнє слово тексту;
- voiceover починається/закінчується обрізано;
- неприродно прискорена озвучка;
- зайвий readable text/random letters/auto captions;
- AI-generated logo/branding/watermark;
- візуальна сцена суперечить сенсу.

Після PASS у CapCut додати ТІЛЬКИ правильний Wise Quotes World language logo. Не дублювати цитату другим CapCut-текстом, якщо generated quote правильний. Фінальний 9:16 export перевірити перед Media Inbox upload.

## 9. Pinterest image prompt — production standard
Pinterest asset — готова content image, а НЕ blank visual/template.
- portrait 2:3, target 1000×1500;
- та сама semantic visual concept/story, що й video, але композиція оптимізована для статичного кадру;
- MUST render EXACT localized quote directly on the generated image;
- exact spelling, punctuation, accents/diacritics;
- typography highly legible on mobile, з safe margins і достатнім contrast;
- author тільки для verified verbatim, якщо editorially appropriate;
- NO unrelated text, random letters, third-party watermark;
- за замовчуванням NO generated Wise Quotes World logo/branding; branding користувач додає окремо, якщо потрібно;
- НЕ писати `reserve negative space for quote to be added later`, якщо користувач не попросив blank template explicitly.

Автоматична Pinterest AI generation ЗАМОРОЖЕНА: система готує 8 prompts → user generates manually → Admin upload → R2 → QA → approval.

## 10. Required outputs per language
Для кожного content item: localized quote; full Gemini prompt; exact voiceover/on-screen text; Pinterest prompt; Facebook; Instagram; 3 Threads; TikTok; YouTube Shorts title+description; Pinterest title+SEO description; localized topic article URL; substantive website reflection/article body. FR outputs теж готувати повністю.

## 11. Social funnel, article links and working length — mandatory
Canonical funnel: `social post -> localized quote article -> deeper reflection + more Wise Quotes`.
Кожен active-language URL: `https://wisequotesworld.com/<locale>/quotes/<slug>/`. Ніколи не вести на homepage, якщо article існує; ніколи не вести на іншу мову.

### Editorial principle
Пост НЕ є просто підписом до цитати. Він має самостійно дати читачеві думку/емоцію/цінність навіть без кліку. CTA веде читача до глибшого розбору, а не замінює зміст поста. Текст не розтягувати водою: потрібні конкретна інтерпретація, людський контекст і сильний висновок.

### Facebook
1 основний пост: hook/quote → 2–4+ змістовні речення → людський контекст/інтерпретація → питання або висновок → CTA → exact localized article URL → hashtags. Орієнтир 550–1000 знаків; natural editorial quality важливіша за число.
CTA типу: `Більше про сенс цієї цитати та інші думки: <URL>` нативною мовою.

### Instagram
Hook → змістовне осмислення → емоційний/філософський takeaway → CTA → 3–5 hashtags. Орієнтир 400–800 знаків. Не один рядок і не порожній motivational caption.

### Threads
3 незалежні posts: 1) hook/meaning; 2) deeper interpretation; 3) question/action/reflection. Кожен самодостатній. За можливості localized topic URL. Без hashtag wall.

### TikTok
Quote hook + 1–2 змістовні речення + CTA + 3–5 hashtags. Орієнтир 250–500 знаків. Не залишати лише цитату.

### YouTube Shorts
Natural non-clickbait title. Description: 2–4 змістовні речення + exact localized article URL + 3–5 hashtags.

### Pinterest copy
SEO-natural title. Description 2–4 речення: сенс/тема + кому відгукнеться + direct localized article URL. Keywords природно.

### Character QA
Перед scheduling перевірити actual publisher/Metricool limits. Перевищення переписати природно, не обрізати механічно. Надто короткий/порожній текст доповнити змістом.

## 12. Website article/reflection — substantive editorial standard
Quote detail page НЕ може бути лише цитатою + одним коротким абзацом. Це окремий editorial asset.

Кожна мовна page повинна мати:
1. quote;
2. attribution/source для verified verbatim;
3. `Що означають ці слова?` / native equivalent — чітке пояснення;
4. `Чому це важливо` — ширша мудра думка/контекст;
5. `Як це проявляється в житті` — конкретний людський приклад або рефлексія;
6. `Висновок` — сильний, але не банальний takeaway;
7. CTA `Більше цитат і думок — Wise Quotes World` + internal links archive/category/author.

Орієнтир body: 250–500 слів мовою сторінки. Для простої думки може бути коротше, але все одно multi-paragraph і substantive. Не додавати воду заради word count. Website copy локалізується нативно, а не дослівно.

### Emotional quality benchmark
WQ006 (Parents / Family, final native-polished version) є editorial quality benchmark для adapted emotional topics: цитата коротка й придатна для 10 s; social copy самодостатній і людяний; article реально розкриває думку; video та Pinterest передають одну емоційну історію; контент може викликати сильну емоцію без дешевого пафосу або мелодрами. Наступні emotional topics мають прагнути цього рівня, але НЕ копіювати сюжет WQ006 механічно.

## 13. Website — database-first
`content_items -> content_versions -> quote_pages -> Worker -> wisequotesworld.com`. Новий approved D1 content не повинен вимагати manual deploy. Обов'язкові 8 homepages, full archive, quote pages, category pages, verified author pages, sitemap, hreflang, canonical, SEO internal links. French website active.

## 14. Media Inbox / R2
Canonical binary storage: Cloudflare R2; D1 stores metadata/usage. Upload once, reuse. Admin individual+batch upload. Default transient retention 30 days; evergreen may use keep_forever.

## 15. Admin Console
Create/edit topic, 8 localizations, prompts, platform copy, article/URL, media upload/QA, approval/reject, workflow/status/errors, planning/readback, analytics. Empty author = NO AUTHOR everywhere.

## 16. Scheduling
Metricool PRIMARY during stabilization. D1 = prepared content/status source. After every scheduling write perform Planner readback before `scheduled`. No FR social scheduling until accounts connected.
Before scheduling: article URL exists/opens; social CTA route correct; media QA PASS; approval approved; network/date/time/timezone/text/media confirmed by readback.

## 17. Analytics
Checkpoints 24h/72h/7d/30d. Analyze language/platform/category/quote_type/author/creative concept/publication time.

## 18. Standard command protocol
`наступна цитата`, `готуй наступну`, `працюємо по правилах` =
1. read MASTER_RULES + D1 rules;
2. select topic/source verify verbatim;
3. quote-length QA BEFORE localization;
4. 8 native localizations + separate semantic/native QA;
5. 8 Gemini prompts v4.2: exact generated text + exact voiceover + NO generated logo;
6. 8 Pinterest prompts with exact localized quote ON image + NO generated logo by default;
7. full-length native platform copy + exact localized article URLs;
8. substantive native website article/reflection;
9. save to D1;
10. user generates media manually and uploads via Admin;
11. media QA;
12. user approval;
13. Metricool schedule + readback;
14. analytics.

Не питати повторно про відомі brand/platform/language/format rules.

## 19. Validation protocol
Validate adapted without author and verbatim with verified author/source/original language. Both must pass 8-language prep, website, Admin, media, approval workflow. A technically complete package that fails native-language, emotional/editorial, exact-text or media QA is NOT production-ready.

## 20. Fail-safe
If connector/API unavailable, preserve completed D1 state, mark only blocked step, do not invent external status, resume from last confirmed state.

## 21. Shared foundation with Sweden No Sugar
Wise Quotes World and Sweden No Sugar are separate products. Reuse mature infrastructure/workflow patterns only after compatibility review. Operational records, credentials, mappings, content, CTA, taxonomy and analytics remain isolated by project_id/language/platform. Brand-specific content is never copied automatically.
