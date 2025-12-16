/**
 * useHighlight Hook Tests
 *
 * Tests for the useHighlight hook that manages field highlighting.
 *
 * @module features/field-highlight/model/use-highlight.test
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useHighlight } from './use-highlight';
import { useLineageStore, type FieldEvent } from '@/entities/field';

// Mock the lineage store
vi.mock('@/entities/field', async () => {
  const actual = await vi.importActual('@/entities/field');
  return {
    ...actual,
    useLineageStore: vi.fn(),
  };
});

const mockEvents: FieldEvent[] = [
  {
    kind: 'created',
    command: 'eval',
    line: 5,
    expression: 'field="value"',
  },
  {
    kind: 'modified',
    command: 'eval',
    line: 10,
    expression: 'field=upper(field)',
  },
];

describe('useHighlight', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null values when no field is selected', () => {
    (useLineageStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        const state = {
          selectedField: null,
          highlightedLines: [],
          lineageIndex: null,
          selectField: vi.fn(),
          clearSelection: vi.fn(),
          toggleSelectionLock: vi.fn(),
        };
        return selector(state);
      }
      return null;
    });

    const { result } = renderHook(() => useHighlight());

    expect(result.current.selectedField).toBeNull();
    expect(result.current.isLocked).toBe(false);
    expect(result.current.highlightedLines).toEqual([]);
    expect(result.current.highlightedEvents).toEqual([]);
  });

  it('returns selected field info when field is selected', () => {
    const mockSelectedInfo = {
      fieldName: 'test_field',
      locked: false,
    };

    const mockLineageIndex = {
      getFieldEvents: vi.fn().mockReturnValue(mockEvents),
    };

    (useLineageStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        const state = {
          selectedField: mockSelectedInfo,
          highlightedLines: [5, 10],
          lineageIndex: mockLineageIndex,
          selectField: vi.fn(),
          clearSelection: vi.fn(),
          toggleSelectionLock: vi.fn(),
        };
        return selector(state);
      }
      return null;
    });

    const { result } = renderHook(() => useHighlight());

    expect(result.current.selectedField).toBe('test_field');
    expect(result.current.isLocked).toBe(false);
    expect(result.current.highlightedLines).toEqual([5, 10]);
  });

  it('retrieves events for selected field with color classes', () => {
    const mockSelectedInfo = {
      fieldName: 'test_field',
      locked: false,
    };

    const mockLineageIndex = {
      getFieldEvents: vi.fn().mockReturnValue(mockEvents),
    };

    (useLineageStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        const state = {
          selectedField: mockSelectedInfo,
          highlightedLines: [5, 10],
          lineageIndex: mockLineageIndex,
          selectField: vi.fn(),
          clearSelection: vi.fn(),
          toggleSelectionLock: vi.fn(),
        };
        return selector(state);
      }
      return null;
    });

    const { result } = renderHook(() => useHighlight());

    expect(result.current.highlightedEvents).toHaveLength(2);
    expect(result.current.highlightedEvents[0].event).toEqual(mockEvents[0]);
    expect(result.current.highlightedEvents[0].colorClass).toContain('emerald'); // created = emerald
    expect(result.current.highlightedEvents[1].event).toEqual(mockEvents[1]);
    expect(result.current.highlightedEvents[1].colorClass).toContain('violet'); // modified = violet
  });

  it('provides selectField function that calls store action', () => {
    const mockSelectField = vi.fn();

    (useLineageStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        const state = {
          selectedField: null,
          highlightedLines: [],
          lineageIndex: null,
          selectField: mockSelectField,
          clearSelection: vi.fn(),
          toggleSelectionLock: vi.fn(),
        };
        return selector(state);
      }
      return null;
    });

    const { result } = renderHook(() => useHighlight());

    act(() => {
      result.current.selectField('field_name', true);
    });

    expect(mockSelectField).toHaveBeenCalledWith('field_name', true);
  });

  it('defaults lock to false when not specified', () => {
    const mockSelectField = vi.fn();

    (useLineageStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        const state = {
          selectedField: null,
          highlightedLines: [],
          lineageIndex: null,
          selectField: mockSelectField,
          clearSelection: vi.fn(),
          toggleSelectionLock: vi.fn(),
        };
        return selector(state);
      }
      return null;
    });

    const { result } = renderHook(() => useHighlight());

    act(() => {
      result.current.selectField('field_name');
    });

    expect(mockSelectField).toHaveBeenCalledWith('field_name', false);
  });

  it('provides clearSelection function', () => {
    const mockClearSelection = vi.fn();

    (useLineageStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        const state = {
          selectedField: null,
          highlightedLines: [],
          lineageIndex: null,
          selectField: vi.fn(),
          clearSelection: mockClearSelection,
          toggleSelectionLock: vi.fn(),
        };
        return selector(state);
      }
      return null;
    });

    const { result } = renderHook(() => useHighlight());

    act(() => {
      result.current.clearSelection();
    });

    expect(mockClearSelection).toHaveBeenCalled();
  });

  it('provides toggleLock function', () => {
    const mockToggleLock = vi.fn();

    (useLineageStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        const state = {
          selectedField: null,
          highlightedLines: [],
          lineageIndex: null,
          selectField: vi.fn(),
          clearSelection: vi.fn(),
          toggleSelectionLock: mockToggleLock,
        };
        return selector(state);
      }
      return null;
    });

    const { result } = renderHook(() => useHighlight());

    act(() => {
      result.current.toggleLock();
    });

    expect(mockToggleLock).toHaveBeenCalled();
  });

  it('returns isLocked as true when field is locked', () => {
    const mockSelectedInfo = {
      fieldName: 'test_field',
      locked: true,
    };

    (useLineageStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        const state = {
          selectedField: mockSelectedInfo,
          highlightedLines: [],
          lineageIndex: null,
          selectField: vi.fn(),
          clearSelection: vi.fn(),
          toggleSelectionLock: vi.fn(),
        };
        return selector(state);
      }
      return null;
    });

    const { result } = renderHook(() => useHighlight());

    expect(result.current.isLocked).toBe(true);
  });

  it('applies default color for unknown event kinds', () => {
    const unknownEvent: FieldEvent = {
      kind: 'unknown_kind' as any,
      command: 'custom',
      line: 1,
    };

    const mockSelectedInfo = {
      fieldName: 'test_field',
      locked: false,
    };

    const mockLineageIndex = {
      getFieldEvents: vi.fn().mockReturnValue([unknownEvent]),
    };

    (useLineageStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        const state = {
          selectedField: mockSelectedInfo,
          highlightedLines: [],
          lineageIndex: mockLineageIndex,
          selectField: vi.fn(),
          clearSelection: vi.fn(),
          toggleSelectionLock: vi.fn(),
        };
        return selector(state);
      }
      return null;
    });

    const { result } = renderHook(() => useHighlight());

    expect(result.current.highlightedEvents[0].colorClass).toContain('slate');
  });

  it('returns empty events array when lineageIndex is null', () => {
    const mockSelectedInfo = {
      fieldName: 'test_field',
      locked: false,
    };

    (useLineageStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        const state = {
          selectedField: mockSelectedInfo,
          highlightedLines: [],
          lineageIndex: null,
          selectField: vi.fn(),
          clearSelection: vi.fn(),
          toggleSelectionLock: vi.fn(),
        };
        return selector(state);
      }
      return null;
    });

    const { result } = renderHook(() => useHighlight());

    expect(result.current.highlightedEvents).toEqual([]);
  });
});
