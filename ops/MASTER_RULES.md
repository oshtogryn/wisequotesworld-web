# MASTER RULES — Wise Quotes World

Останнє оновлення: 2026-09-03
Статус: CANONICAL
Версія: database-first v4.6

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

Усі 8 мов активні для website, Pinterest, Facebook, Instagram, Threads, TikTok і YouTube. Для повної production readiness французька проходить ті самі social/media gates, що й інші 7 мов.

## 3. Контент
Одна думка = один content_id, 8 localizations. Є два production types:
- `adapted` — власні/адаптовані Wise Quotes World думки без автора. Основний established cinematic human/symbolic prompt style.
- `verbatim` — справжня цитата конкретного автора; тільки verified author + verified source + verified original wording. Для неї діє author-specific visual treatment.

Не переносити author/verbatim visual template на `adapted`. Не додавати автора до `adapted`.
Кожна локалізація: semantic fidelity + native naturalness QA. Literal translation заборонений, якщо звучить неприродно або змінює емоційний сенс.

## 4. Quote-length gate
Перед prompts/copy перевірити, що quote природно читається в реальній тривалості поточного Gemini/Veo interface/model. Не зашивати універсальні 10 s. Не прискорювати voiceover і не дрібнити текст заради вміщення. Adapted можна скоротити до localization; verbatim wording не скорочувати під виглядом exact quote.

## 5. Workflow
`idea -> source_check -> quote_length_qa -> quote_ready -> localized -> native_language_qa -> prompt_ready -> copy_ready -> website_ready -> pinterest_ready -> media_pending -> media_ready -> approved -> scheduled -> published -> analytics`.

## 6. Gemini/Veo video prompt — PRODUCTION STANDARD v4.6
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
- Use a distinct premium author-specific treatment only when author, source and original wording are verified.
- Keep the author recognizably central through a dignified portrait/sculpture/art-historical treatment appropriate to the person/period; never imply fake authentic historical footage.
- Do not make it a static museum slideshow. Give the quote its own cinematic visual metaphor and micro-dramaturgy.
- Premium, restrained, intellectual/editorial tone; avoid superhero aesthetics, generic motivational-ad clichés and excessive melodrama.
- Quote wording remains exact. Attribution is explicit. Exact quote may be split across up to two stable sequential text cards when semantically justified.

### Exact-text anti-leak rule — HARD
- Quote appears only in intended stable text card(s).
- NEVER put spelling diagnostics, letter-by-letter spelling, phonetic breakdown, wrong spellings, character/Unicode sequences, QA labels or similar diagnostics inside production prompt.
- Internal QA happens OUTSIDE the generation prompt.

### Video rules
- Immediate meaningful frame; no black intro.
- No typewriter, word-by-word, letter-by-letter, auto subtitles.
- Text upper-middle safe area, mobile-readable.
- Natural native voice, complete first/last words, music lower than voice.
- No generated Wise Quotes World logo/branding. User adds language logo manually in CapCut after PASS.
- Adapted: cinematic human/symbolic story, sincere, no cheap melodrama.
- Verbatim: premium author-specific micro-film with a quote-specific metaphor.

### Prompt simplicity rule — HARD
Accuracy does not mean prompt length. Use only instructions needed for the cinematic concept, exact text, typography, audio, concise negatives and final shot.

## 7. Generated-video QA + CapCut
QA happens AFTER generation, not inside prompt. REJECT for wrong/missing text, broken diacritics/punctuation, clipped first/last word, rushed/clipped voice, extra readable text/random letters/auto captions/emoji, AI logo/branding/watermark, or scene contradicting meaning. For verbatim also REJECT incorrect/missing author attribution or fake historical-footage implication. After PASS add only correct Wise Quotes World language logo in CapCut. Do not duplicate quote with CapCut text.

## 8. Pinterest
2:3 target 1000×1500; finished image contains exact localized quote; mobile-readable typography; no unrelated text/random letters/watermark; no generated Wise Quotes World logo by default. User generates manually → Admin upload → R2 → QA → approval.

Pinterest is MANDATORY for every approved topic in all 8 languages. Each locale must have its own Pinterest image, localized SEO title, localized description, exact same-language article destination, and correct locale board.

## 9. Required outputs
For each language: localized quote, Gemini/Veo prompt, voiceover/on-screen text, Pinterest prompt, Facebook, Instagram, 3 Threads, TikTok, YouTube title+description, Pinterest title+description, localized article URL, substantive website reflection.

## 10. Social copy + link policy — HARD
Posts must be self-contained and substantive. Working targets: Facebook 550–1000 chars; Instagram 400–800; Threads 3 independent posts; TikTok 250–500; YouTube 2–4 substantive sentences; Pinterest SEO-natural title + 2–4 sentences. Check actual platform limits before scheduling.

- **Hashtags:** максимум 5 хештегів у будь-якому social post/caption. Використовувати лише релевантні; кількість не є самоціллю. `#WiseQuotesWorld` зберігати, коли доречно.

Platform link routing is mandatory:
- **Facebook:** include the exact same-language article URL directly in the post. It is the clickable funnel to the article.
- **Threads:** include the exact same-language article URL directly in the post. It is the clickable funnel to the article.
- **Instagram Reels:** do NOT put the raw article URL in the video caption/description. Use a natural localized CTA equivalent to “Link in profile”. The locale website link must be configured in the Instagram profile.
- **YouTube Shorts:** do NOT put the raw article URL in the Shorts description. Use a natural localized CTA equivalent to “Link in profile”. The locale website link must be configured in the YouTube channel profile.
- **TikTok:** keep the locale website address in the video caption/description as visible plain text even when TikTok does not make it clickable. Do NOT falsely call it a clickable link or say “link in profile” when the account has no website/profile link. The TikTok CTA may invite the viewer to follow and/or visit the displayed WiseQuotesWorld.com locale address manually.
- **Pinterest:** pin destination remains the exact same-language article URL via the Pinterest destination-link field; localized description remains SEO-natural.
- Never send a locale to the homepage or another language when an exact localized article exists.

## 11. Website article
Separate substantive editorial asset: quote; verified attribution when applicable; meaning; why it matters; life example/reflection; strong conclusion; CTA/internal links. Target 250–500 words, multi-paragraph, native, no filler.
WQ006 final version is the emotional editorial benchmark for adapted content. For verbatim content, include verified attribution/source/original wording and interpret context responsibly.

## 12. Website/database
D1 database-first. New approved content should not require manual deploy. 8 locales, archive, quote/category/verified-author pages, sitemap/hreflang/canonical/internal links.

## 13. Media
R2 canonical binaries; D1 metadata. Upload once/reuse. User generates video/Pinterest manually and uploads via Admin.

## 14. Admin
Create/edit topic, 8 localizations, prompts, copy, article/URL, media upload/QA, approval/reject, workflow/status/errors, planning/readback, analytics. Media batch upload must support video and Pinterest creative for all 8 locales, including FR. Empty author = NO AUTHOR everywhere.

## 15. Scheduling
Metricool PRIMARY during stabilization. No `scheduled` without Planner readback. Before scheduling verify article opens, CTA, media QA PASS, approval, network/date/time/timezone/text/media.

### Pinterest scheduling gate — HARD
- Every approved topic must be checked for Pinterest before the topic can be considered fully scheduled.
- Required Pinterest coverage is 8/8 locales: uk, ru, pl, en, sv, de, es, fr.
- Use exact locale board and exact live same-language D1 article URL as `pinLink`.
- Use approved Pinterest image from R2/D1.
- Planner readback must confirm every Pinterest post.

### Social scheduling gate — HARD
- Social coverage is 8/8 locales for Facebook, Instagram, Threads, TikTok and YouTube where connected.
- FR has the same required video, platform copy, locale URL, media QA and Planner readback as other locales.
- Before scheduling, validate platform link policy in §10: Facebook/Threads use direct article URLs; Instagram/YouTube use profile CTA without raw URL; TikTok keeps the visible locale website address as plain text.

## 16. Analytics
24h/72h/7d/30d by language/platform/category/quote_type/author/creative/time. Each locale website must use corresponding Metricool web tracker.

## 17. Standard command protocol
`наступна цитата` / `готуй наступну` / `працюємо по правилах` = read MASTER_RULES + D1 → determine `adapted` vs verified `verbatim` → source/quote QA → duration gate → 8 native localizations → 8 Gemini/Veo prompts → 8 Pinterest prompts → full social copy with platform-correct CTA/links + localized URLs → website reflection → D1 → user media generation/upload → media QA → approval → Metricool schedule all 8 locales including Pinterest 8/8 → Planner readback → analytics.

## 18. Validation/fail-safe
Adapted no author; verbatim verified author/source/original. Technically complete but failed native/exact-text/editorial/media QA = NOT production-ready. If API unavailable, preserve confirmed D1 state and mark only blocked step.

## 19. Project isolation
Wise Quotes World and Sweden No Sugar are separate products. Reuse infrastructure/workflow patterns only after compatibility review. Records, credentials, mappings, content, CTA, taxonomy and analytics remain isolated by project_id/language/platform.
