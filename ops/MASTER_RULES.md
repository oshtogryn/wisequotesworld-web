# MASTER RULES — Wise Quotes World

Останнє оновлення: 2026-08-29
Статус: CANONICAL
Версія: database-first v4.3

## 1. Джерела істини
1. `ops/MASTER_RULES.md` — канонічне джерело операційних правил.
2. D1 — канонічне джерело операційних даних.
3. D1 `rules` — машинно-читана копія критичних правил.
4. Google Sheets — migration source/archive, не fallback.
5. GitHub/Cloudflare — code/templates/assets.
6. Новіші explicit user decisions і MASTER_RULES мають пріоритет.
7. Перед новою темою читати актуальний MASTER_RULES.

## 2. Мови
uk, ru, pl, en, sv, de, es, fr. FR active website/Pinterest; social не планувати до підключення FR каналів.

## 3. Контент
Одна думка = один content_id, 8 localizations. `adapted` без автора; `verbatim` тільки verified author/source/original wording.
Кожна локалізація: semantic fidelity + native naturalness QA. Literal translation заборонений, якщо звучить неприродно або змінює емоційний сенс.

## 4. Quote-length gate
Перед prompts/copy перевірити, що quote природно читається в реальній тривалості поточного Gemini/Veo interface/model. Не зашивати універсальні 10 s. Не прискорювати voiceover і не дрібнити текст заради вміщення. Adapted можна скоротити до localization; verbatim wording не скорочувати під виглядом exact quote.

## 5. Workflow
`idea -> source_check -> quote_length_qa -> quote_ready -> localized -> native_language_qa -> prompt_ready -> copy_ready -> website_ready -> pinterest_ready -> media_pending -> media_ready -> approved -> scheduled -> published -> analytics`.

## 6. Gemini/Veo video prompt — PRODUCTION STANDARD v4.3
WQ006 RU successful generation is the confirmed benchmark. Короткий, прямий, структурований prompt працює краще за перевантажений prompt із внутрішніми QA-командами.

### Mandatory structure
1. `Create a premium photorealistic vertical 9:16 cinematic video in <language>.`
2. Один короткий cinematic paragraph: framing + subject + action + setting + light + emotion + camera movement. Одна проста coherent story.
3. `Render only these two <language> text cards exactly as written. No other visible text.`
4. `TEXT CARD 1:` + exact localized block.
5. `Then remove the first text completely.`
6. `TEXT CARD 2:` + exact localized block.
7. Typography: clean, large, elegant, upper-middle safe area; complete stable cards; no individual word/letter animation.
8. `Audio:` calm native narrator reads the two text cards naturally and completely; restrained music below voice.
9. One negative line: `No subtitles. No captions. No emoji. No decorative symbols. No logo. No branding. No watermark. No other readable text.`
10. Clean emotional final shot/hold.

### Exact-text anti-leak rule — HARD
- Quote appears only as intended TEXT CARD 1/2. Audio refers to `the two text cards`; do not repeat the full quote again.
- NEVER put spelling diagnostics inside production prompt.
- NEVER use letter-by-letter spelling, phonetic breakdown, character/Unicode sequences.
- NEVER list wrong spellings/examples.
- NEVER ask Gemini to perform/show character-by-character QA in the generation prompt.
- NEVER add `CRITICAL SPELLING LOCK`, `FINAL LOCK`, `QA CHECK` or similar diagnostic labels.
- Do not repeat the quote or prohibitions many times.
- If a word previously failed, keep a clean exact text card and simplify the prompt; do not add diagnostics.
- Internal QA happens OUTSIDE the generation prompt.

### Video rules
- Immediate meaningful frame; no black intro.
- 1–2 text cards maximum; one stable complete card at a time; card 1 disappears before card 2.
- No typewriter, word-by-word, letter-by-letter, auto subtitles.
- Text upper-middle safe area, mobile-readable.
- Natural native voice, complete first/last words, music lower than voice.
- No generated Wise Quotes World logo/branding. User adds language logo manually in CapCut after PASS.
- Adapted: cinematic human/symbolic story, sincere, no cheap melodrama.
- Verbatim: premium author-specific treatment, same clean text-card/audio structure.

### Prompt simplicity rule — HARD
Accuracy does not mean prompt length. If an instruction is not needed for scene, exact text cards, typography, audio, one concise negative line, or final shot, remove it. Never feed Gemini diagnostic/service text that could leak into the frame.

## 7. Generated-video QA + CapCut
QA happens AFTER generation, not inside prompt. REJECT for wrong/missing text, broken diacritics/punctuation, clipped first/last word, rushed/clipped voice, extra readable text/random letters/auto captions/emoji, AI logo/branding/watermark, or scene contradicting meaning. After PASS add only correct Wise Quotes World language logo in CapCut. Do not duplicate quote with CapCut text.

## 8. Pinterest
2:3 target 1000×1500; finished image contains exact localized quote; mobile-readable typography; no unrelated text/random letters/watermark; no generated Wise Quotes World logo by default. Same anti-leak rule: no letter-by-letter diagnostics or lists of misspellings. User generates manually → Admin upload → R2 → QA → approval.

## 9. Required outputs
For each language: localized quote, Gemini/Veo prompt, voiceover/on-screen text, Pinterest prompt, Facebook, Instagram, 3 Threads, TikTok, YouTube title+description, Pinterest title+description, localized article URL, substantive website reflection. FR prepared fully.

## 10. Social copy
Funnel: social → exact localized article → deeper reflection/more Wise Quotes. Never homepage when localized article exists; never cross-language. Posts must be self-contained and substantive. Working targets: Facebook 550–1000 chars; Instagram 400–800; Threads 3 independent posts; TikTok 250–500; YouTube 2–4 substantive sentences; Pinterest SEO-natural title + 2–4 sentences. Check actual platform limits before scheduling.

## 11. Website article
Separate substantive editorial asset: quote; verified attribution when applicable; meaning; why it matters; life example/reflection; strong conclusion; CTA/internal links. Target 250–500 words, multi-paragraph, native, no filler.
WQ006 final version is the emotional editorial benchmark: short video-suitable quote, self-contained social copy, substantive article, coherent video/Pinterest concept, strong emotion without cheap melodrama. Do not mechanically copy its story.

## 12. Website/database
D1 database-first. New approved content should not require manual deploy. 8 locales, archive, quote/category/verified-author pages, sitemap/hreflang/canonical/internal links.

## 13. Media
R2 canonical binaries; D1 metadata. Upload once/reuse. User generates video/Pinterest manually and uploads via Admin.

## 14. Admin
Create/edit topic, 8 localizations, prompts, copy, article/URL, media upload/QA, approval/reject, workflow/status/errors, planning/readback, analytics. Empty author = NO AUTHOR everywhere.

## 15. Scheduling
Metricool PRIMARY during stabilization. No `scheduled` without Planner readback. No FR social until channels connected. Before scheduling verify article opens, CTA, media QA PASS, approval, network/date/time/timezone/text/media.

## 16. Analytics
24h/72h/7d/30d by language/platform/category/quote_type/author/creative/time.

## 17. Standard command protocol
`наступна цитата` / `готуй наступну` / `працюємо по правилах` = read MASTER_RULES + D1 → source/quote QA → duration gate → 8 native localizations → 8 Gemini/Veo prompts using v4.3 simple template → 8 Pinterest prompts → full social copy + localized URLs → website reflection → D1 → user media generation/upload → media QA outside prompt → approval → Metricool schedule/readback → analytics.

## 18. Validation/fail-safe
Adapted no author; verbatim verified author/source/original. Technically complete but failed native/exact-text/editorial/media QA = NOT production-ready. If API unavailable, preserve confirmed D1 state and mark only blocked step.

## 19. Project isolation
Wise Quotes World and Sweden No Sugar are separate products. Reuse infrastructure/workflow patterns only after compatibility review. Records, credentials, mappings, content, CTA, taxonomy and analytics remain isolated by project_id/language/platform.
