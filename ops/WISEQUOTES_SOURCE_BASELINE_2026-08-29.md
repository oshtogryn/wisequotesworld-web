# Wise Quotes World — source baseline 2026-08-29

Purpose: preserve only the operationally useful information extracted from the supplied `WiseQuotes — Content System` export while keeping current project decisions authoritative.

## Source precedence
1. Current explicit user decisions.
2. `ops/MASTER_RULES.md` current version.
3. D1 current records/rules.
4. Supplied Wise Quotes source export for migration/audit of historical content, platform/account metadata, prompts, publication records and legacy rules.
5. Shared infrastructure patterns from Sweden No Sugar may be reused when technically useful, but never by mixing project content or account data.

## Current overrides of legacy source export
- Languages: current system = 8 (uk, ru, pl, en, sv, de, es, fr). The supplied export is historically 7-language and therefore incomplete for FR.
- Gemini duration: use up to current model maximum, currently 10 seconds. Do not preserve obsolete 8–12 second wording when the model max is lower.
- Pinterest AI generation: frozen. Keep image-prompt generation and manual Admin upload/R2/QA flow.
- Scheduling: Metricool remains primary during stabilization. Native scheduler is deferred.
- Website: database-first, full archive and live categories for all 8 languages, including French.

## Rules retained from source export
- Localizations are native adaptations, not literal translations.
- Double language QA: semantic fidelity + natural native readability.
- One content item expands into all language/platform outputs.
- Gemini prompts must be fully self-contained and must not reference a separate master prompt.
- Video quote text is mandatory where the approved Wise Quotes video format requires it.
- Split long quote into sequential text blocks with zero overlap and a brief no-text gap.
- Locked text: do not translate/paraphrase/rewrite/autocorrect/change punctuation inside the rendering instruction.
- Prompt structure: generate immediately; format/duration/language/style/mood; core idea; exact locked text; timing; safe-zone; voiceover; visual story; camera; original music; no other text; final check.
- Original instrumental music under voice; no recognizable melody/vocals.
- Plan only when localization and media have passed QA/approval.
- Analytics checkpoints include 24h, 72h, 7d and 30d.
- Wise Quotes content and Sweden No Sugar content remain logically isolated even if infrastructure is shared.

## Historical content to audit/import
The supplied export contains WQ001–WQ010 canonical items, 7-language versions, prompts, publication copy, media records, schedule records, account/platform metadata and rules. These records are migration/audit material, not automatically current truth.

Notable legacy data that must be retained where still valid:
- WQ001–WQ010 canonical quote IDs and categories.
- Existing publication copy and scheduling history, including WQ004/WQ005 schedule records.
- Existing media records, especially WQ005 generated files and retry history.
- Existing Wise Quotes account/channel mapping and Pinterest board IDs.
- Existing platform time-zone metadata and analytics checkpoint structure.

## Shared-platform design principle
A future scheduler/analytics service may support both Wise Quotes World and Sweden No Sugar through one shared codebase/control plane. Project separation is mandatory at the data layer: every content, media, publication, credential binding, analytics record and rule must be scoped by `project_id` (and language/platform where applicable). No cross-project defaulting is allowed.
