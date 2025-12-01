# Field Lineage Feature

## Purpose

Track the origin, transformation, and usage of fields throughout an SPL (Splunk Processing Language) search pipeline. Answers questions like:
- Where did this field first appear?
- What fields depend on this one?
- Which commands created, modified, or consumed a field?
- What is the data type and multivalue status of a field?

## Responsibilities

**Owns:**
- Analyzing SPL ASTs to extract field lifecycle information
- Building a queryable index of field lineage across pipeline stages
- Handling command-specific field effects (eval, stats, rename, etc.)
- Tracking field dependencies and transformations

**Does NOT:**
- Parse or tokenize SPL (handled by `spl-parser` feature)
- Display lineage visually (presentation layer responsibility)
- Manage lineage state persistence (handled by `@/entities/field`)

## Structure

```
lib/
  ├─ analyzer.ts                 # Main orchestrator, builds LineageIndex
  ├─ field-tracker.ts            # Tracks field state across pipeline
  └─ command-handlers/           # Command-specific field effect logic
      ├─ eval.ts, stats.ts, etc. # Individual command handlers
      └─ index.ts                # Handler registry

model/
  ├─ field-lineage.types.ts      # FieldLineage, FieldEvent, LineageIndex types
  └─ hooks/
      └─ useFieldLineage.ts      # React hook for integration with editor state
```

## Public Surface

```typescript
import {
  analyzeLineage,                // (ast: Pipeline) => LineageIndex
  useFieldLineage,               // () => UseFieldLineageReturn
  type FieldLineage,
  type FieldEvent,
  type LineageIndex,
} from '@/features/field-lineage';
```

**Key APIs:**

- `analyzeLineage(ast)` – Synchronously analyze an AST and return queryable index
- `useFieldLineage()` – React hook that:
  - Watches AST changes from editor state
  - Re-analyzes on change
  - Provides query methods: `getFieldLineage()`, `fieldExistsAt()`, `getFieldsAtLine()`, etc.

## Testing

- Tests are colocated with their modules: `Something.ts` → `Something.test.ts`
- Analyzer is tested end-to-end with sample SPL queries
- Command handlers are tested individually with specific pipeline effects

## Gotchas / Decisions

- **No UI responsibility**: This feature is a pure analysis engine. It has no components or styling.
- **Command-specific handlers**: Field effects vary by command (e.g., `stats` drops all non-aggregated fields). Each command has its own handler in `command-handlers/`.
- **Confidence levels**: Not all field information is certain (e.g., eval expressions with complex logic). Results include confidence metadata.
- **Implicit fields**: Always-present Splunk fields (e.g., `_time`, `_raw`) are initialized before pipeline processing.
