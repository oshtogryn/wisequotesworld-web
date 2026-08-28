# Wise Quotes World — Two-day validation plan

Prepared: 2026-08-28
Target dates: 2026-08-29 and 2026-08-30
Purpose: validate full database-first workflow with one authorless adapted quote and one verified verbatim quote.

## DAY 1 — 2026-08-29 — WQ006 — adapted / no author

### Canonical idea
Quote type: `adapted`
Author: NONE
Original/editorial language: Ukrainian
Canonical UA quote:
`Не кожне рішення змінює життя одразу. Але деякі тихо змінюють напрямок.`

Core meaning: important decisions often do not create dramatic instant results; they quietly redirect a person's future.
Category: decisions / life direction / change

### Semantic visual concept
A person reaches a calm fork in an ordinary city path at early morning. No dramatic signs or fantasy. They pause, choose one direction, and walk forward. The emotional emphasis is quiet decision rather than instant triumph.

Pinterest must preserve the SAME meaning: the person at the fork/choice point, with strong 2:3 composition and enough negative space for quote text.

### Author propagation rule
`author_name = NULL`
Therefore author MUST NOT appear in video prompt, on-screen text, voiceover attribution, Pinterest, website attribution, captions or metadata.

### Initial 8-language quote set
UK: `Не кожне рішення змінює життя одразу. Але деякі тихо змінюють напрямок.`
RU: `Не каждое решение сразу меняет жизнь. Но некоторые тихо меняют её направление.`
PL: `Nie każda decyzja od razu zmienia życie. Niektóre po cichu zmieniają jego kierunek.`
EN: `Not every decision changes your life at once. Some quietly change its direction.`
SV: `Alla beslut förändrar inte livet direkt. Men vissa ändrar stilla dess riktning.`
DE: `Nicht jede Entscheidung verändert dein Leben sofort. Manche verändern still seine Richtung.`
ES: `No todas las decisiones cambian tu vida de inmediato. Algunas cambian su rumbo en silencio.`
FR: `Toutes les décisions ne changent pas une vie immédiatement. Certaines en changent discrètement la direction.`

All non-UK versions require native naturalness QA before approval.

## DAY 2 — 2026-08-30 — WQ007 — verbatim / verified author

### Canonical source
Quote type: `verbatim`
Author: Friedrich Nietzsche
Original language: German
Work: `Götzen-Dämmerung oder Wie man mit dem Hammer philosophiert`
Section: `Sprüche und Pfeile`, aphorism 8
Canonical source text:
`Was mich nicht umbringt, macht mich stärker.`
Extended source context begins: `Aus der Kriegsschule des Lebens.`
Attribution status: `verified`

Verification note: source text must be stored from a reliable edition/source before publishing. Do not use a secondary popular-language paraphrase as canonical master.

### Semantic visual concept
Premium author treatment. Elegant animated marble/bronze bust inspired by late-19th-century museum portrait sculpture of Nietzsche, rotating very slowly under controlled gallery light. The quote is the focal point; the author image supports it rather than becoming a gimmick. No claim that this is authentic footage. Alternative acceptable treatment: restrained cinematic study with silhouette/manuscript/19th-century study motifs.

Pinterest must derive from the SAME treatment: vertical 2:3 museum-like portrait/sculpture scene, quote readable, `Friedrich Nietzsche` attribution visible and secondary to the quotation.

### Translation policy
German source is canonical. Every other language is adapted FROM THE ORIGINAL GERMAN, preserving meaning and brevity. Do not chain translations via English/Russian/Ukrainian.

Initial 8-language set for linguistic QA:
DE original: `Was mich nicht umbringt, macht mich stärker.`
UK: `Те, що мене не вбиває, робить мене сильнішим.`
RU: `То, что меня не убивает, делает меня сильнее.`
PL: `Co mnie nie zabija, czyni mnie silniejszym.`
EN: `What does not kill me makes me stronger.`
SV: `Det som inte dödar mig gör mig starkare.`
ES: `Lo que no me mata me hace más fuerte.`
FR: `Ce qui ne me tue pas me rend plus fort.`

All translated versions require native naturalness QA. Website must clearly indicate that translations are localized renderings of the verified German original.

## End-to-end acceptance criteria for BOTH days
1. content item exists in D1;
2. all 8 content_versions exist;
3. FR prepared, but FR social publishing disabled;
4. video prompts generated for 8 languages;
5. Pinterest creative prompt/image generated for 8 languages;
6. Pinterest keeps semantic continuity with video concept;
7. all platform copy generated and stored;
8. website quote/reflection pages prepared for 8 locales;
9. author propagation rule validated on WQ006 (no author anywhere);
10. source/original-language/author propagation validated on WQ007;
11. Admin preview supports edit/approve/reject/regenerate;
12. connected 7-language media can be uploaded through Admin/Media Inbox;
13. after explicit approval, connected social posts can be scheduled through Metricool;
14. scheduling success requires planner readback before D1 becomes `scheduled`;
15. analytics checkpoints can be attached after publication.
