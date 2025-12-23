/**
 * Lineage Store Tests
 *
 * Tests for the Zustand store managing field lineage state.
 *
 * @module entities/field/store/lineage-store.test
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import {
  useLineageStore,
  selectLineageIndex,
  selectHoveredField,
  selectSelectedField,
  selectHighlightedLines,
  selectTooltipVisible,
  selectContextPanelOpen,
  selectActiveField,
  selectActiveFieldLineage,
} from './lineage-store';
import type { LineageIndex, FieldLineage } from '../model/lineage.types';

// Mock LineageIndex
const createMockLineageIndex = (): LineageIndex => ({
  getFieldLineage: (name: string): FieldLineage | null => {
    if (name === 'test_field') {
      return {
        fieldName: 'test_field',
        dataType: 'string',
        origin: { kind: 'created', command: 'eval', line: 1 },
        dependsOn: [],
        dependedOnBy: [],
        isMultivalue: false,
        confidence: 'certain',
        events: [],
      };
    }
    return null;
  },
  getFieldEvents: () => [],
  getAllFields: () => ['test_field', 'other_field'],
  getFieldsAtLine: () => ['test_field'],
  fieldExistsAt: () => true,
  getFieldOrigin: () => ({ kind: 'created', command: 'eval', line: 1 }),
  getWarnings: () => [],
  getFieldAtLine: () => null,
  getDependents: () => [],
  getDependencies: () => [],
  getStages: () => [],
  getStageAtLine: () => null,
});

describe('useLineageStore', () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      useLineageStore.getState().reset();
    });
  });

  describe('initial state', () => {
    it('has null lineageIndex initially', () => {
      const state = useLineageStore.getState();
      expect(state.lineageIndex).toBeNull();
    });

    it('has null hoveredField initially', () => {
      const state = useLineageStore.getState();
      expect(state.hoveredField).toBeNull();
    });

    it('has null selectedField initially', () => {
      const state = useLineageStore.getState();
      expect(state.selectedField).toBeNull();
    });

    it('has empty highlightedLines initially', () => {
      const state = useLineageStore.getState();
      expect(state.highlightedLines).toEqual([]);
    });

    it('has tooltipVisible false initially', () => {
      const state = useLineageStore.getState();
      expect(state.tooltipVisible).toBe(false);
    });

    it('has contextPanelOpen false initially', () => {
      const state = useLineageStore.getState();
      expect(state.contextPanelOpen).toBe(false);
    });
  });

  describe('setLineageIndex', () => {
    it('sets the lineage index', () => {
      const mockIndex = createMockLineageIndex();

      act(() => {
        useLineageStore.getState().setLineageIndex(mockIndex);
      });

      expect(useLineageStore.getState().lineageIndex).toBe(mockIndex);
    });

    it('can clear the lineage index by setting null', () => {
      const mockIndex = createMockLineageIndex();

      act(() => {
        useLineageStore.getState().setLineageIndex(mockIndex);
        useLineageStore.getState().setLineageIndex(null);
      });

      expect(useLineageStore.getState().lineageIndex).toBeNull();
    });
  });

  describe('setHoveredField', () => {
    it('sets hover info and shows tooltip', () => {
      const hoverInfo = {
        fieldName: 'test_field',
        line: 5,
        column: 10,
        x: 100,
        y: 200,
      };

      act(() => {
        useLineageStore.getState().setHoveredField(hoverInfo);
      });

      const state = useLineageStore.getState();
      expect(state.hoveredField).toEqual(hoverInfo);
      expect(state.tooltipVisible).toBe(true);
    });

    it('clears hover info and hides tooltip when set to null', () => {
      const hoverInfo = {
        fieldName: 'test_field',
        line: 5,
        column: 10,
        x: 100,
        y: 200,
      };

      act(() => {
        useLineageStore.getState().setHoveredField(hoverInfo);
        useLineageStore.getState().setHoveredField(null);
      });

      const state = useLineageStore.getState();
      expect(state.hoveredField).toBeNull();
      expect(state.tooltipVisible).toBe(false);
    });

    it('does not change hover when selection is locked', () => {
      act(() => {
        useLineageStore.getState().selectField('locked_field', true);
      });

      const hoverInfo = {
        fieldName: 'new_field',
        line: 5,
        column: 10,
        x: 100,
        y: 200,
      };

      act(() => {
        useLineageStore.getState().setHoveredField(hoverInfo);
      });

      // Hover should not have changed because selection is locked
      expect(useLineageStore.getState().hoveredField).toBeNull();
    });
  });

  describe('selectField', () => {
    it('selects a field without locking', () => {
      act(() => {
        useLineageStore.getState().selectField('my_field');
      });

      const state = useLineageStore.getState();
      expect(state.selectedField).toEqual({ fieldName: 'my_field', locked: false });
      expect(state.tooltipVisible).toBe(false);
    });

    it('selects a field with locking', () => {
      act(() => {
        useLineageStore.getState().selectField('my_field', true);
      });

      const state = useLineageStore.getState();
      expect(state.selectedField).toEqual({ fieldName: 'my_field', locked: true });
    });

    it('preserves tooltip visibility when selecting a field', () => {
      act(() => {
        useLineageStore.getState().setHoveredField({
          fieldName: 'test',
          line: 1,
          column: 1,
          x: 0,
          y: 0,
        });
        useLineageStore.getState().selectField('my_field');
      });

      // Tooltip visibility is independent of selection
      expect(useLineageStore.getState().tooltipVisible).toBe(true);
    });
  });

  describe('clearSelection', () => {
    it('clears the selected field', () => {
      act(() => {
        useLineageStore.getState().selectField('my_field');
        useLineageStore.getState().clearSelection();
      });

      expect(useLineageStore.getState().selectedField).toBeNull();
    });

    it('clears highlighted lines when clearing selection', () => {
      act(() => {
        useLineageStore.getState().selectField('my_field');
        useLineageStore.getState().setHighlightedLines([1, 2, 3]);
        useLineageStore.getState().clearSelection();
      });

      expect(useLineageStore.getState().highlightedLines).toEqual([]);
    });
  });

  describe('toggleSelectionLock', () => {
    it('toggles lock from false to true', () => {
      act(() => {
        useLineageStore.getState().selectField('my_field', false);
        useLineageStore.getState().toggleSelectionLock();
      });

      expect(useLineageStore.getState().selectedField?.locked).toBe(true);
    });

    it('toggles lock from true to false', () => {
      act(() => {
        useLineageStore.getState().selectField('my_field', true);
        useLineageStore.getState().toggleSelectionLock();
      });

      expect(useLineageStore.getState().selectedField?.locked).toBe(false);
    });

    it('does nothing when no field is selected', () => {
      act(() => {
        useLineageStore.getState().toggleSelectionLock();
      });

      expect(useLineageStore.getState().selectedField).toBeNull();
    });
  });

  describe('setHighlightedLines', () => {
    it('sets highlighted lines', () => {
      act(() => {
        useLineageStore.getState().setHighlightedLines([1, 5, 10]);
      });

      expect(useLineageStore.getState().highlightedLines).toEqual([1, 5, 10]);
    });

    it('replaces existing highlighted lines', () => {
      act(() => {
        useLineageStore.getState().setHighlightedLines([1, 2]);
        useLineageStore.getState().setHighlightedLines([3, 4, 5]);
      });

      expect(useLineageStore.getState().highlightedLines).toEqual([3, 4, 5]);
    });
  });

  describe('clearHighlights', () => {
    it('clears all highlighted lines', () => {
      act(() => {
        useLineageStore.getState().setHighlightedLines([1, 2, 3]);
        useLineageStore.getState().clearHighlights();
      });

      expect(useLineageStore.getState().highlightedLines).toEqual([]);
    });
  });

  describe('setTooltipVisible', () => {
    it('sets tooltip visibility to true', () => {
      act(() => {
        useLineageStore.getState().setTooltipVisible(true);
      });

      expect(useLineageStore.getState().tooltipVisible).toBe(true);
    });

    it('sets tooltip visibility to false', () => {
      act(() => {
        useLineageStore.getState().setTooltipVisible(true);
        useLineageStore.getState().setTooltipVisible(false);
      });

      expect(useLineageStore.getState().tooltipVisible).toBe(false);
    });
  });

  describe('setContextPanelOpen', () => {
    it('opens context panel', () => {
      act(() => {
        useLineageStore.getState().setContextPanelOpen(true);
      });

      expect(useLineageStore.getState().contextPanelOpen).toBe(true);
    });

    it('closes context panel', () => {
      act(() => {
        useLineageStore.getState().setContextPanelOpen(true);
        useLineageStore.getState().setContextPanelOpen(false);
      });

      expect(useLineageStore.getState().contextPanelOpen).toBe(false);
    });
  });

  describe('reset', () => {
    it('resets all state to initial values', () => {
      const mockIndex = createMockLineageIndex();

      act(() => {
        useLineageStore.getState().setLineageIndex(mockIndex);
        useLineageStore.getState().selectField('field', true);
        useLineageStore.getState().setHighlightedLines([1, 2, 3]);
        useLineageStore.getState().setTooltipVisible(true);
        useLineageStore.getState().setContextPanelOpen(true);
        useLineageStore.getState().reset();
      });

      const state = useLineageStore.getState();
      expect(state.lineageIndex).toBeNull();
      expect(state.hoveredField).toBeNull();
      expect(state.selectedField).toBeNull();
      expect(state.highlightedLines).toEqual([]);
      expect(state.tooltipVisible).toBe(false);
      expect(state.contextPanelOpen).toBe(false);
    });
  });
});

describe('selectors', () => {
  beforeEach(() => {
    act(() => {
      useLineageStore.getState().reset();
    });
  });

  describe('selectLineageIndex', () => {
    it('returns lineage index from state', () => {
      const mockIndex = createMockLineageIndex();
      act(() => {
        useLineageStore.getState().setLineageIndex(mockIndex);
      });

      const state = useLineageStore.getState();
      expect(selectLineageIndex(state)).toBe(mockIndex);
    });
  });

  describe('selectHoveredField', () => {
    it('returns hovered field from state', () => {
      const hoverInfo = { fieldName: 'test', line: 1, column: 1, x: 0, y: 0 };
      act(() => {
        useLineageStore.getState().setHoveredField(hoverInfo);
      });

      const state = useLineageStore.getState();
      expect(selectHoveredField(state)).toEqual(hoverInfo);
    });
  });

  describe('selectSelectedField', () => {
    it('returns selected field from state', () => {
      act(() => {
        useLineageStore.getState().selectField('my_field', true);
      });

      const state = useLineageStore.getState();
      expect(selectSelectedField(state)).toEqual({ fieldName: 'my_field', locked: true });
    });
  });

  describe('selectHighlightedLines', () => {
    it('returns highlighted lines from state', () => {
      act(() => {
        useLineageStore.getState().setHighlightedLines([1, 2, 3]);
      });

      const state = useLineageStore.getState();
      expect(selectHighlightedLines(state)).toEqual([1, 2, 3]);
    });
  });

  describe('selectTooltipVisible', () => {
    it('returns tooltip visibility from state', () => {
      act(() => {
        useLineageStore.getState().setTooltipVisible(true);
      });

      const state = useLineageStore.getState();
      expect(selectTooltipVisible(state)).toBe(true);
    });
  });

  describe('selectContextPanelOpen', () => {
    it('returns context panel open state', () => {
      act(() => {
        useLineageStore.getState().setContextPanelOpen(true);
      });

      const state = useLineageStore.getState();
      expect(selectContextPanelOpen(state)).toBe(true);
    });
  });

  describe('selectActiveField', () => {
    it('returns selected field name when selected', () => {
      act(() => {
        useLineageStore.getState().selectField('selected_field');
      });

      const state = useLineageStore.getState();
      expect(selectActiveField(state)).toBe('selected_field');
    });

    it('returns hovered field name when no selection', () => {
      act(() => {
        useLineageStore.getState().setHoveredField({
          fieldName: 'hovered_field',
          line: 1,
          column: 1,
          x: 0,
          y: 0,
        });
      });

      const state = useLineageStore.getState();
      expect(selectActiveField(state)).toBe('hovered_field');
    });

    it('prefers selected over hovered', () => {
      act(() => {
        useLineageStore.getState().setHoveredField({
          fieldName: 'hovered_field',
          line: 1,
          column: 1,
          x: 0,
          y: 0,
        });
        useLineageStore.getState().selectField('selected_field');
      });

      const state = useLineageStore.getState();
      expect(selectActiveField(state)).toBe('selected_field');
    });

    it('returns null when neither selected nor hovered', () => {
      const state = useLineageStore.getState();
      expect(selectActiveField(state)).toBeNull();
    });
  });

  describe('selectActiveFieldLineage', () => {
    it('returns lineage for active field', () => {
      const mockIndex = createMockLineageIndex();
      act(() => {
        useLineageStore.getState().setLineageIndex(mockIndex);
        useLineageStore.getState().selectField('test_field');
      });

      const state = useLineageStore.getState();
      const lineage = selectActiveFieldLineage(state);
      expect(lineage).not.toBeNull();
      expect(lineage?.fieldName).toBe('test_field');
    });

    it('returns null when no active field', () => {
      const mockIndex = createMockLineageIndex();
      act(() => {
        useLineageStore.getState().setLineageIndex(mockIndex);
      });

      const state = useLineageStore.getState();
      expect(selectActiveFieldLineage(state)).toBeNull();
    });

    it('returns null when no lineage index', () => {
      act(() => {
        useLineageStore.getState().selectField('test_field');
      });

      const state = useLineageStore.getState();
      expect(selectActiveFieldLineage(state)).toBeNull();
    });

    it('returns null for field not in index', () => {
      const mockIndex = createMockLineageIndex();
      act(() => {
        useLineageStore.getState().setLineageIndex(mockIndex);
        useLineageStore.getState().selectField('nonexistent_field');
      });

      const state = useLineageStore.getState();
      expect(selectActiveFieldLineage(state)).toBeNull();
    });
  });
});
