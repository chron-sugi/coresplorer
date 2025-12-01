/**
 * Global Types
 *
 * Cross-cutting TypeScript type definitions used across the application.
 * These types are dependency-free and can be imported from any layer.
 *
 * @module types
 */

// Domain types - common domain primitives
export type {
  SortDirection,
  HealthStatus,
  LoadingState,
  LineRange,
  TextRange,
  KeyValue,
  NamedItem,
} from './domain';

// API types - request/response shapes
export type {
  ApiError,
  Result,
  PaginationParams,
  PaginationMeta,
  PaginatedResponse,
  FetchStatus,
} from './api';

// UI types - common UI patterns
export type {
  PanelSide,
  Size,
  SelectionState,
  CollapsibleState,
  BadgeSeverity,
  ColumnDef,
} from './ui';
