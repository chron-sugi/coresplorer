/**
 * useHover Hook Tests
 *
 * Tests for the useHover hook that manages field hover state.
 *
 * @module features/field-hover/model/use-hover.test
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useHover } from './use-hover';
import { useLineageStore } from '@/entities/field';
import type { FieldLineage, FieldEvent } from '@/features/field-lineage';

// Mock the lineage store
vi.mock('@/entities/field', async () => {
  const actual = await vi.importActual('@/entities/field');
  return {
    ...actual,
    useLineageStore: vi.fn(),
  };
});

const mockLineage: FieldLineage = {
  dataType: 'string',
  origin: {
    kind: 'created',
    command: 'eval',
    line: 1,
    expression: 'field="value"',
  },
  dependsOn: ['source_field'],
  dependedOnBy: ['derived_field'],
  isMultivalue: false,
  confidence: 'high',
  events: [],
};

describe('useHover', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null values when nothing is hovered', () => {
    const state = {
      hoveredField: null,
      tooltipVisible: false,
      lineageIndex: null,
      setHoveredField: vi.fn(),
    };

    (useLineageStore as any).mockImplementation((selector: any) => {
      return typeof selector === 'function' ? selector(state) : state;
    });

    const { result } = renderHook(() => useHover());

    expect(result.current.hoveredField).toBeNull();
    expect(result.current.position).toBeNull();
    expect(result.current.hoverLine).toBeNull();
    expect(result.current.tooltipVisible).toBe(false);
    expect(result.current.lineage).toBeNull();
    expect(result.current.origin).toBeNull();
    expect(result.current.dependencies).toEqual([]);
    expect(result.current.dataType).toBe('unknown');
  });

  it('returns hover info when field is hovered', () => {
    const mockHoveredInfo = {
      fieldName: 'test_field',
      line: 5,
      column: 10,
      x: 100,
      y: 200,
    };

    const mockLineageIndex = {
      getFieldLineage: vi.fn().mockReturnValue(mockLineage),
    };

    (useLineageStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        const state = {
          hoveredField: mockHoveredInfo,
          tooltipVisible: true,
          lineageIndex: mockLineageIndex,
          setHoveredField: vi.fn(),
        };
        return selector(state);
      }
      return null;
    });

    const { result } = renderHook(() => useHover());

    expect(result.current.hoveredField).toBe('test_field');
    expect(result.current.position).toEqual({ x: 100, y: 200 });
    expect(result.current.hoverLine).toBe(5);
    expect(result.current.tooltipVisible).toBe(true);
  });

  it('retrieves lineage data for hovered field', () => {
    const mockHoveredInfo = {
      fieldName: 'test_field',
      line: 5,
      column: 10,
      x: 100,
      y: 200,
    };

    const mockLineageIndex = {
      getFieldLineage: vi.fn().mockReturnValue(mockLineage),
    };

    (useLineageStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        const state = {
          hoveredField: mockHoveredInfo,
          tooltipVisible: true,
          lineageIndex: mockLineageIndex,
          setHoveredField: vi.fn(),
        };
        return selector(state);
      }
      return null;
    });

    const { result } = renderHook(() => useHover());

    expect(result.current.lineage).toEqual(mockLineage);
    expect(result.current.origin).toEqual(mockLineage.origin);
    expect(result.current.dependencies).toEqual(['source_field']);
    expect(result.current.dataType).toBe('string');
  });

  it('provides setHover function that updates store', () => {
    const mockSetHoveredField = vi.fn();

    (useLineageStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        const state = {
          hoveredField: null,
          tooltipVisible: false,
          lineageIndex: null,
          setHoveredField: mockSetHoveredField,
        };
        return selector(state);
      }
      return null;
    });

    const { result } = renderHook(() => useHover());

    act(() => {
      result.current.setHover('field_name', { x: 50, y: 75 }, 10, 5);
    });

    expect(mockSetHoveredField).toHaveBeenCalledWith({
      fieldName: 'field_name',
      line: 10,
      column: 5,
      x: 50,
      y: 75,
    });
  });

  it('handles setHover with minimal parameters', () => {
    const mockSetHoveredField = vi.fn();

    (useLineageStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        const state = {
          hoveredField: null,
          tooltipVisible: false,
          lineageIndex: null,
          setHoveredField: mockSetHoveredField,
        };
        return selector(state);
      }
      return null;
    });

    const { result } = renderHook(() => useHover());

    act(() => {
      result.current.setHover('field_name');
    });

    expect(mockSetHoveredField).toHaveBeenCalledWith({
      fieldName: 'field_name',
      line: 0,
      column: 0,
      x: 0,
      y: 0,
    });
  });

  it('clears hover when setHover called with null', () => {
    const mockSetHoveredField = vi.fn();

    (useLineageStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        const state = {
          hoveredField: null,
          tooltipVisible: false,
          lineageIndex: null,
          setHoveredField: mockSetHoveredField,
        };
        return selector(state);
      }
      return null;
    });

    const { result } = renderHook(() => useHover());

    act(() => {
      result.current.setHover(null);
    });

    expect(mockSetHoveredField).toHaveBeenCalledWith(null);
  });

  it('provides clearHover function that clears store', () => {
    const mockSetHoveredField = vi.fn();

    (useLineageStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        const state = {
          hoveredField: null,
          tooltipVisible: false,
          lineageIndex: null,
          setHoveredField: mockSetHoveredField,
        };
        return selector(state);
      }
      return null;
    });

    const { result } = renderHook(() => useHover());

    act(() => {
      result.current.clearHover();
    });

    expect(mockSetHoveredField).toHaveBeenCalledWith(null);
  });

  it('returns unknown dataType when lineage is null', () => {
    const mockHoveredInfo = {
      fieldName: 'test_field',
      line: 5,
      column: 10,
      x: 100,
      y: 200,
    };

    const mockLineageIndex = {
      getFieldLineage: vi.fn().mockReturnValue(null),
    };

    (useLineageStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        const state = {
          hoveredField: mockHoveredInfo,
          tooltipVisible: true,
          lineageIndex: mockLineageIndex,
          setHoveredField: vi.fn(),
        };
        return selector(state);
      }
      return null;
    });

    const { result } = renderHook(() => useHover());

    expect(result.current.dataType).toBe('unknown');
    expect(result.current.origin).toBeNull();
    expect(result.current.dependencies).toEqual([]);
  });
});
