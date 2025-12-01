/**
 * Field Hover Feature
 *
 * Provides field hover tooltips with lineage information.
 * Shows field origin, dependencies, and type on hover.
 *
 * @module features/field-hover
 */

// UI Components
export { LineageTooltip } from './ui/LineageTooltip';
export { FieldOriginBadge } from './ui/FieldOriginBadge';
export { DependencyList } from './ui/DependencyList';

// Model / Hooks
export { useHover, type UseHoverReturn, type HoverPosition } from './model/use-hover';
