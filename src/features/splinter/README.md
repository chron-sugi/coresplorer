# Splinter Feature (SPL Inspector)

## Purpose

Provide SPL inspection, analysis, and debugging tools including:
- Query statistics and structure analysis
- SPL linting with warnings and suggestions
- Code folding for subsearches and macros
- Field lineage visualization (integration with field-lineage feature)
- Interactive SPL viewer with search capabilities

## Responsibilities

**Owns:**
- UI for inspecting and analyzing SPL queries
- Linting logic and severity calculation
- Query statistics extraction
- Code folding ranges
- Tab-based panels for different analysis views

**Does NOT:**
- Parse or tokenize SPL (handled by `spl-parser`)
- Calculate field lineage (handled by `field-lineage`)
- Manage editor state (handled by `@/entities/spl`); splinter consumes the shared editor store

## Structure

```
lib/
  ├─ spl/
  │   └─ searchSpl.ts           # Query search/highlighting utilities
  ├─ folding/                   # Code folding logic
  ├─ lineage/                   # Lineage integration (queries)
  └─ ...                         # Other analysis utilities

model/
  ├─ constants/                 # UI config, schema types
  ├─ store/                     # Zustand stores (inspector state)
  ├─ hooks/                     # useKnowledgeObjectInspector, etc.
  ├─ splinter.schemas.ts        # Zod types (SplAnalysis, FoldRange, etc.)
  └─ useSPLinterPage.ts         # Page-level state orchestration

ui/
  ├─ components/                # Reusable UI (SplStats, SplViewer)
  ├─ panels/                    # Analysis panels (stats, linter, schema)
  └─ tools/                     # Toolbar, utilities

splinter.variants.ts            # Tailwind/UI variants
```

## Public Surface

```typescript
import {
  useSPLinterPage,
  useInspectorStore,
  useKnowledgeObjectInspector,
  useSchemaStore,
  type SplAnalysis,
  type SPLinterTab,
  SCHEMA_TYPES,
} from '@/features/splinter';
```

**Key hooks:**
- `useSPLinterPage()` – Page-level state (active tab, search, collapse)
- `useInspectorStore()` – Zustand store for splinter UI highlights/selection (not SPL text)
- `useKnowledgeObjectInspector()` – Knowledge object metadata and inspection

## Testing

- Tests are colocated: `Component.tsx` → `Component.test.tsx`
- Integration tests suffix: `.integration.test.tsx` (e.g., `SplStats.integration.test.tsx`)
- Focus on component rendering, user interactions, and state updates

## Gotchas / Decisions

- **Linter warnings**: Re-exported from `@/entities/spl` for backward compatibility
- **Store-driven**: `useSPLinterPage` reads from `useInspectorStore` and derives search results
- **Multiple panels**: Four tabs (stats, structure, linter, schema) managed via single `activeTab` state
- **Search integration**: Query search results drive highlighted lines in the editor
