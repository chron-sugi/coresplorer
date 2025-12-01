/**
 * useHighlight Hook
 *
 * Provides field selection and highlighting state for click-to-highlight.
 *
 * @module features/field-highlight/model/use-highlight
 */

import { useMemo } from 'react';
import {
  useLineageStore,
  selectSelectedField,
  selectHighlightedLines,
  selectLineageIndex,
} from '@/entities/field';
import type { FieldEvent } from '@/features/field-lineage';

/**
 * Represents a field event with its associated highlight color class.
 */
export interface HighlightedEvent {
  /** The underlying field event data */
  event: FieldEvent;
  /** Tailwind CSS classes for highlighting this event type */
  colorClass: string;
}

/**
 * Return type for the useHighlight hook.
 * Contains state and actions for field highlight management.
 */
export interface UseHighlightReturn {
  /** Currently selected field name */
  selectedField: string | null;
  /** Whether selection is locked (won't clear on click outside) */
  isLocked: boolean;
  /** Lines to highlight */
  highlightedLines: number[];
  /** All events for the selected field with color info */
  highlightedEvents: HighlightedEvent[];
  /** Select a field for highlighting */
  selectField: (fieldName: string, lock?: boolean) => void;
  /** Clear the current selection */
  clearSelection: () => void;
  /** Toggle lock state */
  toggleLock: () => void;
}

/**
 * Mapping of field event kinds to their Tailwind CSS highlight classes.
 * Each event type has a distinct background color and left border for visual differentiation.
 */
const eventKindColors: Record<string, string> = {
  origin: 'bg-slate-500/20 border-l-2 border-slate-400',
  created: 'bg-emerald-500/20 border-l-2 border-emerald-400',
  modified: 'bg-amber-500/20 border-l-2 border-amber-400',
  renamed: 'bg-blue-500/20 border-l-2 border-blue-400',
  consumed: 'bg-cyan-500/20 border-l-2 border-cyan-400',
  dropped: 'bg-red-500/20 border-l-2 border-red-400',
};

/**
 * Hook for managing field selection and highlighting.
 *
 * Provides state and actions for click-to-highlight functionality,
 * allowing users to select fields and see their lineage events
 * highlighted in the editor with color-coded styling.
 *
 * @returns Object containing selection state, highlighted events, and control actions
 *
 * @example
 * ```tsx
 * const { selectedField, highlightedEvents, selectField, clearSelection } = useHighlight();
 *
 * return (
 *   <div onClick={() => selectField('myField', true)}>
 *     {highlightedEvents.map(({ event, colorClass }) => (
 *       <span className={colorClass}>{event.kind}</span>
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useHighlight(): UseHighlightReturn {
  const selectedFieldInfo = useLineageStore(selectSelectedField);
  const highlightedLines = useLineageStore(selectHighlightedLines);
  const lineageIndex = useLineageStore(selectLineageIndex);
  const selectFieldAction = useLineageStore((s) => s.selectField);
  const clearSelection = useLineageStore((s) => s.clearSelection);
  const toggleLock = useLineageStore((s) => s.toggleSelectionLock);

  const selectedFieldName = selectedFieldInfo?.fieldName ?? null;

  const highlightedEvents = useMemo((): HighlightedEvent[] => {
    if (!selectedFieldName || !lineageIndex) return [];

    const events = lineageIndex.getFieldEvents(selectedFieldName);
    return events.map((event) => ({
      event,
      colorClass: eventKindColors[event.kind] ?? eventKindColors.origin,
    }));
  }, [selectedFieldName, lineageIndex]);

  /**
   * Selects a field for highlighting.
   * @param fieldName - The name of the field to select
   * @param lock - Whether to lock the selection (prevents clearing on outside clicks)
   */
  const selectField = (fieldName: string, lock = false): void => {
    selectFieldAction(fieldName, lock);
  };

  return {
    selectedField: selectedFieldInfo?.fieldName ?? null,
    isLocked: selectedFieldInfo?.locked ?? false,
    highlightedLines,
    highlightedEvents,
    selectField,
    clearSelection,
    toggleLock,
  };
}
