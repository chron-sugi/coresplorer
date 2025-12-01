Gaps / Risks

Dual command catalogs: model/commands.ts has richer field-effect metadata; lib/commands.ts has a separate, smaller set just for performance risk. This can drift and duplicates types/strings; linting doesn’t leverage the richer metadata.
Function coverage is thin and manual (model/functions.ts), no tests ensure correctness or parity with Splunk docs; lacks categories like geo/json, missing many eval functions.
Patterns are basic; no negative cases/tests for extractCommandName/isPipelineContinuation, and some regexes are lenient (e.g., COMMAND_EXTRACT will match partials).
useSPLParser abort logic is moot because parseSPL is synchronous; debounce timer plus abort controller add complexity without effect (and setIsParsing(true) may stay true if a synchronous throw happens before it’s reset).
useEditorStore ties parseResult.success but ParseResult shape isn’t enforced; no error details stored beyond a single message; no persistence of editor text.
Linter rules are static and light: no warnings for search * with no predicates, huge head/limit, dedup misuse, lookup without OUTPUT, or large sort without limit beyond sort 0.
No unit tests around store/useSPLParser; only linter has coverage. Missing integration tests for “parse → store → lineage” flow.
Metadata files are large objects with no schema validation; a typo could silently break consumers.