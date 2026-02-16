# SPLinter Field Lineage End-to-End Audit

Date: 2026-02-14
Scope: `parser -> AST -> lineage analyzer/handlers -> lineage store -> SPLinter hover/highlight UI`

## Artifacts Produced
- `docs/field_lineage_command_matrix.csv`
- `docs/field_lineage_command_matrix.json`
- `docs/field_lineage_repro_results.json`
- `docs/field_lineage_repro_test_run.log`

## Architecture Baseline (Confirmed)
1. SPLinter parses text via `useSPLParser` and stores parse state in editor store (`src/features/splinter/ui/panels/SplAnalysisPanel.tsx:27`, `src/entities/spl/hooks/useSPLParser.ts:85`).
2. Lineage hook runs `analyzeLineage(ast)` and stores index in lineage store (`src/entities/field/model/hooks/useFieldLineage.ts:56`, `src/entities/field/store/lineage-store.ts:82`).
3. Analyzer resolves handlers per stage with tracked-command filtering (`src/entities/field/lib/lineage/analyzer.ts:160`, `src/entities/field/lib/lineage/command-handlers/index.ts:349`).
4. SPLinter hover/highlight/underlines only render when lineage events exist (`src/features/splinter/ui/panels/SplAnalysisPanel.tsx:72`, `src/features/splinter/ui/panels/SplAnalysisPanel.tsx:88`, `src/features/splinter/ui/panels/SplAnalysisPanel.tsx:115`).

## Command Matrix Summary
- Total commands in matrix: 147
- Commands with handlers but not default-tracked: 39
- Dedicated-parser commands without direct handler entry: 37
- Default-tracked commands without direct handler entry: 6
- Handlers with zero direct test references: 1 (`search`)

Note: some "no direct handler" commands still use pattern fallback. This is one reason drift is hard to reason about.

## Corpus Reproduction Summary
From `docs/test_searches.md` corpus (120 queries):
- Problem queries: 112
- Hard parse/AST failures: 3
- Parse warnings with AST returned: 30
- Filtered stages under default tracked list: 151
- Cases where default lineage missed created fields vs full analysis: 12
- Most filtered commands: `search` (103), `sort` (9), `where` (9), `head` (5), `convert` (3)

## Risk Register (Ranked)

### 1) Critical: Valid complex SPL can hard-fail AST transformation
- Bucket: parser loss
- Evidence:
  - `parseSPL` always calls `transformCST`; transformer exceptions null out AST (`src/entities/spl/lib/parser/index.ts:90`).
  - 3 corpus crashes with stack traces in `docs/field_lineage_repro_test_run.log` and entries in `docs/field_lineage_repro_results.json` (`parse_failure_details`):
    - `bucketdir _bkt AS ...` fails grammar then crashes visitor (`src/entities/spl/lib/parser/grammar/rules/commands/field-affecting.ts:124`, `src/entities/spl/lib/parser/ast/visitors/field-affecting.mixin.ts:175`).
    - `makecontinuous _time span=1h` fails on `1h` token then crashes visitor (`src/entities/spl/lib/parser/grammar/rules/commands/field-affecting.ts:226`, `src/entities/spl/lib/parser/ast/visitors/field-affecting.mixin.ts:325`).
    - `rename All_Traffic.* AS *` fails then crashes visitor (`src/entities/spl/lib/parser/grammar/rules/commands/field-creators.ts:158`, `src/entities/spl/lib/parser/ast/visitors/field-creators.mixin.ts:200`).
- User impact: no AST means no lineage index, so hover/highlight/underlines are empty.
- Why tests miss it: current e2e lineage tests are simple chains (`eval/stats/rename`) and do not execute these syntactic forms (`e2e/insplector/field-lineage.spec.ts:28`, `e2e/insplector/field-lineage.spec.ts:173`).
- Remediation:
  - Harden CST visitors against partial/missing children.
  - Expand grammar support for these valid forms.
  - Add parser crash regression tests from `parse_failure_details`.
- Cost: M, Confidence: High

### 2) High: Grammar-to-AST dispatch gaps bypass intended handlers
- Bucket: dispatch loss
- Evidence:
  - Pipeline grammar includes commands like `metadata`, `setfields`, `tags`, `xyseries`, `timewrap`, `contingency` (`src/entities/spl/lib/parser/grammar/rules/pipeline.ts:93`, `src/entities/spl/lib/parser/grammar/rules/pipeline.ts:154`).
  - Transformer visitor registry does not map many of these and falls back to generic (`src/entities/spl/lib/parser/ast/transformer.ts:74`, `src/entities/spl/lib/parser/ast/transformer.ts:223`).
  - Audit diff: 104 pipeline command rules vs 77 mapped visitors; 27 missing, including 7 commands that already have lineage handlers (`metadata`, `setfields`, `tags`, `timewrap`, `xyseries`, `contingency`, `search`).
  - Targeted evidence:
    - `metadata_reset_semantics` stage is `GenericCommand generic`; full analysis still `handlePassThrough`, and expected metadata created fields are missing.
    - `setfields_dispatch_loss` stage is `GenericCommand generic`; expected created fields (`severity`, `processed`, `source_system`) are missing.
    - See `docs/field_lineage_repro_results.json` (`targeted_results`).
- User impact: implemented handlers never execute for some parsed commands.
- Why tests miss it: no contract test that each grammar command alternative is mapped to a transformer visitor.
- Remediation:
  - Add compile-time/runtime dispatch contract test: `pipeline command rules == commandVisitors`.
  - Wire missing visitor entries.
- Cost: M, Confidence: High

### 3) High: Default tracked command allowlist drops real lineage in production flow
- Bucket: dispatch loss
- Evidence:
  - Default tracked list is only 41 commands (`src/entities/field/lib/lineage/analyzer.ts:56`).
  - Untracked commands are forced to pass-through (`src/entities/field/lib/lineage/command-handlers/index.ts:349`).
  - 39 commands have handlers but are not default-tracked (`docs/field_lineage_command_matrix.json`).
  - Corpus run shows 151 filtered stages and 12 cases with created-field loss under defaults (`docs/field_lineage_repro_results.json`).
  - Missing-created cases include `xpath`, `erex`, `convert`, `fieldsummary`, `geom`, `concurrency`, `typer`, `reltime`, `mcatalog`, `mpreview`, `findtypes`, `searchtxn`.
- User impact: silent incomplete hover/highlight lineage on common advanced searches.
- Why tests miss it: tests usually run full behavior for targeted handlers; no default-vs-full parity gate in CI.
- Remediation:
  - Replace static allowlist with policy based on handler/pattern availability.
  - Add default-vs-full parity test budget over corpus.
- Cost: M, Confidence: High

### 4) High: Generic-command pattern fallback is inconsistent
- Bucket: dispatch loss
- Evidence:
  - Main handler resolution correctly derives `commandName` from `GenericCommand.commandName` (`src/entities/field/lib/lineage/command-handlers/index.ts:106`).
  - Pattern fallback helper derives name from AST type only, so generic commands become `generic` (`src/entities/field/lib/lineage/command-handlers/pattern-based.ts:149`).
- User impact: generic commands with patterns can miss fallback and degrade to pass-through.
- Why tests miss it: no dedicated tests for generic-command pattern fallback with commandName-sensitive behavior.
- Remediation:
  - Share one `getCommandNameFromStage` utility across index and pattern fallback.
  - Add tests for `GenericCommand` commands with patterns and without dedicated handlers.
- Cost: S, Confidence: High

### 5) High: Subsearch lineage projection loses BY-key semantics and dependencies
- Bucket: scope/subsearch loss
- Evidence:
  - Subsearch field extraction keeps only `origin.kind === 'created'` (`src/entities/field/lib/lineage/command-handlers/subsearch.ts:53`).
  - Merged fields are appended with empty dependencies (`src/entities/field/lib/lineage/command-handlers/subsearch.ts:105`).
  - `stats` BY fields are consumed, not created (`src/entities/field/lib/lineage/command-handlers/stats.ts:84`).
  - Targeted case `subsearch_by_field_projection` misses expected created `customfield` in both default and full analysis (`docs/field_lineage_repro_results.json`).
- User impact: lineage for correlated fields in append/join/union workflows is incomplete or misleading.
- Why tests miss it: scope-aware tests do not assert BY-field propagation and dependency fidelity through subsearch merges.
- Remediation:
  - Merge full subsearch lineage summaries, not only created origins.
  - Preserve BY/group keys and dependency graph when projecting into parent scope.
- Cost: M-L, Confidence: Medium-High

### 6) Medium-High: Modification semantics are computed then dropped
- Bucket: semantic loss
- Evidence:
  - Handlers emit `modifies` for commands like `convert`, `nomv`, `xmlunescape`, `makemv` (`src/entities/field/lib/lineage/command-handlers/field-operations.ts:45`, `src/entities/field/lib/lineage/command-handlers/field-affecting.ts:217`, `src/entities/field/lib/lineage/command-handlers/extraction.ts:127`).
  - Analyzer explicitly skips modifications (`src/entities/field/lib/lineage/analyzer.ts:292`).
  - Targeted `modify_only_convert_nomv` shows no modification events in inspected field event kinds (`docs/field_lineage_repro_results.json`).
- User impact: value-transforming commands are invisible in lineage UI.
- Why tests miss it: no tests asserting modification event visibility in UI.
- Remediation:
  - Re-enable modification events with separate UI style.
  - If noise concerns remain, gate by confidence or command class.
- Cost: M, Confidence: High

### 7) Medium-High: Parser warnings are not treated as lineage risk signals
- Bucket: parser loss / semantic loss
- Evidence:
  - 30 corpus queries returned AST with parser errors (`docs/field_lineage_repro_results.json`, `parse_warning_details`).
  - `useFieldLineage` analyzes if `ast` exists, ignoring `parseErrors` (`src/entities/field/model/hooks/useFieldLineage.ts:56`).
- User impact: users see lineage from partial parse with no confidence indicator.
- Why tests miss it: error-handling tests assert UI does not crash, not lineage correctness under parse-warning states.
- Remediation:
  - Surface parse-warning badge in SPLinter lineage UI.
  - Add lineage confidence downgrade when parseErrors > 0.
- Cost: S-M, Confidence: High

### 8) Medium: Lookup source-text fallback is effectively disabled in SPLinter path
- Bucket: semantic loss
- Evidence:
  - Lookup handler fallback parses `OUTPUT` from source line when AST output mappings are empty (`src/entities/field/lib/lineage/command-handlers/lookup.ts:57`).
  - Analyzer defaults `source` to empty (`src/entities/field/lib/lineage/analyzer.ts:114`).
  - SPLinter calls `analyzeLineage(ast)` without `source` (`src/entities/field/model/hooks/useFieldLineage.ts:56`).
- User impact: edge lookup forms that rely on fallback cannot recover output lineage.
- Why tests miss it: no tests force `outputMappings.length===0` with/without source.
- Remediation:
  - Pass `splText` to `analyzeLineage(ast, { source: splText })` in SPLinter hook.
  - Add explicit fallback tests.
- Cost: S, Confidence: High

### 9) Medium: Warning logic can suppress unknown-field diagnostics
- Bucket: semantic loss
- Evidence:
  - `consumeField` backfills missing field as implicit origin (`src/entities/field/lib/lineage/field-tracker.ts:157`).
  - Warning check runs after consume and checks `fieldExists` (`src/entities/field/lib/lineage/analyzer.ts:313`, `src/entities/field/lib/lineage/analyzer.ts:343`).
- User impact: false negatives in warnings for unresolved references.
- Why tests miss it: no tests asserting unknown-field warnings in presence of consume backfill.
- Remediation:
  - Evaluate warnings before backfill, or mark backfilled origins and still emit warning.
- Cost: S, Confidence: Medium-High

### 10) Medium: Test suite intentionally tolerates coverage gaps
- Bucket: test strategy
- Evidence:
  - Handler coverage test allows missing handlers (`<= 10`) and only enforces >=50% dedicated coverage (`src/entities/field/lib/lineage/handler-coverage.test.ts:309`, `src/entities/field/lib/lineage/handler-coverage.test.ts:326`).
  - E2E lineage tests are mostly simple `eval/stats/rename` chains and UI smoke checks (`e2e/insplector/field-lineage.spec.ts:28`, `e2e/insplector/field-lineage.spec.ts:173`, `e2e/insplector/field-lineage.spec.ts:246`).
- User impact: complex lineage regressions reach users first.
- Remediation:
  - Add contract tests for parser->visitor->handler wiring.
  - Add corpus-driven parity tests (default vs full tracked).
  - Add subsearch BY and modification visibility assertions.
- Cost: M, Confidence: High

## Required Scenario Coverage Check
1. Complex lookup forms with aliased outputs: covered in targeted cases (`lookup_outputnew_aliases_parse_fallback`), but fallback path still needs dedicated `outputMappings=[]` test.
2. Subsearch with BY fields: reproduced (`subsearch_by_field_projection`), BY key missing as created lineage.
3. Generic-command fallback path: reproduced with `metadata_reset_semantics` and `setfields_dispatch_loss` (generic pass-through).
4. Modify-only commands: reproduced (`modify_only_convert_nomv`), no modification events visible.
5. Generator/reset semantics: exercised (`generator_reset_semantics`, `metadata_reset_semantics`) with metadata dispatch loss observed.
6. Multi-command chain from docs: reproduced (`multicommand_chain_from_docs`) with filtered `where/sort/head` stages.
7. UI parity risk: confirmed by architecture; hover/highlight depend strictly on lineage events (`src/features/splinter/ui/panels/SplAnalysisPanel.tsx:72`, `src/features/splinter/ui/panels/SplAnalysisPanel.tsx:115`).

## Recommended API/Type Follow-ons
1. Pass SPL source text into lineage analysis from SPLinter (`LineageConfig.source`).
2. Add lineage diagnostics surface: per-stage fallback reason, handler selected, filtered-by-default flag.
3. Introduce a single command-coverage contract type to align:
   - default tracked policy
   - handler registry
   - parser command alternatives
   - coverage tests

## Prioritized Remediation Sequence
1. P0: Fix parser/transformer crashers and missing command visitor mappings.
2. P0: Replace or expand default tracked policy to remove silent pass-through for implemented handlers.
3. P1: Rework subsearch merge semantics (BY/dependencies/scope).
4. P1: Re-enable modification events and warnings for backfilled unknown references.
5. P1: Pass source text and expose parser/lineage confidence diagnostics in UI.
6. P2: Make corpus-based parity tests and dispatch-contract tests required CI gates.
