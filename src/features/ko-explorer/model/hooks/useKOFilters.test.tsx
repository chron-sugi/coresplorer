/**
 * useKOFilters Hook Tests
 *
 * Tests for the useKOFilters hook that filters Knowledge Objects.
 *
 * @module features/ko-explorer/model/hooks/useKOFilters.test
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useKOFilters } from './useKOFilters';
import { useFilterStore } from '../store/useFilterStore';
import type { KnowledgeObject } from '@/entities/knowledge-object';

// Mock useFilterUrlSync
vi.mock('./useFilterUrlSync', () => ({
  useFilterUrlSync: () => {},
}));

const mockKOs: KnowledgeObject[] = [
  {
    id: 'ko-1',
    name: 'User Search',
    type: 'saved_search',
    app: 'search',
    owner: 'admin',
    isolated: false,
  },
  {
    id: 'ko-2',
    name: 'Admin Dashboard',
    type: 'dashboard',
    app: 'reporting',
    owner: 'admin',
    isolated: false,
  },
  {
    id: 'ko-3',
    name: 'Security Report',
    type: 'report',
    app: 'security',
    owner: 'user1',
    isolated: true,
  },
];

describe('useKOFilters', () => {
  beforeEach(() => {
    // Reset filter store before each test
    useFilterStore.getState().clearFilters();
  });

  it('returns all KOs when no filters are applied', () => {
    const { result } = renderHook(() => useKOFilters(mockKOs));

    expect(result.current.filteredKOs).toHaveLength(3);
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it('filters by search term (name)', () => {
    const { result } = renderHook(() => useKOFilters(mockKOs));

    act(() => {
      result.current.setFilter('searchTerm', 'dashboard');
    });

    expect(result.current.filteredKOs).toHaveLength(1);
    expect(result.current.filteredKOs[0].name).toBe('Admin Dashboard');
  });

  it('filters by search term (case insensitive)', () => {
    const { result } = renderHook(() => useKOFilters(mockKOs));

    act(() => {
      result.current.setFilter('searchTerm', 'ADMIN');
    });

    expect(result.current.filteredKOs).toHaveLength(1);
    expect(result.current.filteredKOs[0].name).toBe('Admin Dashboard');
  });

  it('filters by search term (matches multiple fields)', () => {
    const { result } = renderHook(() => useKOFilters(mockKOs));

    act(() => {
      result.current.setFilter('searchTerm', 'admin');
    });

    // Should match name "Admin Dashboard" and owner "admin" (2 KOs)
    expect(result.current.filteredKOs).toHaveLength(2);
  });

  it('filters by type', () => {
    const { result } = renderHook(() => useKOFilters(mockKOs));

    act(() => {
      result.current.setFilter('types', ['saved_search']);
    });

    expect(result.current.filteredKOs).toHaveLength(1);
    expect(result.current.filteredKOs[0].type).toBe('saved_search');
  });

  it('filters by multiple types (OR logic)', () => {
    const { result } = renderHook(() => useKOFilters(mockKOs));

    act(() => {
      result.current.setFilter('types', ['saved_search', 'dashboard']);
    });

    expect(result.current.filteredKOs).toHaveLength(2);
  });

  it('filters by app', () => {
    const { result } = renderHook(() => useKOFilters(mockKOs));

    act(() => {
      result.current.setFilter('apps', ['security']);
    });

    expect(result.current.filteredKOs).toHaveLength(1);
    expect(result.current.filteredKOs[0].app).toBe('security');
  });

  it('filters by owner', () => {
    const { result } = renderHook(() => useKOFilters(mockKOs));

    act(() => {
      result.current.setFilter('owners', ['admin']);
    });

    expect(result.current.filteredKOs).toHaveLength(2);
    expect(result.current.filteredKOs.every((ko) => ko.owner === 'admin')).toBe(true);
  });

  it('combines multiple filters with AND logic', () => {
    const { result } = renderHook(() => useKOFilters(mockKOs));

    act(() => {
      result.current.setFilter('types', ['saved_search', 'dashboard']);
      result.current.setFilter('owners', ['admin']);
    });

    expect(result.current.filteredKOs).toHaveLength(2);
    expect(result.current.filteredKOs.every((ko) => ko.owner === 'admin')).toBe(true);
  });

  it('returns empty array when no matches', () => {
    const { result } = renderHook(() => useKOFilters(mockKOs));

    act(() => {
      result.current.setFilter('searchTerm', 'nonexistent');
    });

    expect(result.current.filteredKOs).toHaveLength(0);
  });

  it('clears all filters', () => {
    const { result } = renderHook(() => useKOFilters(mockKOs));

    act(() => {
      result.current.setFilter('searchTerm', 'test');
      result.current.setFilter('types', ['saved_search']);
    });

    expect(result.current.filteredKOs.length).toBeLessThan(3);

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filteredKOs).toHaveLength(3);
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it('detects active filters correctly', () => {
    const { result } = renderHook(() => useKOFilters(mockKOs));

    expect(result.current.hasActiveFilters).toBe(false);

    act(() => {
      result.current.setFilter('searchTerm', 'test');
    });

    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('provides stable filter object reference when values unchanged', () => {
    const { result, rerender } = renderHook(() => useKOFilters(mockKOs));

    const firstFilters = result.current.filters;
    rerender();
    const secondFilters = result.current.filters;

    expect(firstFilters).toBe(secondFilters);
  });

  it('updates filter object reference when values change', () => {
    const { result } = renderHook(() => useKOFilters(mockKOs));

    const firstFilters = result.current.filters;

    act(() => {
      result.current.setFilter('searchTerm', 'test');
    });

    const secondFilters = result.current.filters;
    expect(firstFilters).not.toBe(secondFilters);
  });

  it('handles empty KOs array', () => {
    const { result } = renderHook(() => useKOFilters([]));

    expect(result.current.filteredKOs).toHaveLength(0);
  });

  it('filters by search term matching ID', () => {
    const { result } = renderHook(() => useKOFilters(mockKOs));

    act(() => {
      result.current.setFilter('searchTerm', 'ko-3');
    });

    expect(result.current.filteredKOs).toHaveLength(1);
    expect(result.current.filteredKOs[0].id).toBe('ko-3');
  });

  it('filters by search term matching app', () => {
    const { result } = renderHook(() => useKOFilters(mockKOs));

    act(() => {
      result.current.setFilter('searchTerm', 'reporting');
    });

    expect(result.current.filteredKOs).toHaveLength(1);
    expect(result.current.filteredKOs[0].app).toBe('reporting');
  });
});
