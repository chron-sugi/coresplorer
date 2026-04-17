# Ops Dashboard — Pass 1 Implementation Spec

## Overview

Build the frontend scaffolding and UI for an internal Operations Dashboard at `/monitoring`. This pass produces a **fully rendered, clickable dashboard against fixture data** — no backend work, no real API calls. Every section on the page must render visibly, even those slated for later implementation.

**Two sections are implemented “tonight-ready” (structure and UI complete, wired to fixtures that Pass 2 will replace with real endpoints):**

1. Base Directory Scan — top 50 largest files with monitored/unmonitored tagging
1. APIs & Dependencies — reachability table

**Four sections are placeholder stubs with full visual layout, rendering from static fixtures:**

1. Global Status Strip (5 cards)
1. Storage table (with expandable row demo)
1. ETL Workers table
1. Databases table
1. Recent Events list

After Pass 1 completes, you should be able to navigate to `/monitoring`, see every section rendered, click scan/expand/filter controls, and observe in-flight UI states — all without any backend running.

-----

## Before You Begin — Required Codebase Discovery

Before writing any code, inspect the existing codebase to learn:

1. **Design tokens / color palette** — Locate the Tailwind config (`tailwind.config.ts` or `tailwind.config.js`) and any global CSS files (`globals.css`, `app.css`, theme provider files). Extract the full color palette — including any custom colors, status colors (success/warn/error equivalents), background layers, border colors, text color hierarchy (primary/secondary/muted). **Do not invent new colors.** Every color used in this feature must come from the existing palette or Tailwind defaults already configured in the project.
1. **Radix UI primitives in use** — Check `package.json` for `@radix-ui/*` packages and find existing wrappers in the codebase (likely under `src/shared/ui/` or similar). Identify the project’s conventions for:
- Dropdown / Select (for base-path selector)
- Tooltip (for truncated paths, disabled button reasons)
- Dialog (not needed in Pass 1 but note what exists)
1. **TanStack Table usage** — Find an existing table implementation in the codebase. Follow its patterns exactly: column definition style, sorting behavior, row props, styling approach. Do not introduce a second table pattern.
1. **TanStack Query setup** — Locate the `QueryClient` provider. Note default stale times, retry config, refetch behavior. The new monitoring queries should follow existing conventions.
1. **Zustand store conventions** — Check existing stores for file structure, naming, devtools usage.
1. **Zod conventions** — Check for an existing schema directory and naming patterns. Follow them.
1. **FSD layering** — Confirm the project uses Feature-Sliced Design with layers `app/`, `pages/`, `widgets/`, `features/`, `entities/`, `shared/`. Confirm where the router lives and how new pages are registered.

**Document findings in a brief `MONITORING_DISCOVERY.md` in the root before starting implementation.** If any of the above cannot be located, stop and ask before proceeding.

-----

## Directory Structure to Create

All new code lives under `src/features/monitoring/` following FSD conventions. Use existing sibling features as a reference for internal folder layout.

```
src/features/monitoring/
├── index.ts                              # public exports
├── api/
│   ├── schemas.ts                        # Zod schemas (contracts)
│   ├── types.ts                          # inferred TS types from Zod
│   ├── fixtures.ts                       # ALL mock data for Pass 1
│   ├── client.ts                         # fetch wrappers (return fixtures in Pass 1)
│   └── queries.ts                        # TanStack Query hooks
├── model/
│   ├── store.ts                          # Zustand UI state (expanded rows, selected base path, event filters)
│   └── constants.ts                      # refresh intervals, status thresholds
├── ui/
│   ├── MonitoringPage.tsx                # top-level page component
│   ├── sections/
│   │   ├── SummaryStrip.tsx
│   │   ├── StorageSection.tsx            # placeholder with full layout
│   │   ├── BaseDirectoryScanSection.tsx  # real section (wired to fixtures)
│   │   ├── WorkersSection.tsx            # placeholder
│   │   ├── ApisSection.tsx               # real section (wired to fixtures)
│   │   ├── DatabasesSection.tsx          # placeholder
│   │   └── RecentEventsSection.tsx       # placeholder
│   ├── components/
│   │   ├── StatusDot.tsx                 # colored dot + optional glow
│   │   ├── StatusPill.tsx                # colored pill ("OK", "WARN", "ERR", "DOWN")
│   │   ├── ProjectTag.tsx                # colored project badge
│   │   ├── ProgressBar.tsx               # horizontal usage bar
│   │   ├── ScanningIndicator.tsx         # pulsing dot + "scanning…" text
│   │   ├── SectionHeader.tsx             # h2 + status pill + right-aligned controls
│   │   ├── PanelCard.tsx                 # bordered container wrapper
│   │   └── KeyValueRow.tsx               # label + monospace value row
│   └── utils/
│       ├── formatBytes.ts                # see exact spec below
│       ├── formatRelativeTime.ts         # see exact spec below
│       ├── formatClockTime.ts            # "14:32:07" (HH:MM:SS, 24-hour)
│       └── formatDateTime.ts             # "2026-04-15 03:00" (YYYY-MM-DD HH:MM)
```

**The agent must not create files outside this tree except:**

- The page route registration (location dictated by existing router conventions)
- A navigation link update in the existing header/nav component to point “Monitoring” to `/monitoring`
- `MONITORING_DISCOVERY.md` in the repo root (delete or move before final commit)

-----

## Routing & Header Integration

Register a new route at `/monitoring` using the project’s existing router pattern. The route renders `<MonitoringPage />`.

The existing header component has a “Monitoring” link (either a real link or a stub). Update it to point to `/monitoring`. Do not restyle the header.

The page does not have its own header chrome — it inherits the app shell.

-----

## Zod Schemas (`api/schemas.ts`)

Define the following schemas. These are the **contracts** for Pass 2’s backend. The agent must not deviate from these shapes — every field name, type, and enum value is load-bearing.

### Shared enums

```typescript
import { z } from 'zod';

export const StatusLevel = z.enum(['ok', 'warn', 'error', 'unknown']);
export type StatusLevel = z.infer<typeof StatusLevel>;

export const ScanState = z.enum(['idle', 'running', 'completed', 'failed']);
export type ScanState = z.infer<typeof ScanState>;

export const ProjectId = z.string().min(1).max(64);
```

### Summary strip (section 1)

```typescript
export const OpsSummarySchema = z.object({
  generatedAt: z.string().datetime(),
  platform: z.object({
    status: StatusLevel,
    uptimeSeconds: z.number().int().nonnegative(),
    version: z.string(),
    gitSha: z.string().optional(),
    environment: z.string(),
  }),
  storage: z.object({
    status: StatusLevel,
    warningCount: z.number().int().nonnegative(),
    criticalPathName: z.string().optional(),   // e.g. "flowton-data at 83%"
  }),
  workers: z.object({
    status: StatusLevel,
    onlineCount: z.number().int().nonnegative(),
    totalCount: z.number().int().nonnegative(),
    activeJobs: z.number().int().nonnegative(),
    queuedJobs: z.number().int().nonnegative(),
  }),
  apis: z.object({
    status: StatusLevel,
    healthyCount: z.number().int().nonnegative(),
    totalCount: z.number().int().nonnegative(),
    failingName: z.string().optional(),        // e.g. "canonix-api unreachable"
  }),
  databases: z.object({
    status: StatusLevel,
    trackedCount: z.number().int().nonnegative(),
  }),
});
export type OpsSummary = z.infer<typeof OpsSummarySchema>;
```

### Storage section (placeholder in Pass 1, contract-ready for Pass 2)

```typescript
export const StoragePathSchema = z.object({
  project: ProjectId,
  path: z.string(),
  mountPath: z.string(),
  mountUsedPercent: z.number().min(0).max(100),
  mountUsedBytes: z.number().int().nonnegative(),
  mountTotalBytes: z.number().int().nonnegative(),
  directoryBytes: z.number().int().nonnegative().nullable(),  // null = never scanned
  fileCount: z.number().int().nonnegative().nullable(),
  subdirCount: z.number().int().nonnegative().nullable(),
  lastScanAt: z.string().datetime().nullable(),
  scanState: ScanState,
  warnThresholdPercent: z.number().min(0).max(100),
  critThresholdPercent: z.number().min(0).max(100),
});

export const StorageSubdirSchema = z.object({
  name: z.string(),            // "raw/"
  bytes: z.number().int().nonnegative(),
  percentOfParent: z.number().min(0).max(100),
});

export const StorageTopFileSchema = z.object({
  relativePath: z.string(),    // "raw/2026-04/snapshot_full_2026-04-12.parquet"
  bytes: z.number().int().nonnegative(),
  modifiedAt: z.string().datetime(),
});

export const StoragePathDetailSchema = StoragePathSchema.extend({
  subdirectories: z.array(StorageSubdirSchema),
  topFiles: z.array(StorageTopFileSchema),
});

export const StorageSectionSchema = z.object({
  generatedAt: z.string().datetime(),
  paths: z.array(StoragePathSchema),
});
export type StorageSection = z.infer<typeof StorageSectionSchema>;
export type StoragePath = z.infer<typeof StoragePathSchema>;
export type StoragePathDetail = z.infer<typeof StoragePathDetailSchema>;
```

### Base Directory Scan (REAL, Pass 2 will back this)

```typescript
export const BasePathOptionSchema = z.object({
  basePath: z.string(),                                     // "/var/data"
  displayName: z.string().optional(),
  mountUsedBytes: z.number().int().nonnegative(),
  mountTotalBytes: z.number().int().nonnegative(),
  mountUsedPercent: z.number().min(0).max(100),
});

export const BaseScanFileSchema = z.object({
  rank: z.number().int().positive(),
  absolutePath: z.string(),
  bytes: z.number().int().nonnegative(),
  modifiedAt: z.string().datetime(),
  isMonitored: z.boolean(),
  monitoredProject: ProjectId.nullable(),                   // null when isMonitored=false
});

export const BaseScanResultSchema = z.object({
  basePath: z.string(),
  scanState: ScanState,
  lastScanAt: z.string().datetime().nullable(),
  scanDurationMs: z.number().int().nonnegative().nullable(),
  topFiles: z.array(BaseScanFileSchema).max(50),
});
export type BaseScanResult = z.infer<typeof BaseScanResultSchema>;

export const BaseScanIndexSchema = z.object({
  basePaths: z.array(BasePathOptionSchema).min(1),
  selectedBasePath: z.string(),                             // default selection
});
export type BaseScanIndex = z.infer<typeof BaseScanIndexSchema>;

// Trigger endpoint response
export const TriggerBaseScanResponseSchema = z.object({
  basePath: z.string(),
  scanState: ScanState,
  startedAt: z.string().datetime(),
  conflict: z.boolean(),                                    // true if scan already running
  conflictMessage: z.string().optional(),                   // "Another scan in progress. Please wait."
});
```

### Workers (placeholder, contract-ready)

```typescript
export const WorkerStatusSchema = z.enum(['online', 'offline', 'stale']);

export const WorkerRowSchema = z.object({
  project: ProjectId,
  name: z.string(),
  status: WorkerStatusSchema,
  lastHeartbeatAt: z.string().datetime().nullable(),
  activeJobs: z.number().int().nonnegative(),
  queuedJobs: z.number().int().nonnegative(),
  failedLastHour: z.number().int().nonnegative(),
  lastSuccessAt: z.string().datetime().nullable(),
});

export const WorkersSectionSchema = z.object({
  generatedAt: z.string().datetime(),
  workers: z.array(WorkerRowSchema),
});
```

### APIs (REAL, Pass 2 will back this)

```typescript
export const ApiStatusSchema = z.enum(['up', 'degraded', 'down']);

export const ApiRowSchema = z.object({
  project: ProjectId,
  name: z.string(),                                          // "asset-api /health"
  url: z.string().url(),
  status: ApiStatusSchema,
  httpStatus: z.number().int().nullable(),                   // null when timeout
  latencyMs: z.number().int().nonnegative().nullable(),
  lastSuccessAt: z.string().datetime().nullable(),
  lastFailureAt: z.string().datetime().nullable(),
});

export const ApisSectionSchema = z.object({
  generatedAt: z.string().datetime(),
  apis: z.array(ApiRowSchema),
});
export type ApisSection = z.infer<typeof ApisSectionSchema>;
export type ApiRow = z.infer<typeof ApiRowSchema>;
```

### Databases (placeholder)

```typescript
export const DatabaseRowSchema = z.object({
  project: ProjectId,
  name: z.string(),
  lastModifiedAt: z.string().datetime().nullable(),
});

export const DatabasesSectionSchema = z.object({
  generatedAt: z.string().datetime(),
  databases: z.array(DatabaseRowSchema),
});
```

### Events (placeholder)

```typescript
export const EventLevelSchema = z.enum(['info', 'warn', 'error']);

export const EventRowSchema = z.object({
  id: z.string(),
  level: EventLevelSchema,
  message: z.string(),
  source: z.string(),                // "system", or a project id
  project: ProjectId.nullable(),
  occurredAt: z.string().datetime(),
});

export const EventsSectionSchema = z.object({
  generatedAt: z.string().datetime(),
  events: z.array(EventRowSchema),
});
```

**All TS types must be exported from `api/types.ts` as `z.infer` of the corresponding schema.** No hand-written types that parallel Zod schemas.

-----

## Fixtures (`api/fixtures.ts`)

Populate realistic, varied fixture data for every section. Use these exact values — they’re designed to showcase all UI states:

**Timestamp authoring rule:** fixture timestamps must be valid ISO 8601 datetime strings (the schemas use `z.string().datetime()` which rejects invalid ISO). When the spec below describes an age like “2h 14m ago” or “yesterday 22:14”, author the fixture by computing a timestamp relative to module load time:

```typescript
const now = new Date();
const hoursAgo = (h: number, m = 0) => new Date(now.getTime() - (h * 3600 + m * 60) * 1000).toISOString();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400_000).toISOString();
// Example: `hoursAgo(2, 14)` yields the right value for "2h 14m ago"
```

Do not hardcode ISO strings — they’ll drift from the “ago” descriptions between when the fixture is authored and when it’s rendered.

### Project IDs used throughout

Use these project ids consistently across all fixtures (user will confirm final names; use these as placeholders):
`secsight`, `canonix`, `flowton`, `splinter`, `insightsplorer`

### Summary fixture (`opsSummaryFixture`)

- `platform.status`: `'ok'`, uptime 1,234,000 seconds, version `'2.14.0'`, gitSha `'a3f91c2'`, environment `'prod'`
- `storage.status`: `'warn'`, warningCount 1, criticalPathName `'flowton-data at 83%'`
- `workers.status`: `'ok'`, onlineCount 7, totalCount 7, activeJobs 3, queuedJobs 12
- `apis.status`: `'error'`, healthyCount 5, totalCount 6, failingName `'canonix-api unreachable'`
- `databases.status`: `'ok'`, trackedCount 9

### Storage fixture (`storageSectionFixture`)

Provide 6 paths matching the mock exactly:

|Project       |Path                    |Mount %|Dir Size|Files     |Subdirs|Last Scan  |State  |
|--------------|------------------------|-------|--------|----------|-------|-----------|-------|
|secsight      |/var/data/secsight      |41     |68.4 GB |1,284,213 |7      |2h 14m ago |idle   |
|flowton       |/var/data/flowton       |83     |487.2 GB|8,421,109 |12     |(now)      |running|
|canonix       |/var/data/canonix       |41     |142.8 GB|3,401,882 |9      |1h 03m ago |idle   |
|canonix       |/mnt/archive/canonix    |28     |612.0 GB|18,203,411|24     |14h 22m ago|idle   |
|splinter      |/var/data/splinter      |41     |12.1 GB |84,112    |4      |2h 08m ago |idle   |
|insightsplorer|/var/data/insightsplorer|41     |null    |null      |null   |null       |idle   |

Warn threshold 80%, crit 90% for all rows.

Also export `storageDetailFixture` keyed by `path` containing the Flowton detail only (for the expanded row demo):

- Subdirectories: `raw/` 312.4 GB 64%, `staging/` 98.7 GB 20%, `output/` 52.1 GB 11%, `checkpoints/` 18.4 GB 4%, plus 8 more (just include these 4 and let the UI show “+8 more”)
- Top files (5 items): matching the mock

### Base Directory Scan fixture

`baseScanIndexFixture`:

- Two base paths: `/var/data` (2.1 TB / 4.0 TB, 52%) and `/mnt/archive` (1.4 TB / 4.0 TB, 35%)
- `selectedBasePath`: `/var/data`

`baseScanResultFixture` for `/var/data`:

- `scanState`: `completed`
- `lastScanAt`: yesterday 22:14
- `scanDurationMs`: 252000 (4m 12s)
- Top 8 files matching the mock (rows 1–8) — ranks 1, 2, 3, 4, 5, 6, 7, 8
- Pad with 42 more plausible synthetic entries (mix of monitored/unmonitored, sizes descending from ~7 GB down to ~200 MB) to make the “Show all 50” link meaningful
- Three specific entries must be `isMonitored: true`:
  - `/var/data/flowton/raw/2026-04/snapshot_full_2026-04-12.parquet` (Flowton)
  - `/var/data/flowton/raw/2026-04/snapshot_full_2026-04-11.parquet` (Flowton)
  - `/var/data/flowton/staging/workqueue_backlog.db` (Flowton)

`baseScanResultFixture` for `/mnt/archive`:

- `scanState`: `idle`
- `lastScanAt`: null
- `topFiles`: empty array (demonstrates “never scanned” state)

### Workers fixture

7 rows from the mock (asset-ingest, asset-transform, os-normalizer, survivorship-queue, asset-sync, spl-parser, dependency-graph). All status `online`. Timestamps relative to `now`. The os-normalizer row has `failedLastHour: 2`; others have 0.

### APIs fixture

6 rows from the mock. `canonix-api /health` and `canonix-api /ready` are status `down` with `httpStatus: null`, `latencyMs: null`, `lastFailureAt` set to recent. Others `up`.

### Databases fixture

9 rows matching the mock. Use realistic timestamps spanning from 1 minute ago to 2 hours ago.

### Events fixture

5 events matching the mock, in reverse chronological order.

-----

## API Client (`api/client.ts`)

In Pass 1, all client functions return fixture data wrapped in a promise with a simulated 200–400ms delay. Pass 2 will replace these with real `fetch()` calls.

Required functions, one per endpoint:

```typescript
export async function fetchOpsSummary(): Promise<OpsSummary>;
export async function fetchStorageSection(): Promise<StorageSection>;
export async function fetchStoragePathDetail(path: string): Promise<StoragePathDetail>;
export async function fetchBaseScanIndex(): Promise<BaseScanIndex>;
export async function fetchBaseScanResult(basePath: string): Promise<BaseScanResult>;
export async function triggerBaseScan(basePath: string): Promise<TriggerBaseScanResponse>;
export async function fetchWorkersSection(): Promise<WorkersSection>;
export async function fetchApisSection(): Promise<ApisSection>;
export async function fetchDatabasesSection(): Promise<DatabasesSection>;
export async function fetchEventsSection(): Promise<EventsSection>;
```

Each function must:

1. Call `schema.parse(fixture)` before returning, so Pass 1 catches contract violations.
1. Simulate latency with `await new Promise(r => setTimeout(r, 200 + Math.random() * 200))`.

**`fetchStoragePathDetail(path)` behavior:**

- Return `storageDetailFixture[path]` if defined.
- If the requested `path` has no detail fixture, return a valid `StoragePathDetail` by extending the base `StoragePath` row (from `storageSectionFixture`) with `subdirectories: []` and `topFiles: []`. This keeps the UI safe when the user expands a row we haven’t populated (e.g., Canonix, SPLinter).
- Call `StoragePathDetailSchema.parse(result)` before returning.

**Special behavior for scan state (critical — read carefully):**

`triggerBaseScan` and `fetchBaseScanResult` MUST share module-level mutable state. Implement as a single `scanStateStore` at the top of `client.ts`:

```typescript
// Module-level mutable state. Shared by triggerBaseScan and fetchBaseScanResult.
// This is intentional fixture plumbing — Pass 2 replaces the entire client with real fetch() calls.
const scanStateStore: Record<string, {
  scanState: ScanState;
  lastScanAt: string | null;
  scanDurationMs: number | null;
  // Currently running scans hold a timer handle used to transition state back.
  runningTimer?: ReturnType<typeof setTimeout>;
  runningStartedAt?: string;
}> = {
  '/var/data': {
    scanState: 'completed',
    lastScanAt: <ISO for yesterday 22:14>,
    scanDurationMs: 252000,
  },
  '/mnt/archive': {
    scanState: 'idle',
    lastScanAt: null,
    scanDurationMs: null,
  },
};
```

`fetchBaseScanResult(basePath)` reads from `scanStateStore[basePath]` to assemble its response. The `topFiles` array comes from a static fixture keyed by basePath (see Fixtures section). When `scanState === 'running'`, `topFiles` should return the previous scan’s files (so the UI shows stale-but-labeled data during the scan) — or `[]` if no previous scan exists.

`triggerBaseScan(basePath)`:

1. If `scanStateStore[basePath].scanState === 'running'`: return `{ basePath, scanState: 'running', startedAt: scanStateStore[basePath].runningStartedAt!, conflict: true, conflictMessage: 'Another scan in progress. Please wait.' }`. Do NOT start another timer.
1. Otherwise: set `scanState` to `'running'`, set `runningStartedAt` to now, start an 8-second `setTimeout` that on completion sets `scanState` back to `'completed'`, updates `lastScanAt` to now, sets `scanDurationMs` to 8000, and clears `runningTimer`. Return `{ basePath, scanState: 'running', startedAt: now, conflict: false }`.

This shared state is what makes the polling loop work: `useBaseScanResult` polls `fetchBaseScanResult` every 2s while `scanState === 'running'`, and the state transitions to `'completed'` when the timer fires, stopping the poll.

-----

## TanStack Query Hooks (`api/queries.ts`)

Define query keys as a keyed object:

```typescript
export const monitoringKeys = {
  all: ['monitoring'] as const,
  summary: () => [...monitoringKeys.all, 'summary'] as const,
  storage: () => [...monitoringKeys.all, 'storage'] as const,
  storageDetail: (path: string) => [...monitoringKeys.all, 'storage', path] as const,
  baseScanIndex: () => [...monitoringKeys.all, 'base-scan', 'index'] as const,
  baseScanResult: (basePath: string) => [...monitoringKeys.all, 'base-scan', 'result', basePath] as const,
  workers: () => [...monitoringKeys.all, 'workers'] as const,
  apis: () => [...monitoringKeys.all, 'apis'] as const,
  databases: () => [...monitoringKeys.all, 'databases'] as const,
  events: () => [...monitoringKeys.all, 'events'] as const,
};
```

### Refresh intervals (from `model/constants.ts`)

```typescript
export const REFRESH_INTERVALS = {
  FAST_MS: 15_000,    // apis, workers, summary
  MEDIUM_MS: 60_000,  // storage metadata, databases, events
  MANUAL: Infinity,   // storage detail, base scan result (no auto refetch)
} as const;
```

### Hooks to export

- `useOpsSummary()` — `refetchInterval: FAST_MS`
- `useStorageSection()` — `refetchInterval: MEDIUM_MS`
- `useStoragePathDetail(path, enabled)` — `refetchInterval: MANUAL`, `enabled` gates the fetch until the row expands
- `useBaseScanIndex()` — `refetchInterval: MEDIUM_MS`
- `useBaseScanResult(basePath)` — dynamic polling. When `scanState === 'running'`, poll every 2 seconds; otherwise no auto-refetch. TanStack Query v5 signature:
  
  ```typescript
  refetchInterval: (query) => {
    const data = query.state.data;
    return data?.scanState === 'running' ? 2000 : false;
  }
  ```
  
  Note the parameter is the `Query` object, not its data — `query.state.data` is how you reach the payload.
- `useWorkersSection()` — `refetchInterval: FAST_MS`
- `useApisSection()` — `refetchInterval: FAST_MS`
- `useDatabasesSection()` — `refetchInterval: MEDIUM_MS`
- `useEventsSection()` — `refetchInterval: MEDIUM_MS`
- `useTriggerBaseScan()` — mutation. On success, invalidate `baseScanResult(basePath)`.

-----

## Zustand Store (`model/store.ts`)

UI-only state. No server data here.

```typescript
interface MonitoringStore {
  // Storage section — which rows are expanded
  expandedStoragePaths: Set<string>;
  toggleStoragePath: (path: string) => void;

  // Base Directory Scan — which base path is selected
  selectedBasePath: string | null;  // null until index loads; then set to index.selectedBasePath
  setSelectedBasePath: (basePath: string) => void;

  // Events section — filter level
  eventFilter: 'all' | 'errors' | 'warnings';
  setEventFilter: (filter: 'all' | 'errors' | 'warnings') => void;

  // Transient: last scan trigger conflict message (cleared after 4s)
  scanConflictMessage: string | null;
  setScanConflictMessage: (msg: string | null) => void;
}
```

**Initial state seeding:** the store is created with `expandedStoragePaths` pre-populated with a single path: `/var/data/flowton`. This is what produces the Flowton pre-expansion on first load. The user can collapse it; the collapse sticks in-memory until page reload.

**Do NOT use `persist` middleware** on this store — the pre-expansion is intended to demonstrate the feature on each page load, not to persist user preferences.

Follow the existing project’s Zustand conventions (devtools wrapper, store file location, etc.) but the persistence decision above overrides any default.

-----

## Layout Specification

Everything below dictates the visual output. The agent must follow these specifications exactly. Use the existing theme’s color tokens — do not hardcode hex values. Map semantic colors as follows (agent should document the mapping in `MONITORING_DISCOVERY.md`):

- `ok` → the existing theme’s success/green color
- `warn` → the existing theme’s warning/amber color
- `error` → the existing theme’s danger/red color
- `accent` → the existing theme’s primary/brand color (used for links and primary buttons)
- `muted` → the existing theme’s subdued text color
- `panel` → the existing theme’s card/surface background
- `border` → the existing theme’s divider color

### Typography conventions (applies to all sections)

- **Monospace font** — use the project’s existing monospace stack (or Tailwind `font-mono` if the project uses it). Required for: all numeric values in tables (sizes, counts, percentages, HTTP codes, latency), all timestamps, all file paths and directory names, the subbar data values, the version/sha/env labels.
- **Body font** — the project’s default sans. Used for labels, messages, descriptions, section titles (`h1`, `h2`).
- **“Small-caps section titles”** — used inside expanded row panels and card headers. These are NOT actual small-caps (`font-variant`); they are uppercase letters with letter-spacing. Classes: `text-[11px] font-semibold uppercase tracking-[0.08em]` in the muted text color. Example: `SUBDIRECTORIES (1 LEVEL DEEP)`, `TOP 50 LARGEST FILES`, `PLATFORM`, `STORAGE`, etc.
- **“Tiny caps”** for column headers inside tables: `text-[10px] font-semibold uppercase tracking-[0.06em]` in the muted text color.

### Page container

Outer: `max-w-[1400px] mx-auto px-6 py-6`. No horizontal scroll at 1024px and above.

### Page title block

- `h1`: literal string `"Operations Dashboard"`, text size 22px, font-semibold, tracking-tight, bottom margin 4px
- Below h1: horizontal subbar, 12px text, muted color, containing these items separated by thin vertical dividers (1px-wide, 12px-tall, border color):
  - `{N} projects` — N is the count of unique `project` ids across all fixtures that have projects (Storage paths, Workers, APIs, Databases). Monospace N.
  - `Last refreshed {HH:MM:SS} · auto every 15s` — the timestamp is `formatClockTime(opsSummary.generatedAt)`. Monospace timestamp.
  - `Env {environment}` — from `opsSummary.platform.environment`. Monospace value.
  - `Build {gitSha}` — from `opsSummary.platform.gitSha`. Monospace value. Only render this item if `gitSha` is defined.
- While `opsSummary` is still loading (first load), show a single “Loading…” line in muted text rather than the full subbar.
- Bottom margin 24px

### Section 1 — Global Status Strip

- CSS grid, `grid-cols-5`, gap 12px, bottom margin 32px
- 5 equal cards, each:
  - Panel styling (border, rounded 6px, panel bg)
  - Padding 16px
  - Header row: small-caps section title + status dot on the right (8px circle with subtle glow matching status color)
  - Primary line: monospace, 18px, semibold, colored by status
  - Secondary line: 11px, muted color, 4px below primary

Card contents (driven by `opsSummaryFixture`):

|Title      |Primary             |Secondary                |
|-----------|--------------------|-------------------------|
|PLATFORM   |“Healthy”           |`uptime Nd NNh NNm`      |
|STORAGE    |“1 warning” (yellow)|`flowton-data at 83%`    |
|ETL WORKERS|“7 / 7 online”      |`3 active · 12 queued`   |
|APIS       |“1 / 6 down” (red)  |`canonix-api unreachable`|
|DATABASES  |“9 tracked”         |`all recent`             |

### Section 2 — Storage (PLACEHOLDER, full layout)

Section header row:

- h2 “Storage” (15px, semibold) + warning pill “1 warning”
- Right side: small muted text “Oldest scan 2h 14m ago” + primary button “↻ Scan all”
- Bottom margin 12px

Panel containing a TanStack Table with these columns (exact widths):

|Column      |Width      |Alignment|Content                           |
|------------|-----------|---------|----------------------------------|
|Project     |120px      |left     |`<ProjectTag>`                    |
|Path        |auto (flex)|left     |monospace path string             |
|Mount usage |160px      |left     |60px-min progress bar + `41%` text|
|Dir size    |100px      |right    |`68.4 GB` monospace               |
|Files       |100px      |right    |`1,284,213` monospace, muted color|
|Subdirs     |90px       |right    |`7` monospace, muted color        |
|Last scanned|130px      |left     |relative time, muted              |
|Actions     |120px      |right    |“↻ Scan” button + expand chevron  |

Table header row: panel-2 background, 10px uppercase letter-spaced text, muted color, bottom border.

Table cell rows: monospace font family, 12px, 8px vertical padding, 12px horizontal padding. Bottom border between rows except the last.

**Row states:**

- Normal: default styling
- Warning (mount ≥ warn threshold): subtle amber tint on row background (use `bg-{warn}/[0.04]` or equivalent from theme)
- Scanning: replace “Last scanned” cell content with `<ScanningIndicator />`; disable and dim the scan button
- Never-scanned: show em-dashes (`—`) in Dir size / Files / Subdirs (muted color); “never scanned” italic muted text in Last scanned column; scan button styled as primary to draw attention

**Expanded row (for Pass 1, hardcode Flowton row as expanded on page load):**

When a row is expanded, insert a full-width row immediately below with:

- Background: `panel-2` (one shade darker than panel)
- Padding: 16px vertical, 20px horizontal
- Content: CSS grid `grid-cols-2`, gap 32px
  - Left column: “SUBDIRECTORIES (1 LEVEL DEEP)” small-caps title, then vertical stack of 4 subdirectory rows. Each row: flex between name (monospace) and `312.4 GB · 64%` (monospace, muted), with a thin progress bar below. First subdir bar uses warn color; rest use accent color. Below the 4 rows: “+8 more subdirectories” in muted monospace, 11px.
  - Right column: Header flex between “TOP 50 LARGEST FILES” small-caps title and “Open full list →” link (accent color, 11px monospace). In Pass 1 this link is a `<button>` styled as a link with no real navigation — `onClick` logs `'[stub] open full file list'` to the console. It will be wired to a dialog or route in a later pass. Below the header: vertical stack of 5 file rows. Each row: flex between path (monospace, muted, truncated with ellipsis at 280px max-width) and size (monospace). Below: “+45 more files” in muted monospace.

Bottom margin 32px after section.

### Section 3 — Base Directory Scan (REAL UI)

Section header:

- h2 “Base Directory Scan” + muted pill “unmonitored space”
- Right side: small monospace muted text “Manual only”
- Bottom margin 12px

Description paragraph below header (11px, muted color, max-width 780px, line-height 1.55):

> “Recursively scans configured base paths to surface the 50 largest files on the mount — including files outside monitored project paths. Files that live inside a monitored path are still shown but tagged, so you can see at a glance whether space pressure is coming from known workloads or something unrelated.”

Bottom margin 12px after description.

**Panel contents:**

1. **Control bar** (panel-2 background, panel-header styling, flex between):
- Left cluster: “BASE PATH” small-caps label + Radix Dropdown button styled as primary-outline showing `/var/data ▾` (or selected path). Next to it, in a separate muted group: `2.1 TB / 4.0 TB used · 52%` (monospace values).
- Right cluster: “Last scanned yesterday 22:14 · took 4m 12s” (11px muted) + primary button “↻ Run scan”.
1. **Legend row** (below control bar, 8px vertical padding, 16px horizontal, bottom border, 11px muted):
- “Legend:” text
- `[monitored]` muted pill + “inside a project you already track”
- `[unmonitored]` warn pill + “not covered by any project path”
1. **Top 50 files TanStack Table**:

|Column  |Width|Alignment|Content                                                                     |
|--------|-----|---------|----------------------------------------------------------------------------|
|#       |50px |right    |rank number, muted                                                          |
|Path    |auto |left     |absolute path, monospace                                                    |
|Scope   |180px|left     |`<StatusPill>` — “unmonitored” (warn) or “monitored · {ProjectName}” (muted)|
|Size    |100px|right    |`82.4 GB` monospace                                                         |
|Modified|160px|left     |`YYYY-MM-DD HH:MM` monospace, muted                                         |

Row styling:

- Unmonitored rows: full opacity
- Monitored rows: opacity 0.55 (the row is dimmed visually)
- All rows maintain their rank ordering — **do not sort monitored rows to the bottom**, they interleave by size

1. **Footer row** below table (centered, 8px padding, top border):
- “Show all 50 files →” link (accent color, 11px monospace). In Pass 1 this is a `<button>` styled as a link that toggles a local component state `showAllFiles`. When true, render all 50 files in the table; when false, render only the top 8. Defaults to `false`.

**Scan-in-progress state for the entire panel:**

- “Run scan” button becomes disabled with `<ScanningIndicator />` adjacent
- If user clicks scan while running (which shouldn’t be possible since button is disabled, but handle the mutation-level case): on mutation success with `conflict: true`, display the `conflictMessage` inline near the button in warn color. Auto-clear after 4 seconds via Zustand.

**Never-scanned state (when `/mnt/archive` is selected in the dropdown):**

- Table body shows a single row spanning all columns: centered empty-state text “No scan has been run for this base path yet. Click ‘Run scan’ to begin.” in muted color, 32px vertical padding.
- “Last scanned” text in the control bar shows “never scanned” in muted italic.

Bottom margin 32px after section.

### Section 4 — ETL Workers (PLACEHOLDER, full layout)

Section header:

- h2 “ETL Workers” + ok pill “7 online”
- Right-side control: literal text `"Refresh 15s"` in muted monospace, 11px. This is a static label, not an interactive control. Render it regardless of placeholder status so the layout is correct for Pass 2.
- Bottom margin 12px

TanStack Table in a panel:

|Column        |Width|Alignment|
|--------------|-----|---------|
|Project       |140px|left     |
|Worker        |auto |left     |
|Status        |100px|left     |
|Last heartbeat|140px|left     |
|Active        |100px|right    |
|Queued        |100px|right    |
|Failed 1h     |100px|right    |
|Last success  |160px|left     |

Status cell renders a pill like `[● online]` (dot + text inside pill). Failed 1h cell colors the number warn if > 0.

Render all 7 fixture rows.

### Section 5 — APIs & Dependencies (REAL UI)

Section header:

- h2 “APIs & Dependencies” + error pill “1 down”
- Right-side control: literal text `"Refresh 15s"` in muted monospace, 11px. Static label.
- Bottom margin 12px

TanStack Table:

|Column      |Width|Alignment           |
|------------|-----|--------------------|
|Project     |140px|left                |
|Endpoint    |auto |left                |
|Status      |100px|left (pill with dot)|
|HTTP        |100px|right               |
|Latency     |100px|right               |
|Last success|160px|left                |
|Last failure|160px|left                |

For down rows:

- HTTP column shows “timeout” in error color (or the status code in error color if present)
- Latency shows “—” in error color
- Last failure populated with error color

For up rows:

- Last failure shows “—” in muted color

Render all 6 fixture rows.

### Section 6 — Databases (PLACEHOLDER)

Section header:

- h2 “Databases” + muted pill “9 tracked”
- Right-side control: literal text `"Refresh 60s"` in muted monospace, 11px. Static label.

Three-column TanStack Table: Project (140px), Database (auto), Last modified (200px). Last modified formatted as `HH:MM:SS (Nm ago)`.

Render all 9 fixture rows.

### Section 7 — Recent Events (PLACEHOLDER)

Section header:

- h2 “Recent Events”
- Right: three small filter buttons “All” (active), “Errors” (dim), “Warnings” (dim). Clicking updates `eventFilter` in Zustand and filters the rendered list.

Panel contents:

- Vertical stack of event rows separated by top borders
- Each event row (12px padding):
  - Left: fixed-width level pill (60px min, centered text): ERR (error color bg/text), WARN (warn), INFO (muted)
  - Right: column with event message (12px text) and below it a 11px muted monospace line showing `HH:MM:SS · <ProjectTag>`

Footer row below events: centered “View full event log →” link (accent color, 11px). In Pass 1 this is a `<button>` styled as a link that logs `'[stub] open full event log'` to the console.

-----

## Formatter Utilities — Exact Specifications

Agents routinely introduce formatter inconsistencies across a codebase. Each utility below has exact rules and examples. Every utility accepts an `ISO datetime string` or `number` input and returns a `string`. All utilities must handle `null` / `undefined` by returning the string `'—'` (em dash) unless otherwise specified.

### `formatBytes(bytes: number | null | undefined): string`

Use **binary units (1024-based)**. Show 1 decimal place except when value is `< 10` in the unit. No space between number and unit is wrong — always one space.

|Input range         |Unit|Precision                |Example              |
|--------------------|----|-------------------------|---------------------|
|`null` / `undefined`|—   |—                        |`—`                  |
|`0`                 |B   |integer                  |`0 B`                |
|`< 1024`            |B   |integer                  |`512 B`              |
|`< 1024²`           |KB  |1 decimal if ≥ 10, else 2|`4.2 KB`, `512.0 KB` |
|`< 1024³`           |MB  |1 decimal if ≥ 10, else 2|`12.1 MB`, `487.2 MB`|
|`< 1024⁴`           |GB  |1 decimal                |`68.4 GB`, `612.0 GB`|
|`≥ 1024⁴`           |TB  |1 decimal                |`2.1 TB`, `4.0 TB`   |

Examples that MUST work:

- `formatBytes(68_400_000_000)` → `"63.7 GB"` (1024-based, so 68.4e9 bytes ≈ 63.7 GiB)
- For fixture legibility, prefer authoring fixtures with byte values that produce the exact strings shown in the mock. For example, to get `"68.4 GB"` use `68.4 * 1024**3`.

### `formatRelativeTime(iso: string | null | undefined, now?: Date): string`

Produces compact, human-readable relative strings. `now` defaults to `new Date()` but is injectable for testing.

|Age                                        |Format                     |Example                |
|-------------------------------------------|---------------------------|-----------------------|
|`null` / `undefined`                       |literal                    |`never`                |
|future timestamp (≤ 60s drift)             |clamped to `just now`      |`just now`             |
|future timestamp (> 60s drift)             |literal                    |`in the future`        |
|`< 10 seconds`                             |—                          |`just now`             |
|`< 60 seconds`                             |`{N}s ago`                 |`42s ago`              |
|`< 60 minutes`                             |`{N}m ago`                 |`14m ago`              |
|`< 60 minutes` with non-zero seconds shown?|no — omit seconds          |`14m ago`              |
|`< 24 hours`                               |`{H}h {M}m ago` (omit `0m`)|`2h 14m ago`, `14h ago`|
|`< 7 days`                                 |`{D}d {H}h ago` (omit `0h`)|`3d 4h ago`, `1d ago`  |
|`≥ 7 days`                                 |ISO date only              |`2026-04-09`           |

### `formatClockTime(iso: string | null | undefined): string`

Wall-clock time in the browser’s local timezone.

- `null` / `undefined` → `'—'`
- Otherwise: `HH:MM:SS` 24-hour, zero-padded. Example: `"14:32:07"`.

### `formatDateTime(iso: string | null | undefined): string`

Full date + wall-clock minute.

- `null` / `undefined` → `'—'`
- Otherwise: `YYYY-MM-DD HH:MM` in local timezone. Example: `"2026-04-15 03:00"`.

### Where each formatter is used

|Formatter           |Used in                                                                                                                                                                                                                      |
|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|`formatBytes`       |Storage table (Dir size), Base Scan table (Size), Storage subdir breakdown, Storage top files, page subbar (mount used/total)                                                                                                |
|`formatRelativeTime`|Storage table (Last scanned), Workers table (Last heartbeat, Last success), APIs table (Last success, Last failure), Databases table (Last modified “(Nm ago)”), Events list (embedded), Base Scan control bar (Last scanned)|
|`formatClockTime`   |Page subbar (Last refreshed), Events list (leading timestamp), Databases table (leading `HH:MM:SS` before the relative suffix)                                                                                               |
|`formatDateTime`    |Base Scan table (Modified column)                                                                                                                                                                                            |

-----

### `<StatusDot level={StatusLevel} glow?: boolean>`

- 8px circle, `rounded-full`, `inline-block`, no shrink
- Background color by level (ok/warn/error tokens; `muted` for unknown)
- When `glow`: `box-shadow: 0 0 8px <same color>`. Default true.

### `<StatusPill variant={'ok'|'warn'|'error'|'muted'} size?: 'sm'|'xs'>`

**Naming note:** the prop is `variant`, not `level` — this is intentionally distinct from the `StatusLevel` Zod enum (`ok | warn | error | unknown`) because `StatusPill` is a *visual* variant (including `muted` for neutral-gray pills like “9 tracked”) and not all pills reflect a status value. To render a pill from a `StatusLevel`, map it: `ok → ok`, `warn → warn`, `error → error`, `unknown → muted`.

- Flex inline, 6px gap, rounded, monospace font
- Default size: 2px/8px padding, 11px text
- xs size: 1px/5px padding, 9px text
- `ok` → green bg tint, green text, green border tint
- `warn` → amber bg tint, amber text, amber border tint
- `error` → red bg tint, red text, red border tint
- `muted` → 3% white overlay bg, dim text, default border
- Accepts `children` for content (e.g., dot + label or plain text)

### `<ProjectTag projectId={string}>`

- Small uppercase pill, tight tracking, 10px text, 1px/6px padding
- Rounded 3px
- Color mapping (placeholder — agent should pick 5 distinct tints from the existing palette):
  - `secsight` → blue tint
  - `canonix` → purple tint
  - `flowton` → green tint
  - `splinter` → orange tint
  - `insightsplorer` → pink tint
- Fallback: default accent tint for unknown project ids
- Display name map: `secsight: 'SecSight', canonix: 'Canonix', flowton: 'Flowton', splinter: 'SPLinter', insightsplorer: 'InsightSPLorer'`

### `<ProgressBar valuePercent={number} color?: 'ok'|'warn'|'error'|'accent'>`

- 4px tall, full-width, rounded 2px, border color background
- Inner fill: colored div, width = `${valuePercent}%`, transition width 300ms
- Default color: accent

### `<ScanningIndicator />`

- Inline flex, 8px gap, accent color, 11px monospace
- 6px pulsing dot (opacity 0.3 → 1.0 → 0.3, 1.2s ease-in-out infinite)
- Text: “scanning…”

### `<SectionHeader title right?>`

- h2 flex: 15px text, semibold, tracking-tight
- Optional trailing pill next to title
- Optional `right` prop for right-aligned controls
- Consistent 12px bottom margin

### `<PanelCard>` / `<PanelHeader>` / `<PanelBody>`

- Card wrappers matching the mock’s `.panel` styling: border, rounded 6px, panel bg
- Header has bottom border and 12px/16px padding
- Body has no default padding (children decide)

### `<ExpandToggleButton expanded={boolean} onToggle={() => void} ariaLabel?: string>`

Used in the Storage table’s Actions column to expand/collapse a row’s drill-in view.

- Renders as a small icon-only button (no background by default)
- 24px square click target minimum
- Shows chevron: `▸` when collapsed, `▾` when expanded
- Accent color, 11px, monospace
- `onClick` fires `onToggle`
- Keyboard: `Space` and `Enter` both trigger toggle (native `<button>` gives this for free)
- `aria-expanded` reflects the `expanded` prop
- `aria-label` defaults to `"Toggle details"` if not provided; caller should pass a specific label like `"Toggle details for /var/data/flowton"`
- Hover state: background becomes panel-2

The Storage section’s row renderer wires this up:

```tsx
<ExpandToggleButton
  expanded={expandedStoragePaths.has(row.path)}
  onToggle={() => toggleStoragePath(row.path)}
  ariaLabel={`Toggle details for ${row.path}`}
/>
```

The Storage table Actions column contains:

- `<Button variant="secondary" size="sm">↻ Scan</Button>` (disabled if `row.scanState === 'running'`)
- `<ExpandToggleButton />`

Gap 8px between them, right-aligned within the cell.

### `<FilterButton active={boolean} onClick>{label}</FilterButton>`

Used in the Recent Events section for the All / Errors / Warnings filters.

- Same visual as a small secondary button
- When `active`: full opacity, primary-outline border treatment
- When not active: 60% opacity, default border
- Click toggles which is active via Zustand `setEventFilter`
- Exactly one is active at a time

-----

## Behavior Requirements

1. **Initial page load**: every section shows its skeleton/loading state briefly (the fixture delay provides this window), then renders data.
1. **Expanded row in Storage**: on page load, Flowton’s row is pre-expanded (seeded in the Zustand store’s initial state). Clicking the chevron toggles it.
1. **Base path dropdown**: shows both `/var/data` and `/mnt/archive`. Selecting `/mnt/archive` switches to the “never scanned” empty state.
1. **Run scan button**: clicking it triggers the mutation. The UI immediately shows the scanning indicator (because query polling picks up the state change). After 8s the fixture resolves and the UI updates.
1. **Double-click run scan** (or triggering while running): UI shows the conflict message inline in warn color, auto-dismissing after 4s. The button remains disabled during running state, so this path is only reachable via code, but the handling must be implemented.
1. **Event filter buttons**: clicking toggles the active one. Filtering is a client-side filter on the fixture array.
1. **No section ever blanks out during a *refetch*** — use TanStack Query’s `placeholderData: keepPreviousData` (v5) so polling never unmounts the rendered UI. Skeletons are **only** shown on the first-ever load, when `isPending === true` AND `data === undefined`. Once data has loaded once, refetches in the background keep showing previous data; a subtle refetch indicator is optional but not required.
1. **Loading states (first load only)**: show skeleton rows in tables (3 skeleton rows per table). For the summary strip, show dim skeleton cards. For events, show 3 skeleton event rows. Skeletons must have the same row heights as real rows so the layout doesn’t jump.
1. **Error states**: if any query errors out, show a compact error state in the section header (red pill “error”) and a single row in the panel body: “Failed to load {section}. Retry.” with a retry button that calls `refetch`.

-----

## Out of Scope for Pass 1

The agent must **not** attempt any of the following — they are Pass 2:

- Any backend Python/FastAPI code
- Any YAML config file
- Any SQLite setup
- Any real network calls
- Any authentication changes
- Any tests beyond smoke-level (a single Vitest file that renders the page against fixtures and asserts each section heading is present is acceptable but not required)

-----

## Completion Criteria

Pass 1 is complete when:

1. `MONITORING_DISCOVERY.md` exists documenting the palette mapping, Radix primitives chosen, TanStack Table pattern followed, and any deviations.
1. Navigating to `/monitoring` in the dev server renders the complete page with every section visible.
1. All 7 sections match the specified layout. All Storage paths, Base Scan files, Workers, APIs, Databases, and Events from fixtures are rendered.
1. The Flowton storage row is pre-expanded showing the subdirectory and top-files drill-in.
1. Clicking the Base Directory Scan “Run scan” button shows the scanning indicator for 8 seconds, then the last-scanned timestamp updates.
1. Switching the base-path dropdown to `/mnt/archive` shows the never-scanned empty state.
1. Clicking the event filter buttons filters the events list.
1. No console errors. No TypeScript errors. No Zod parse errors.
1. No hardcoded hex colors anywhere in the `features/monitoring` directory — all colors come from theme tokens.

-----

## Post-Pass-1 Checklist (read before declaring done)

- [ ] Every Zod schema matches this spec exactly (field names, types, enum values)
- [ ] Every fixture passes its schema’s `parse()` call
- [ ] Every TanStack Query hook has the correct refresh interval from `constants.ts`
- [ ] The page does not create any requests to real backend URLs
- [ ] Theme tokens are used throughout; `MONITORING_DISCOVERY.md` documents the mapping
- [ ] The page is responsive down to 1024px width without horizontal scroll
- [ ] `useTriggerBaseScan` handles both the success path and the conflict response
- [ ] The Flowton row pre-expansion is seeded in the Zustand store’s initial state, not hardcoded in the component