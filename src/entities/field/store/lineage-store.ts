/**
 * Lineage Store
 *
 * Manages field lineage analysis state and UI interactions
 * like hover, selection, and highlighting.
 *
 * @module entities/field/store/lineage-store
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { LineageIndex, FieldLineage } from '@/features/field-lineage';

// =============================================================================
// TYPES
// =============================================================================

interface HoverInfo {
  fieldName: string;
  line: number;
  column: number;
  x: number;
  y: number;
}

interface Selection {
  fieldName: string;
  locked: boolean;
}

interface LineageState {
  // Lineage data
  lineageIndex: LineageIndex | null;

  // Hover state
  hoveredField: HoverInfo | null;

  // Selection state
  selectedField: Selection | null;

  // Highlighted lines (for showing field usage)
  highlightedLines: number[];

  // UI state
  tooltipVisible: boolean;
  contextPanelOpen: boolean;

  // Actions
  setLineageIndex: (index: LineageIndex | null) => void;
  setHoveredField: (info: HoverInfo | null) => void;
  selectField: (fieldName: string, lock?: boolean) => void;
  clearSelection: () => void;
  toggleSelectionLock: () => void;
  setHighlightedLines: (lines: number[]) => void;
  clearHighlights: () => void;
  setTooltipVisible: (visible: boolean) => void;
  setContextPanelOpen: (open: boolean) => void;
  reset: () => void;
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState = {
  lineageIndex: null,
  hoveredField: null,
  selectedField: null,
  highlightedLines: [],
  tooltipVisible: false,
  contextPanelOpen: false,
};

// =============================================================================
// STORE
// =============================================================================

export const useLineageStore = create<LineageState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    setLineageIndex: (index) => set({ lineageIndex: index }),

    setHoveredField: (info) => {
      const { selectedField } = get();
      // Don't change hover if selection is locked
      if (selectedField?.locked) return;
      set({ hoveredField: info, tooltipVisible: info !== null });
    },

    selectField: (fieldName, lock = false) => {
      set({
        selectedField: { fieldName, locked: lock },
        tooltipVisible: false,
      });
    },

    clearSelection: () =>
      set({
        selectedField: null,
        highlightedLines: [],
      }),

    toggleSelectionLock: () => {
      const { selectedField } = get();
      if (selectedField) {
        set({ selectedField: { ...selectedField, locked: !selectedField.locked } });
      }
    },

    setHighlightedLines: (lines) => set({ highlightedLines: lines }),

    clearHighlights: () => set({ highlightedLines: [] }),

    setTooltipVisible: (visible) => set({ tooltipVisible: visible }),

    setContextPanelOpen: (open) => set({ contextPanelOpen: open }),

    reset: () => set(initialState),
  })),
);

// =============================================================================
// SELECTORS
// =============================================================================

export const selectLineageIndex = (state: LineageState) => state.lineageIndex;
export const selectHoveredField = (state: LineageState) => state.hoveredField;
export const selectSelectedField = (state: LineageState) => state.selectedField;
export const selectHighlightedLines = (state: LineageState) => state.highlightedLines;
export const selectTooltipVisible = (state: LineageState) => state.tooltipVisible;
export const selectContextPanelOpen = (state: LineageState) => state.contextPanelOpen;

/**
 * Get the currently active field (selected or hovered).
 */
export const selectActiveField = (state: LineageState): string | null => {
  return state.selectedField?.fieldName ?? state.hoveredField?.fieldName ?? null;
};

/**
 * Get lineage for the active field.
 */
export const selectActiveFieldLineage = (state: LineageState): FieldLineage | null => {
  const fieldName = selectActiveField(state);
  if (!fieldName || !state.lineageIndex) return null;
  return state.lineageIndex.getFieldLineage(fieldName);
};
