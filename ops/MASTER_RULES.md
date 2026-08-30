# MASTER RULES — Wise Quotes World

Останнє оновлення: 2026-08-30
Статус: CANONICAL
Версія: database-first v4.5

## 1. Джерела істини
1. `ops/MASTER_RULES.md` — канонічне джерело операційних правил.
2. D1 — канонічне джерело операційних даних.
3. D1 `rules` — машинно-читана копія критичних правил.
4. Google Sheets — migration source/archive, не fallback.
5. GitHub/Cloudflare — code/templates/assets.
6. Новіші explicit user decisions і MASTER_RULES мають пріоритет.
7. Перед новою темою читати актуальний MASTER_RULES.

## 2. Мови
uk, ru, pl, en, sv, de, es, fr.

Усі 8 мов активні для website, Pinterest, Facebook, Instagram, Threads, TikTok і YouTube. Попереднє обмеження FR лише до website/Pinterest скасоване після створення французьких каналів. Для повної production readiness французька тепер проходить ті самі social/media gates, що й інші 7 мов.

## 3. Контент
Одна думка = один content_id, 8 localizations. Є два принципово різні production types:
- `adapted` — власні/адаптовані Wise Quotes World думки без автора. Це основний поточний формат; його established cinematic human/symbolic prompt style НЕ змінювати через правила для авторських цитат.
- `verbatim` — справжня крилата цитата конкретного автора; тільки verified author + verified source + verified original wording. Для неї діє окремий author-specific visual treatment у §6A.

Не переносити author/verbatim visual template на `adapted`. Не додавати автора до `adapted`.
Кожна локалізація: semantic fidelity + native naturalness QA. Literal translation заборонений, якщо звучить неприродно або змінює емоційний сенс.

## 4. Quote-length gate
Перед prompts/copy перевірити, що quote природно читається в реальній тривалості поточного Gemini/Veo interface/model. Не зашивати універсальні 10 s. Не прискорювати voiceover і не дрібнити текст заради вміщення. Adapted можна скоротити до localization; verbatim wording не скорочувати під виглядом exact quote.

## 5. Workflow
`idea -> source_check -> quote_length_qa -> quote_ready -> localized -> native_language_qa -> prompt_ready -> copy_ready -> website_ready -> pinterest_ready -> media_pending -> media_ready -> approved -> scheduled -> published -> analytics`.

## 6. Gemini/Veo video prompt — PRODUCTION STANDARD v4.5
WQ006 RU successful generation is the confirmed benchmark for `adapted`. Короткий, прямий, структурований prompt працює краще за перевантажений prompt із внутрішніми QA-командами.

### Mandatory structure
1. `Create a premium photorealistic vertical 9:16 cinematic video in <language>.`
2. Один cinematic concept: framing + subject + action + setting + light + emotion + camera movement. Одна coherent story.
3. Exact localized text card(s); no other visible text.
4. Typography: clean, large, elegant, upper-middle safe area; complete stable cards; no individual word/letter animation.
5. `Audio:` calm native narrator reads exact intended quote/attribution naturally and completely; restrained music below voice.
6. One concise negative line: `No subtitles. No captions. No emoji. No decorative symbols. No logo. No branding. No watermark. No other readable text.`
7. Clean emotional final shot/hold.

### 6A. Two prompt families — HARD
**A. `adapted` / own Wise Quotes World quote**
- Preserve the established WQ006-style cinematic human/symbolic storytelling used for our own/adapted quotes.
- Do NOT convert adapted quotes into philosopher busts, museum portraits, author cards, or the author-specific template below.
- Continue choosing a sincere human or symbolic scene that directly embodies the quote; strong emotion without cheap melodrama.

**B. `verbatim` / verified real-author quote**
- Use a distinct premium “Great / Winged Quotes” author-specific treatment only when author, source and original wording are verified.
- Keep the author recognizably central through a dignified portrait/sculpture/art-historical treatment appropriate to that person and period; never imply fake authentic historical footage.
- Do not make it a static museum slideshow. Give the quote its own cinematic visual metaphor and micro-dramaturgy: immediate hook → visual pressure/question → transformation/reveal synchronized with the meaning → strong final author attribution.
- Camera, light, environment and symbolic details should tell the thought, not merely decorate the author. For a quote about adversity/strength, pressure/cracks/darkness-to-light may support the idea; for another author/quote invent a different metaphor rather than mechanically reusing Nietzsche’s cracks or lighting.
- Premium, restrained, intellectual/editorial tone; avoid superhero aesthetics, generic motivational-ad clichés and excessive melodrama.
- Quote wording remains exact. Attribution is explicit. If the quote benefits from semantic pacing, the exact quote may be split across up to two stable sequential text cards without changing, adding or paraphrasing words; author attribution may follow as the final stable card. Do not split merely for decoration.
- This author-specific family is NOT a replacement for the adapted/WQ006 family.

### Exact-text anti-leak rule — HARD
- Quote appears only in intended stable text card(s). Do not repeat the full quote elsewhere in production instructions except where needed for the exact card/audio content.
- NEVER put spelling diagnostics inside production prompt.
- NEVER use letter-by-letter spelling, phonetic breakdown, character/Unicode sequences.
- NEVER list wrong spellings/examples.
- NEVER ask Gemini to perform/show character-by-character QA in the generation prompt.
- NEVER add `CRITICAL SPELLING LOCK`, `FINAL LOCK`, `QA CHECK` or similar diagnostic labels.
- Do not repeat prohibitions many times.
- If a word previously failed, keep a clean exact text card and simplify the prompt; do not add diagnostics.
- Internal QA happens OUTSIDE the generation prompt.

### Video rules
- Immediate meaningful frame; no black intro.
- Adapted: normally 1–2 stable text cards as established by the approved prompt for that quote.
- Verbatim: up to 2 sequential quote cards when semantically justified, followed by a stable author attribution card; never show competing cards simultaneously.
- No typewriter, word-by-word, letter-by-letter, auto subtitles.
- Text upper-middle safe area, mobile-readable.
- Natural native voice, complete first/last words, music lower than voice.
- No generated Wise Quotes World logo/branding. User adds language logo manually in CapCut after PASS.
- Adapted: cinematic human/symbolic story, sincere, no cheap melodrama.
- Verbatim: premium author-specific micro-film per §6A, with a quote-specific metaphor rather than a reusable static author template.

### Prompt simplicity rule — HARD
Accuracy does not mean prompt length. Use only instructions needed for the cinematic concept, exact text, typography, audio, concise negatives and final shot. Never feed Gemini diagnostic/service text that could leak into the frame.

## 7. Generated-video QA + CapCut
QA happens AFTER generation, not inside prompt. REJECT for wrong/missing text, broken diacritics/punctuation, clipped first/last word, rushed/clipped voice, extra readable text/random letters/auto captions/emoji, AI logo/branding/watermark, or scene contradicting meaning. For verbatim also REJECT incorrect/missing author attribution or treatment that falsely presents generated imagery as authentic historical footage. After PASS add only correct Wise Quotes World language logo in CapCut. Do not duplicate quote with CapCut text.

## 8. Pinterest
2:3 target 1000×1500; finished image contains exact localized quote; mobile-readable typography; no unrelated text/random letters/watermark; no generated Wise Quotes World logo by default. Same anti-leak rule: no letter-by-letter diagnostics or lists of misspellings. User generates manually → Admin upload → R2 → QA → approval.

Pinterest is a MANDATORY publication channel for every approved Wise Quotes World topic in all 8 languages. Each locale must have its own Pinterest image, localized SEO title, localized description, exact same-language article destination, and correct locale board.

## 9. Required outputs
For each language: localized quote, Gemini/Veo prompt using the correct `adapted` or `verbatim` family, voiceover/on-screen text, Pinterest prompt, Facebook, Instagram, 3 Threads, TikTok, YouTube title+description, Pinterest title+description, localized article URL, substantive website reflection.

## 10. Social copy
Funnel: social → exact localized article → deeper reflection/more Wise Quotes. Never homepage when localized article exists; never cross-language. Posts must be self-contained and substantive. Working targets: Facebook 550–1000 chars; Instagram 400–800; Threads 3 independent posts; TikTok 250–500; YouTube 2–4 substantive sentences; Pinterest SEO-natural title + 2–4 sentences. Check actual platform limits before scheduling.

## 11. Website article
Separate substantive editorial asset: quote; verified attribution when applicable; meaning; why it matters; life example/reflection; strong conclusion; CTA/internal links. Target 250–500 words, multi-paragraph, native, no filler.
WQ006 final version is the emotional editorial benchmark for adapted content: short video-suitable quote, self-contained social copy, substantive article, coherent video/Pinterest concept, strong emotion without cheap melodrama. Do not mechanically copy its story.
For verbatim content, include verified attribution/source/original wording and interpret context responsibly rather than flattening the quote into generic motivation.

## 12. Website/database
D1 database-first. New approved content should not require manual deploy. 8 locales, archive, quote/category/verified-author pages, sitemap/hreflang/canonical/internal links.

## 13. Media
R2 canonical binaries; D1 metadata. Upload once/reuse. User generates video/Pinterest manually and uploads via Admin.

## 14. Admin
Create/edit topic, 8 localizations, prompts, copy, article/URL, media upload/QA, approval/reject, workflow/status/errors, planning/readback, analytics. Media batch upload must support both video and Pinterest creative for all 8 locales, including FR. Empty author = NO AUTHOR everywhere.

## 15. Scheduling
Metricool PRIMARY during stabilization. No `scheduled` without Planner readback. Before scheduling verify article opens, CTA, media QA PASS, approval, network/date/time/timezone/text/media.

### Pinterest scheduling gate — HARD
- Every approved topic must be checked for Pinterest before the topic can be considered fully scheduled.
- Required Pinterest coverage is **8/8 locales: uk, ru, pl, en, sv, de, es, fr**.
- Use the exact locale board ID/name from canonical routing and the exact live same-language D1 article URL as `pinLink`.
- Use the approved Pinterest image from R2/D1 media, not the social video frame unless explicitly approved as the Pinterest creative.
- Planner readback must confirm every Pinterest post. A topic with social posts scheduled but missing Pinterest is NOT fully scheduled.
- When reporting a completed scheduling batch, report Pinterest separately and include its 8/8 status.

### Social scheduling gate — HARD
- Social coverage is now **8/8 locales: uk, ru, pl, en, sv, de, es, fr** for Facebook, Instagram, Threads, TikTok and YouTube where connected.
- FR must have the same required video, platform copy, locale URL, media QA and Planner readback as the other active locales.

## 16. Analytics
24h/72h/7d/30d by language/platform/category/quote_type/author/creative/time. Each locale website must use the corresponding Metricool web tracker so traffic is not mixed across languages.

## 17. Standard command protocol
`наступна цитата` / `готуй наступну` / `працюємо по правилах` = read MASTER_RULES + D1 → determine `adapted` vs verified `verbatim` → source/quote QA → duration gate → 8 native localizations → 8 Gemini/Veo prompts using the matching prompt family (§6A) → 8 Pinterest prompts → full social copy + localized URLs → website reflection → D1 → user media generation/upload → media QA outside prompt → approval → Metricool schedule for all 8 active social locales including Pinterest 8/8 → Planner readback for all networks including Pinterest → analytics.

## 18. Validation/fail-safe
Adapted no author; verbatim verified author/source/original. Technically complete but failed native/exact-text/editorial/media QA = NOT production-ready. If API unavailable, preserve confirmed D1 state and mark only blocked step.

## 19. Project isolation
Wise Quotes World and Sweden No Sugar are separate products. Reuse infrastructure/workflow patterns only after compatibility review. Records, credentials, mappings, content, CTA, taxonomy and analytics remain isolated by project_id/language/platform.
