/**
 * Field Highlight Feature
 *
 * Provides click-to-highlight functionality for field lineage.
 * Highlights all occurrences of a field with color-coded event types.
 *
 * @module features/field-highlight
 */

// UI Components
export { HighlightLegend } from './ui/HighlightLegend';

// Model / Hooks
export { useHighlight, type UseHighlightReturn, type HighlightedEvent } from './model/use-highlight';
