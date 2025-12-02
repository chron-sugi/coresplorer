/**
 * useKOSort Hook Tests
 *
 * Tests for the useKOSort hook that sorts Knowledge Objects.
 *
 * @module features/ko-explorer/model/hooks/useKOSort.test
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useKOSort } from './useKOSort';
import { useSortStore } from '../store/useSortStore';
import type { KnowledgeObject } from '@/entities/knowledge-object';

const mockKOs: KnowledgeObject[] = [
  {
    id: 'ko-1',
    name: 'Zebra Search',
    type: 'saved_search',
    app: 'beta',
    owner: 'charlie',
    isolated: false,
  },
  {
    id: 'ko-2',
    name: 'Alpha Dashboard',
    type: 'dashboard',
    app: 'alpha',
    owner: 'alice',
    isolated: false,
  },
  {
    id: 'ko-3',
    name: 'Beta Report',
    type: 'report',
    app: 'gamma',
    owner: 'bob',
    isolated: true,
  },
];

describe('useKOSort', () => {
  beforeEach(() => {
    // Reset sort store before each test
    const store = useSortStore.getState();
    store.sortBy = 'name';
    store.sortDirection = 'asc';
  });

  it('returns KOs sorted by name ascending by default', () => {
    const { result } = renderHook(() => useKOSort(mockKOs));

    expect(result.current.sortedKOs).toHaveLength(3);
    expect(result.current.sortedKOs[0].name).toBe('Alpha Dashboard');
    expect(result.current.sortedKOs[1].name).toBe('Beta Report');
    expect(result.current.sortedKOs[2].name).toBe('Zebra Search');
  });

  it('sorts by name in descending order', () => {
    const { result } = renderHook(() => useKOSort(mockKOs));

    act(() => {
      result.current.handleSort('name');
    });

    expect(result.current.sortDirection).toBe('desc');
    expect(result.current.sortedKOs[0].name).toBe('Zebra Search');
    expect(result.current.sortedKOs[2].name).toBe('Alpha Dashboard');
  });

  it('sorts by type ascending', () => {
    const { result } = renderHook(() => useKOSort(mockKOs));

    act(() => {
      result.current.handleSort('type');
    });

    expect(result.current.sortBy).toBe('type');
    expect(result.current.sortDirection).toBe('asc');
    expect(result.current.sortedKOs[0].type).toBe('dashboard');
    expect(result.current.sortedKOs[1].type).toBe('report');
    expect(result.current.sortedKOs[2].type).toBe('saved_search');
  });

  it('sorts by type descending', () => {
    const { result } = renderHook(() => useKOSort(mockKOs));

    act(() => {
      result.current.handleSort('type');
      result.current.handleSort('type');
    });

    expect(result.current.sortDirection).toBe('desc');
    expect(result.current.sortedKOs[0].type).toBe('saved_search');
    expect(result.current.sortedKOs[2].type).toBe('dashboard');
  });

  it('sorts by app ascending', () => {
    const { result } = renderHook(() => useKOSort(mockKOs));

    act(() => {
      result.current.handleSort('app');
    });

    expect(result.current.sortBy).toBe('app');
    expect(result.current.sortedKOs[0].app).toBe('alpha');
    expect(result.current.sortedKOs[1].app).toBe('beta');
    expect(result.current.sortedKOs[2].app).toBe('gamma');
  });

  it('sorts by owner ascending', () => {
    const { result } = renderHook(() => useKOSort(mockKOs));

    act(() => {
      result.current.handleSort('owner');
    });

    expect(result.current.sortBy).toBe('owner');
    expect(result.current.sortedKOs[0].owner).toBe('alice');
    expect(result.current.sortedKOs[1].owner).toBe('bob');
    expect(result.current.sortedKOs[2].owner).toBe('charlie');
  });

  it('toggles sort direction when clicking same column', () => {
    const { result } = renderHook(() => useKOSort(mockKOs));

    expect(result.current.sortDirection).toBe('asc');

    act(() => {
      result.current.handleSort('name');
    });

    expect(result.current.sortDirection).toBe('desc');

    act(() => {
      result.current.handleSort('name');
    });

    expect(result.current.sortDirection).toBe('asc');
  });

  it('resets to ascending when changing columns', () => {
    const { result } = renderHook(() => useKOSort(mockKOs));

    act(() => {
      result.current.handleSort('name');
    });
    expect(result.current.sortDirection).toBe('desc');

    act(() => {
      result.current.handleSort('type');
    });
    expect(result.current.sortDirection).toBe('asc');
  });

  it('does case-insensitive sorting for name', () => {
    const kosWithMixedCase: KnowledgeObject[] = [
      { id: '1', name: 'apple', type: 'saved_search', app: 'app', owner: 'owner', isolated: false },
      { id: '2', name: 'BANANA', type: 'saved_search', app: 'app', owner: 'owner', isolated: false },
      { id: '3', name: 'Cherry', type: 'saved_search', app: 'app', owner: 'owner', isolated: false },
    ];

    const { result } = renderHook(() => useKOSort(kosWithMixedCase));

    expect(result.current.sortedKOs[0].name).toBe('apple');
    expect(result.current.sortedKOs[1].name).toBe('BANANA');
    expect(result.current.sortedKOs[2].name).toBe('Cherry');
  });

  it('handles empty KOs array', () => {
    const { result } = renderHook(() => useKOSort([]));

    expect(result.current.sortedKOs).toHaveLength(0);
  });

  it('does not mutate original array', () => {
    const originalKOs = [...mockKOs];
    const { result } = renderHook(() => useKOSort(mockKOs));

    act(() => {
      result.current.handleSort('name');
    });

    expect(mockKOs).toEqual(originalKOs);
  });

  it('maintains stable sort when values are equal', () => {
    const kosWithDuplicates: KnowledgeObject[] = [
      { id: '1', name: 'Same', type: 'saved_search', app: 'app', owner: 'owner', isolated: false },
      { id: '2', name: 'Same', type: 'saved_search', app: 'app', owner: 'owner', isolated: false },
      { id: '3', name: 'Different', type: 'saved_search', app: 'app', owner: 'owner', isolated: false },
    ];

    const { result } = renderHook(() => useKOSort(kosWithDuplicates));

    const sortedIds = result.current.sortedKOs.map((ko) => ko.id);
    // First two should maintain relative order
    expect(sortedIds.indexOf('3')).toBe(0);
    expect(sortedIds.indexOf('1')).toBeLessThan(sortedIds.indexOf('2'));
  });

  it('exposes current sort state', () => {
    const { result } = renderHook(() => useKOSort(mockKOs));

    expect(result.current.sortBy).toBe('name');
    expect(result.current.sortDirection).toBe('asc');

    act(() => {
      result.current.handleSort('type');
    });

    expect(result.current.sortBy).toBe('type');
    expect(result.current.sortDirection).toBe('asc');
  });
});
