/**
 * UI Types
 *
 * Cross-cutting types for UI patterns used across the application.
 * These types have no dependencies on any specific feature or entity.
 *
 * @module types/ui
 */

// =============================================================================
// LAYOUT
// =============================================================================

/**
 * Panel positioning for sidebars and drawers.
 */
export type PanelSide = 'left' | 'right';

/**
 * Standard size variants used across UI components.
 */
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// =============================================================================
// INTERACTION
// =============================================================================

/**
 * Selection state for list/table items.
 */
export interface SelectionState<T = string> {
  selectedIds: Set<T>;
  lastSelected: T | null;
}

/**
 * Expandable/collapsible state.
 */
export interface CollapsibleState {
  isCollapsed: boolean;
  onToggle: () => void;
}

// =============================================================================
// DATA DISPLAY
// =============================================================================

/**
 * Badge severity levels for status indicators.
 */
export type BadgeSeverity = 'info' | 'success' | 'warning' | 'error';

/**
 * Column definition for tables.
 */
export interface ColumnDef<T> {
  id: string;
  header: string;
  accessor: keyof T | ((row: T) => unknown);
  sortable?: boolean;
  width?: string | number;
}
