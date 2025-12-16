/**
 * useFieldLineage Hook Tests
 *
 * Tests for the hook that manages field lineage analysis.
 *
 * @module entities/field/model/hooks/useFieldLineage.test
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useFieldLineage, useFieldInfo, useFieldsAtCursor } from './useFieldLineage';
import { useEditorStore } from '@/entities/spl';
import { useLineageStore } from '../../store';
import type { LineageIndex, FieldLineage } from '../lineage.types';

// Helper to create mock LineageIndex
function createMockLineageIndex(): LineageIndex {
  const fields: Record<string, FieldLineage> = {
    host: {
      fieldName: 'host',
      dataType: 'string',
      origin: { kind: 'origin', command: 'search', line: 1 },
      dependsOn: [],
      dependedOnBy: ['processed_host'],
      isMultivalue: false,
      confidence: 'certain',
      events: [
        { kind: 'origin', command: 'search', line: 1, fieldName: 'host' },
        { kind: 'consumed', command: 'stats', line: 2, fieldName: 'host' },
      ],
    },
    count: {
      fieldName: 'count',
      dataType: 'number',
      origin: { kind: 'created', command: 'stats', line: 2 },
      dependsOn: ['host'],
      dependedOnBy: [],
      isMultivalue: false,
      confidence: 'certain',
      events: [{ kind: 'created', command: 'stats', line: 2, fieldName: 'count' }],
    },
  };

  const fieldsByLine: Record<number, string[]> = {
    1: ['host', 'source', 'sourcetype'],
    2: ['host', 'count'],
  };

  return {
    getFieldLineage: (name: string) => fields[name] ?? null,
    getFieldEvents: (name: string) => fields[name]?.events ?? [],
    getAllFields: () => Object.keys(fields),
    getFieldsAtLine: (line: number) => fieldsByLine[line] ?? [],
    fieldExistsAt: (name: string, line: number) => fieldsByLine[line]?.includes(name) ?? false,
    getFieldOrigin: (name: string) => fields[name]?.origin ?? null,
    getWarnings: () => [{ level: 'warning', message: 'Field may be undefined', line: 3 }],
  };
}

describe('useFieldLineage', () => {
  beforeEach(() => {
    // Reset stores
    act(() => {
      useEditorStore.getState().reset();
      useLineageStore.getState().reset();
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('returns null lineageIndex when no AST', () => {
      const { result } = renderHook(() => useFieldLineage());

      expect(result.current.lineageIndex).toBeNull();
    });

    it('returns empty warnings when no lineageIndex', () => {
      const { result } = renderHook(() => useFieldLineage());

      expect(result.current.warnings).toEqual([]);
    });
  });

  describe('with pre-set lineage index', () => {
    beforeEach(() => {
      // Pre-set lineageIndex in store to test query methods directly
      act(() => {
        useLineageStore.getState().setLineageIndex(createMockLineageIndex());
      });
    });

    describe('getFieldLineage', () => {
      it('returns lineage for existing field', () => {
        const { result } = renderHook(() => useFieldLineage());

        const lineage = result.current.getFieldLineage('host');
        expect(lineage).not.toBeNull();
        expect(lineage?.fieldName).toBe('host');
        expect(lineage?.dataType).toBe('string');
      });

      it('returns null for non-existent field', () => {
        const { result } = renderHook(() => useFieldLineage());

        const lineage = result.current.getFieldLineage('nonexistent');
        expect(lineage).toBeNull();
      });
    });

    describe('fieldExistsAt', () => {
      it('returns true when field exists at line', () => {
        const { result } = renderHook(() => useFieldLineage());

        expect(result.current.fieldExistsAt('host', 1)).toBe(true);
        expect(result.current.fieldExistsAt('host', 2)).toBe(true);
      });

      it('returns false when field does not exist at line', () => {
        const { result } = renderHook(() => useFieldLineage());

        expect(result.current.fieldExistsAt('count', 1)).toBe(false);
      });
    });

    describe('getFieldsAtLine', () => {
      it('returns fields at specified line', () => {
        const { result } = renderHook(() => useFieldLineage());

        const fields = result.current.getFieldsAtLine(1);
        expect(fields).toContain('host');
        expect(fields).toContain('source');
      });

      it('returns empty array for line with no fields', () => {
        const { result } = renderHook(() => useFieldLineage());

        const fields = result.current.getFieldsAtLine(999);
        expect(fields).toEqual([]);
      });
    });

    describe('getFieldOrigin', () => {
      it('returns origin for existing field', () => {
        const { result } = renderHook(() => useFieldLineage());

        const origin = result.current.getFieldOrigin('host');
        expect(origin).not.toBeNull();
        expect(origin?.line).toBe(1);
        expect(origin?.command).toBe('search');
      });

      it('returns null for non-existent field', () => {
        const { result } = renderHook(() => useFieldLineage());

        const origin = result.current.getFieldOrigin('nonexistent');
        expect(origin).toBeNull();
      });
    });

    describe('warnings', () => {
      it('returns warnings from lineage index', () => {
        const { result } = renderHook(() => useFieldLineage());

        expect(result.current.warnings).toHaveLength(1);
        expect(result.current.warnings[0].message).toBe('Field may be undefined');
      });
    });

    describe('reanalyze', () => {
      it('provides a reanalyze function', () => {
        const { result } = renderHook(() => useFieldLineage());

        expect(typeof result.current.reanalyze).toBe('function');
      });
    });
  });

  describe('without lineageIndex', () => {
    it('getFieldLineage returns null', () => {
      const { result } = renderHook(() => useFieldLineage());
      expect(result.current.getFieldLineage('host')).toBeNull();
    });

    it('fieldExistsAt returns false', () => {
      const { result } = renderHook(() => useFieldLineage());
      expect(result.current.fieldExistsAt('host', 1)).toBe(false);
    });

    it('getFieldsAtLine returns empty array', () => {
      const { result } = renderHook(() => useFieldLineage());
      expect(result.current.getFieldsAtLine(1)).toEqual([]);
    });

    it('getFieldOrigin returns null', () => {
      const { result } = renderHook(() => useFieldLineage());
      expect(result.current.getFieldOrigin('host')).toBeNull();
    });

    it('warnings returns empty array', () => {
      const { result } = renderHook(() => useFieldLineage());
      expect(result.current.warnings).toEqual([]);
    });
  });

  describe('callback stability', () => {
    it('getFieldLineage callback is stable', () => {
      const { result, rerender } = renderHook(() => useFieldLineage());

      const firstCallback = result.current.getFieldLineage;
      rerender();
      const secondCallback = result.current.getFieldLineage;

      expect(firstCallback).toBe(secondCallback);
    });

    it('fieldExistsAt callback is stable', () => {
      const { result, rerender } = renderHook(() => useFieldLineage());

      const firstCallback = result.current.fieldExistsAt;
      rerender();
      const secondCallback = result.current.fieldExistsAt;

      expect(firstCallback).toBe(secondCallback);
    });

    it('getFieldsAtLine callback is stable', () => {
      const { result, rerender } = renderHook(() => useFieldLineage());

      const firstCallback = result.current.getFieldsAtLine;
      rerender();
      const secondCallback = result.current.getFieldsAtLine;

      expect(firstCallback).toBe(secondCallback);
    });

    it('getFieldOrigin callback is stable', () => {
      const { result, rerender } = renderHook(() => useFieldLineage());

      const firstCallback = result.current.getFieldOrigin;
      rerender();
      const secondCallback = result.current.getFieldOrigin;

      expect(firstCallback).toBe(secondCallback);
    });

    it('reanalyze callback is stable', () => {
      const { result, rerender } = renderHook(() => useFieldLineage());

      const firstCallback = result.current.reanalyze;
      rerender();
      const secondCallback = result.current.reanalyze;

      expect(firstCallback).toBe(secondCallback);
    });
  });

  describe('lineageIndex from store', () => {
    it('reflects lineageIndex from store', () => {
      const { result } = renderHook(() => useFieldLineage());

      expect(result.current.lineageIndex).toBeNull();

      act(() => {
        useLineageStore.getState().setLineageIndex(createMockLineageIndex());
      });

      // Re-render to pick up store changes
      const { result: result2 } = renderHook(() => useFieldLineage());
      expect(result2.current.lineageIndex).not.toBeNull();
    });
  });
});

describe('useFieldInfo', () => {
  beforeEach(() => {
    act(() => {
      useEditorStore.getState().reset();
      useLineageStore.getState().reset();
    });
  });

  it('returns null when fieldName is null', () => {
    const { result } = renderHook(() => useFieldInfo(null));
    expect(result.current).toBeNull();
  });

  it('returns object with fieldName even when no lineageIndex', () => {
    const { result } = renderHook(() => useFieldInfo('host'));

    expect(result.current?.fieldName).toBe('host');
    expect(result.current?.lineage).toBeNull();
    expect(result.current?.dataType).toBe('unknown');
  });

  it('returns field info for valid field with lineageIndex', () => {
    act(() => {
      useLineageStore.getState().setLineageIndex(createMockLineageIndex());
      useEditorStore.getState().setCursor(1, 1);
    });

    const { result } = renderHook(() => useFieldInfo('host'));

    expect(result.current?.fieldName).toBe('host');
    expect(result.current?.dataType).toBe('string');
    expect(result.current?.existsAtCursor).toBe(true);
  });

  it('includes dependency information', () => {
    act(() => {
      useLineageStore.getState().setLineageIndex(createMockLineageIndex());
    });

    const { result } = renderHook(() => useFieldInfo('count'));

    expect(result.current?.dependsOn).toContain('host');
  });

  it('includes events array', () => {
    act(() => {
      useLineageStore.getState().setLineageIndex(createMockLineageIndex());
    });

    const { result } = renderHook(() => useFieldInfo('host'));

    expect(result.current?.events).toHaveLength(2);
  });

  it('shows existsAtCursor as false when cursor not on field line', () => {
    act(() => {
      useLineageStore.getState().setLineageIndex(createMockLineageIndex());
      useEditorStore.getState().setCursor(999, 1);
    });

    const { result } = renderHook(() => useFieldInfo('host'));

    expect(result.current?.existsAtCursor).toBe(false);
  });

  it('includes origin information', () => {
    act(() => {
      useLineageStore.getState().setLineageIndex(createMockLineageIndex());
    });

    const { result } = renderHook(() => useFieldInfo('host'));

    expect(result.current?.origin).not.toBeNull();
    expect(result.current?.origin?.line).toBe(1);
    expect(result.current?.origin?.command).toBe('search');
  });

  it('includes dependedOnBy information', () => {
    act(() => {
      useLineageStore.getState().setLineageIndex(createMockLineageIndex());
    });

    const { result } = renderHook(() => useFieldInfo('host'));

    expect(result.current?.dependedOnBy).toContain('processed_host');
  });

  it('includes confidence information', () => {
    act(() => {
      useLineageStore.getState().setLineageIndex(createMockLineageIndex());
    });

    const { result } = renderHook(() => useFieldInfo('host'));

    expect(result.current?.confidence).toBe('certain');
  });
});

describe('useFieldsAtCursor', () => {
  beforeEach(() => {
    act(() => {
      useEditorStore.getState().reset();
      useLineageStore.getState().reset();
    });
  });

  it('returns empty array when no lineageIndex', () => {
    act(() => {
      useEditorStore.getState().setCursor(1, 1);
    });

    const { result } = renderHook(() => useFieldsAtCursor());

    expect(result.current).toEqual([]);
  });

  it('returns fields at current cursor line', () => {
    act(() => {
      useLineageStore.getState().setLineageIndex(createMockLineageIndex());
      useEditorStore.getState().setCursor(1, 1);
    });

    const { result } = renderHook(() => useFieldsAtCursor());

    expect(result.current).toContain('host');
    expect(result.current).toContain('source');
  });

  it('returns different fields for different cursor lines', () => {
    act(() => {
      useLineageStore.getState().setLineageIndex(createMockLineageIndex());
      useEditorStore.getState().setCursor(2, 1);
    });

    const { result } = renderHook(() => useFieldsAtCursor());

    expect(result.current).toContain('count');
    expect(result.current).toContain('host');
    expect(result.current).not.toContain('source'); // source is only on line 1
  });

  it('returns empty array when cursor on line with no fields', () => {
    act(() => {
      useLineageStore.getState().setLineageIndex(createMockLineageIndex());
      useEditorStore.getState().setCursor(999, 1);
    });

    const { result } = renderHook(() => useFieldsAtCursor());

    expect(result.current).toEqual([]);
  });

  it('updates when cursor position changes', () => {
    act(() => {
      useLineageStore.getState().setLineageIndex(createMockLineageIndex());
      useEditorStore.getState().setCursor(1, 1);
    });

    const { result, rerender } = renderHook(() => useFieldsAtCursor());

    expect(result.current).toContain('source');

    act(() => {
      useEditorStore.getState().setCursor(2, 1);
    });

    rerender();

    expect(result.current).toContain('count');
    expect(result.current).not.toContain('source');
  });
});
