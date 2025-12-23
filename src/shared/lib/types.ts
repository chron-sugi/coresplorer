/**
 * Common Domain Types
 *
 * Cross-cutting domain primitives used across the application.
 * These types have no dependencies on any specific feature or entity.
 *
 * @module types/domain
 */

// =============================================================================
// SORTING
// =============================================================================

/**
 * Sort direction for ordered lists and tables.
 */
export type SortDirection = 'asc' | 'desc';

// =============================================================================
// STATUS & STATE
// =============================================================================

/**
 * Generic health status for resources.
 */
export type HealthStatus = 'ok' | 'warning' | 'error' | 'unknown';

/**
 * Generic loading state for async operations.
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// =============================================================================
// COMMON SHAPES
// =============================================================================

/**
 * A range of line numbers (1-indexed, inclusive).
 */
export interface LineRange {
  startLine: number;
  endLine: number;
}

/**
 * A text range with line and column information.
 */
export interface TextRange {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

/**
 * Generic key-value pair.
 */
export interface KeyValue<T = string> {
  key: string;
  value: T;
}

/**
 * Named item with optional description.
 */
export interface NamedItem {
  name: string;
  description?: string;
}
