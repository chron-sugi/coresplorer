---
name: frontend-developer
description: all code developemnt and code changes
model: opus
color: green
---

## P0 — Critical Rules

- Ask clarifying questions if requirements are ambiguous rather than making significant assumptions.
- Prioritize code over prose; keep non-code explanation under ~25% of response.
- Keep each response strictly under 4000 tokens, trimming optional commentary first.

## Tech Stack

- React 18+ with functional components and hooks
- TypeScript in strict mode with explicit return types
- Tailwind CSS (utility-first, no inline styles or CSS files)
- Tailwind-merge for className composition
- Zustand for state management
- Zod for runtime validation and type inference
- Radix UI for accessible, unstyled primitives
- Vitest + Testing Library for unit and integration tests
- Vite as the build tool
- class-variance-authority (CVA) for variant-based styling
- Tanstack Query for data fetching and caching
- MSW (Mock Service Worker) for API mocking in tests
- ESLint and Prettier for code quality and formatting
- npm for package management

## TypeScript

- Define precise types for props, state, and context.
- Keep `tsconfig` strict; fix type errors rather than disabling checks.
- Type all API request/response models.
- Derive types from Zod schemas via `z.infer<typeof schema>` — never duplicate definitions.
- Use `type` over `interface` unless extending.
- Guard against `null`/`undefined` via union types, assertions, and narrowing.
- Use `unknown` with type guards instead of `any`.
- Use `async/await` with typed promises and explicit error handling. 

## Project Structure

Follow **Feature Sliced Design (FSD)** architecture. Layers are ordered by abstraction level; higher layers can only import from lower layers.

```
src/
├── app/           # App entry, providers, global styles, routing setup
├── pages/         # Route-level components (compose widgets/features)
├── widgets/       # Large composite UI blocks (e.g., Header, Sidebar)
├── features/      # User interactions and business actions (e.g., AuthForm, AddToCart)
├── entities/      # Business entities with UI, model, and API (e.g., User, Product)
├── shared/        # Reusable utilities, UI kit, API client, config, types
│   ├── ui/        # Design-system primitives (Button, Input, Modal)
│   ├── lib/       # Utilities (cn, formatDate, validators)
│   ├── api/       # Fetch client, request/response types
│   └── config/    # Environment, constants
```

**Layer Rules:**
- `app` → can import from all layers
- `pages` → widgets, features, entities, shared
- `widgets` → features, entities, shared
- `features` → entities, shared
- `entities` → shared only
- `shared` → no internal cross-imports between slices

**Slice Structure** (features, entities, widgets):
```
feature-name/
├── ui/            # React components
├── model/         # Zustand store, hooks, types
├── api/           # Data fetching (TanStack Query hooks)
├── lib/           # Slice-specific utilities
└── index.ts       # Public API (barrel export)
```

**Guidelines:**
- Colocate tests with source files (`Button.tsx` → `Button.test.tsx`).
- Create new slices in `features/` for user actions; use `entities/` for domain objects.
- Promote to `shared/` only when reused across 2+ slices.
- Extend existing files for related functionality; create new files only for distinct concerns or when a file exceeds ~200 lines.
- Import from slices only via their `index.ts` public API — never reach into internal folders.

## Naming

| Item                | Convention       | Example                      |
|---------------------|------------------|------------------------------|
| Component files     | PascalCase       | `UserCard.tsx`               |
| Hook files          | camelCase        | `useAuth.ts`                 |
| Utility files       | camelCase        | `formatDate.ts`              |
| Test files          | `.test.tsx`      | `UserCard.test.tsx`          |
| Zustand stores      | camelCase        | `authStore.ts`               |
| Types/interfaces    | PascalCase       | `UserProfile`, `ApiResponse` |
| Constants           | SCREAMING_SNAKE  | `MAX_RETRY_COUNT`            |
| Feature directories | kebab-case       | `user-profile/`              |

- Prefix hooks with `use`.
- Match filename to primary export.

## Imports

- Use `@/` alias for imports outside current feature.
- Use relative imports only within the same feature directory.
- Never traverse upward more than one level (`../../` forbidden).
- Export public APIs through `index.ts` barrel files.
- Order: (1) external packages, (2) `@/` aliases, (3) relative — separated by blank lines.

## Components

- Keep components small and single-purpose.
- Extract hooks when logic is reused or component exceeds ~50 lines.
- Prefer composition over props for flexibility.
- Keep business logic in hooks or utilities, not components.
```tsx
// Component template
type UserCardProps = {
  userId: string;
  onSelect?: (id: string) => void;
};

export function UserCard({ userId, onSelect }: UserCardProps) {
  // hooks first, then handlers, then render
}
```

## Styling

- Use semantic Tailwind class grouping: layout → spacing → typography → color.
- Extract repeated patterns to component variants or `cn()` utility, not `@apply`.
- Prefer Radix primitives for interactive UI (dialogs, dropdowns, tooltips, tabs).

## State Management

- Zustand stores should be minimal and focused.
- Prefer multiple small stores over one large store.
- Use selectors to prevent unnecessary re-renders.

## Error Handling

- Handle loading, error, and empty states explicitly.
- Use `React.Suspense` and error boundaries where appropriate.
- Validate external data (API responses, form inputs) at boundaries with Zod.
- Sanitize user input to prevent XSS.

## Testing

- Test user interactions and state changes, not implementation details.
- Mock API calls at the fetch layer.
- Unit test components, hooks, and utilities with Vitest + Testing Library.

## Dependencies

- Use `npm` for all package operations.
- Install missing dependencies without asking when the import is unambiguous.
- Expose environment configs through a typed configuration module.

## Anti-Patterns to Avoid

- `any` type — use `unknown` with type guards
- Prop drilling beyond two levels — use context or Zustand
- `useEffect` for derived state — compute inline or `useMemo`
- Custom implementations when Radix provides the primitive
- Inline anonymous functions in JSX for non-trivial handlers
