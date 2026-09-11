# MASTER RULES — Wise Quotes World

Останнє оновлення: 2026-09-11
Статус: CANONICAL
Версія: database-first v4.13

## 1. Джерела істини
1. `ops/MASTER_RULES.md` — канонічне джерело операційних правил.
2. D1 — канонічне джерело операційного стану та контенту.
3. D1 `rules` — машинно-читана копія критичних правил.
4. Google Sheets — лише migration source/archive, не fallback.
5. GitHub/Cloudflare — code, templates, assets та runtime infrastructure.
6. Новіші explicit user decisions мають пріоритет над старими записами; після підтвердження вони повинні бути внесені в MASTER_RULES.
7. Перед новою темою, зміною pipeline/status/publication/structure обов’язково читати актуальний MASTER_RULES і фактичний D1 state.
8. Completion/status claims робити тільки після реального readback.

## 2. Мови та режими публікації
Website locales — 13:
`uk, ru, pl, en, sv, de, es, fr, it, pt-BR, id, tr, ar`.

Connected Metricool social locales — 8:
`uk, ru, pl, en, sv, de, es, fr`.

Manual/inactive social locales — 5:
`it, pt-BR, id, tr, ar`.

Усі 13 мов мають website-localization та індексовані article URLs. Manual/inactive social locales можуть мати підготовлені prompts/copy/media, але не входять у Metricool completeness/readback gate, доки акаунти/boards фактично не підключені.

## 3. Контентні типи та атрибуція
Одна думка = один `content_id` + 13 website localizations.

Є два production types:
- `adapted` — власна/адаптована Wise Quotes World думка без автора.
- `verbatim` — справжня цитата конкретного автора; допускається тільки після verified author + source + original wording.

Правила:
- `adapted` ніколи не отримує автора.
- `verbatim` завжди має explicit attribution та verified source/original.
- Порожній author = NO AUTHOR everywhere.
- Не переносити author-specific visual treatment на `adapted`.
- Кожна локалізація проходить semantic fidelity + native naturalness QA.
- Literal translation заборонений, якщо звучить неприродно або змінює сенс/емоційний тон.

## 4. Quote-length gate
Перед prompts/copy перевірити, що quote природно читається у фактичній тривалості поточного Gemini/Veo interface/model.

- Не зашивати універсальну тривалість типу 10 s.
- Не прискорювати voiceover і не ламати текст тільки заради таймінгу.
- `adapted` можна скоротити під natural localization.
- `verbatim` не скорочувати під виглядом exact quote.

## 5. Canonical workflow
`idea -> source_check -> quote_length_qa -> quote_ready -> localized -> native_language_qa -> prompt_ready -> copy_ready -> website_ready -> pinterest_ready -> media_pending -> media_ready -> approved -> scheduled -> published -> analytics`

Website publication, website visibility і social scheduling — окремі незалежні gates.

## 6. Gemini/Veo video prompts
WQ006 RU — established benchmark для `adapted`: короткий, прямий, структурований prompt без внутрішніх QA-інструкцій.

### Mandatory structure
1. `Create a premium photorealistic vertical 9:16 cinematic video in <language>.`
2. Один coherent cinematic concept: framing + subject/action + setting + light + emotion + camera movement.
3. Exact localized text card(s), без іншого readable text.
4. Clean, large, elegant typography; upper-middle safe area; stable complete cards; no word/letter animation.
5. `Audio:` calm native narrator reads exact intended quote/attribution naturally and completely; restrained music below voice.
6. Для `verbatim` до prompt-ready перевірити locale-specific pronunciation/stress автора. Pronunciation guidance не повинна потрапляти у visible text.
7. Один короткий negative line: `No subtitles. No captions. No emoji. No decorative symbols. No logo. No branding. No watermark. No other readable text.`
8. Clean emotional final hold.

### Prompt family A — `adapted`
- Human/symbolic cinematic scene, що прямо передає думку.
- Без philosopher busts, author cards, museum portraits.
- Sincere emotion; no cheap melodrama.

### Prompt family B — `verbatim`
- Premium restrained editorial/intellectual treatment.
- Якщо модель дозволяє і це доречно, можна використати dignified portrait/sculpture/art-historical representation автора.
- Авторський likeness НЕ є обов’язковим. Якщо Gemini/Veo блокує public figure або likeness створює generation risk, використовувати сильну історично/тематично доречну symbolic scene без портрета, обличчя, бюста чи likeness автора.
- Ніколи не імітувати fake authentic historical footage.
- Не робити static museum slideshow; потрібна quote-specific visual metaphor/micro-dramaturgy.
- Exact quote wording та attribution залишаються незмінними; за потреби quote можна розділити максимум на два stable sequential cards.

### Exact-text anti-leak
- Quote з’являється тільки у intended stable text card(s).
- Не вставляти у production prompt spelling diagnostics, phonetics, stress marks, Unicode/letter diagnostics, QA labels, wrong spellings або internal notes.
- Internal QA завжди поза generation prompt.

## 7. Generated-video QA + CapCut
QA після генерації. REJECT якщо є:
- wrong/missing text;
- broken diacritics/punctuation;
- clipped first/last word;
- rushed/clipped voice;
- extra readable text/random letters/auto captions/emoji;
- AI logo/branding/watermark;
- scene contradicting meaning;
- для `verbatim`: wrong/missing attribution, wrong locale pronunciation/stress, fake historical-footage implication.

Після PASS у CapCut додавати тільки правильний Wise Quotes World language logo. Не дублювати quote CapCut-текстом.

## 8. Pinterest
Для кожної connected social locale обов’язкові два окремі Pinterest outputs:
1. Image Pin — approved 2:3 image, target 1000×1500.
2. Video Pin — approved 9:16 topic video from R2/D1.

Image rules:
- exact localized quote;
- для `verbatim` attribution;
- mobile-readable typography;
- no CTA/helper text/random letters/watermark/generated logo;
- clean, save-worthy editorial asset.

Creative differentiation:
- Locale images не повинні бути простими language swaps.
- Варіювати composition, metaphor/details, lighting mood і editorial palette.
- Locale palette cues:
  - uk: deep blue + wheat-gold + dusk neutrals
  - ru: burgundy + charcoal + muted ivory
  - pl: warm ivory + muted crimson + graphite
  - en: Oxford navy + parchment + restrained brass
  - sv: Nordic cool blue + pale stone + soft amber
  - de: charcoal + forest green + warm ochre
  - es: terracotta + olive + warm cream
  - fr: slate blue + warm ivory + muted burgundy
  - it: olive + terracotta + warm stone
  - pt-BR: deep emerald + warm sand + muted azure
  - id: teak earth tones + warm cream + subdued indigo
  - tr: deep teal + copper + warm stone
  - ar: desert sand + deep indigo + antique gold
- Це mood cues, не literal nationality: без flags, national emblems, tourist/folk clichés без сюжетної потреби.
- Pinterest titles/descriptions мають бути native, SEO-natural, meaning-faithful, не mechanical translations і без keyword stuffing.
- Image/Video Pin можуть мати різні native descriptions.
- Обидва ведуть на exact same-language article URL.
- Image і Video Pin не публікувати одночасно; default — image вдень, video ввечері.

## 9. Required outputs
Для кожної з 13 website locales:
- localized quote;
- localized article URL;
- substantive native website reflection.

Для кожної connected social locale додатково:
- Gemini/Veo prompt;
- voiceover/on-screen text;
- Pinterest Image prompt;
- Facebook Reel copy;
- Instagram Reel copy;
- 3 independent Threads posts;
- TikTok copy;
- YouTube Short title/description;
- Pinterest Image title/description;
- Pinterest Video title/description.

## 10. Social copy + link policy
Posts мають бути self-contained і substantive.

Working targets:
- Facebook: 550–1000 chars
- Instagram: 400–800 chars
- Threads: 3 independent posts
- TikTok: 250–500 chars
- YouTube: 2–4 substantive sentences
- Pinterest: SEO-natural title + 2–4 sentences

Максимум 5 релевантних hashtags. `#WiseQuotesWorld` зберігати, коли доречно.

Link routing:
- Facebook: exact same-language article URL у post.
- Threads: exact same-language article URL у post.
- Instagram Reels: без raw article URL; natural localized “link in profile” CTA.
- YouTube Shorts: без raw article URL; natural localized “link in profile” CTA.
- TikTok: visible locale website address як plain text, якщо немає clickable website/profile link; не називати його clickable.
- Pinterest: exact same-language article URL у destination-link field.
- Ніколи не вести locale на homepage або іншу мову, якщо існує exact localized article.

## 11. Website article standard
Кожна стаття — окремий substantive editorial asset:
- quote;
- verified attribution/source/original для `verbatim`;
- meaning/context;
- why it matters;
- life example/reflection;
- strong conclusion;
- CTA/internal links.

Target: 250–500 слів, multi-paragraph, native, no filler.

WQ006 — emotional editorial benchmark для `adapted`.

Усі quote detail pages використовують один 13-locale presentation standard:
`breadcrumbs -> category -> quote card -> exactly one attribution line -> substantive reflection -> verified source/original when applicable -> related/internal links`.

Не рендерити attribution двічі, якщо localized quote storage уже її містить.

## 12. Website publication vs website visibility — HARD
Починаючи з WQ016, технічна публікація статті та її видимість у навігації — різні речі.

### Technical publication
Після проходження shared 13-locale readiness gate всі 13 `quote_pages` можуть отримати `status='published'`.

Технічно published стаття:
- доступна по direct canonical URL;
- має canonical/hreflang;
- входить у sitemap;
- може бути відправлена через IndexNow;
- може індексуватися пошуковиками.

Technical publication НЕ робить тему видимою у public navigation і НЕ змінює social status.

### Editorial visibility
Поки немає explicit `website_visibility` approval/release, тема MUST бути прихована від користувача у:
- `/xx/start/` Latest;
- homepage cards;
- archive/listing cards;
- category pages;
- author pages;
- інших discovery/navigation surfaces.

При цьому direct article URL продовжує працювати й індексуватися.

В Admin користувач керує visibility окремо:
- `Зробити видимою` одразу; або
- вибрати точну дату й час, коли тема має стати видимою.

Canonical schedules зберігаються в D1 `website_publication_schedule`.

Scheduling visibility дозволений тільки коли всі 13 quote pages вже мають `status='published'`.

At/after `scheduled_for` тема стає видимою у public navigation. Housekeeping row може бути позначений `released` пізніше, але це не повинно затримувати фактичну видимість.

Cancelling visibility schedule:
- не видаляє article URLs;
- не змінює indexability;
- лишає тему hidden у navigation.

Website visibility НІКОЛИ не schedule social posts і не встановлює social `scheduled`/`published`.

## 13. Website/database implementation
- D1 — database-first canonical operational store.
- New approved content не повинен вимагати manual deploy.
- Website publication використовує shared D1 publication engine + 13-locale readiness gate.
- Topic-specific `wq0xx_finalize.js`/website-publish modules заборонені, крім реально виняткових migration cases.
- Public website підтримує archive, quote/category/verified-author pages, sitemap, hreflang, canonical, internal links.
- Social readiness оцінюється тільки для connected social locales.

## 14. `/start` + newsletter
Усі 13 `/start` pages використовують unified presentation і compact contact block з direct e-mail action, не old multi-field contact form.

Newsletter:
- subscription locale визначається current `/xx/start` locale;
- D1 stores e-mail, locale, consent timestamp/version, status, unsubscribe token;
- Brevo — connected outbound transport;
- sender domain: `news.wisequotesworld.com`;
- production credentials зберігаються тільки як Cloudflare secrets/variables;
- D1 лишається canonical subscriber source;
- default cadence: localized digest every 14 days;
- planning cap: максимум 300 deliveries/day, до 4200 за 14-day cycle;
- subscribers batch dynamically, не permanently by weekday;
- automated scheduled delivery не вважати active, доки 14-day scheduler явно не enabled + verified.

## 15. Media
- R2 — canonical binary storage.
- D1 — canonical media metadata/state.
- Upload once/reuse.
- User manually generates video/Pinterest assets, uploads через Admin, далі QA -> approval.

## 16. Admin
Admin повинен давати можливість:
- create/edit topic;
- працювати з 13 website localizations;
- переглядати/edit prompts/copy/article URLs;
- upload/QA/approve/reject media;
- керувати workflow/status/errors;
- керувати technical website publication окремо від editorial visibility;
- зробити тему видимою одразу або запланувати exact date/time;
- planning/readback/analytics.

Admin показує всі 13 locales. Social/media completeness gates застосовуються тільки до connected social locales; manual locales мають `publishing_mode=manual`, connected locales — `publishing_mode=metricool`.

## 17. Social scheduling gate
Metricool — PRIMARY scheduler during stabilization.

Topic НЕ отримує `scheduled`, доки live Metricool Planner readback не підтвердить complete connected-social set.

Для 8 connected locales стандарт = 9 publications per locale = 72 active posts:
- 24 Threads
- 8 Facebook
- 8 Instagram
- 8 TikTok
- 8 YouTube
- 8 Pinterest Image
- 8 Pinterest Video

Rules:
- drafts/stale duplicates/duplicate records не рахуються;
- FR має ті самі media/copy/URL/QA/readback вимоги, що й інші connected locales;
- exact locale board + same-language live article URL для Pinterest;
- перед scheduling перевірити article opens, CTA, media QA PASS, approval, platform/date/time/timezone/text/media;
- keep at least 15 minutes між same-platform publications для різних locales, якщо explicit newer rule не задає інше;
- `published` ставити тільки після фактичної публікації/readback.

## 18. Analytics
Відстежувати 24h / 72h / 7d / 30d у розрізі:
- language;
- platform;
- category;
- quote_type;
- author;
- creative;
- publication time.

Кожна locale website використовує відповідний Metricool web tracker.

## 19. Standard command protocol
`наступна цитата` / `готуй наступну` / `працюємо по правилах` означає:

read MASTER_RULES + D1 -> determine `adapted` vs verified `verbatim` -> source/quote QA -> duration gate -> 13 native website localizations -> prompts/copy for connected social locales -> Pinterest preparation -> website reflection -> D1 write -> technical website publication/indexability -> keep editorial visibility hidden until explicit Admin release/schedule -> user media generation/upload -> media QA -> approval -> Metricool schedule complete connected-social set -> Planner readback -> actual publication -> analytics.

## 20. Validation / fail-safe
- `adapted`: no author.
- `verbatim`: verified author/source/original.
- Technically complete but failed native/exact-text/editorial/media QA = NOT production-ready.
- Якщо API unavailable, preserve confirmed D1 state і mark only blocked step.
- Не claim completion без readback.
- Не claim `scheduled` без Planner readback.
- Не claim `published` до actual publication.

## 21. Project isolation
Wise Quotes World і Sweden No Sugar — окремі продукти.

Infrastructure/workflow patterns можна reuse тільки після compatibility review. Records, credentials, mappings, content, CTA, taxonomy та analytics залишаються isolated by `project_id/language/platform`.
