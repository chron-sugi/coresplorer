/**
 * useFilterUrlSync Hook Tests
 *
 * Tests for the useFilterUrlSync hook that syncs filters with URL.
 *
 * @module features/ko-explorer/model/hooks/useFilterUrlSync.test
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useFilterUrlSync } from './useFilterUrlSync';
import { useFilterStore } from '../store/useFilterStore';

// Wrapper component that provides router context
function createWrapper(initialEntries: string[] = ['/']) {
  return ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="*" element={<>{children}</>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('useFilterUrlSync', () => {
  beforeEach(() => {
    // Reset filter store before each test
    useFilterStore.getState().clearFilters();
  });

  it('reads search param from URL on mount', () => {
    renderHook(() => useFilterUrlSync(), {
      wrapper: createWrapper(['/?q=test']),
    });

    const store = useFilterStore.getState();
    expect(store.searchTerm).toBe('test');
  });

  it('reads type param from URL on mount', () => {
    renderHook(() => useFilterUrlSync(), {
      wrapper: createWrapper(['/?type=saved_search,dashboard']),
    });

    const store = useFilterStore.getState();
    expect(store.types).toEqual(['saved_search', 'dashboard']);
  });

  it('reads app param from URL on mount', () => {
    renderHook(() => useFilterUrlSync(), {
      wrapper: createWrapper(['/?app=search']),
    });

    const store = useFilterStore.getState();
    expect(store.apps).toEqual(['search']);
  });

  it('reads owner param from URL on mount', () => {
    renderHook(() => useFilterUrlSync(), {
      wrapper: createWrapper(['/?owner=admin,user1']),
    });

    const store = useFilterStore.getState();
    expect(store.owners).toEqual(['admin', 'user1']);
  });

  it('reads multiple params from URL on mount', () => {
    renderHook(() => useFilterUrlSync(), {
      wrapper: createWrapper(['/?q=test&type=saved_search&app=search&owner=admin']),
    });

    const store = useFilterStore.getState();
    expect(store.searchTerm).toBe('test');
    expect(store.types).toEqual(['saved_search']);
    expect(store.apps).toEqual(['search']);
    expect(store.owners).toEqual(['admin']);
  });

  it('ignores empty or missing params', () => {
    renderHook(() => useFilterUrlSync(), {
      wrapper: createWrapper(['/']),
    });

    const store = useFilterStore.getState();
    expect(store.searchTerm).toBe('');
    expect(store.types).toEqual([]);
    expect(store.apps).toEqual([]);
    expect(store.owners).toEqual([]);
  });

  it('handles URL encoded values', () => {
    renderHook(() => useFilterUrlSync(), {
      wrapper: createWrapper(['/?q=hello%20world']),
    });

    const store = useFilterStore.getState();
    expect(store.searchTerm).toBe('hello world');
  });

  it('does not initialize URL params twice', () => {
    const { rerender } = renderHook(() => useFilterUrlSync(), {
      wrapper: createWrapper(['/?q=initial']),
    });

    // Change store value
    act(() => {
      useFilterStore.getState().setSearchTerm('changed');
    });

    // Rerender should not reset to URL value
    rerender();

    const store = useFilterStore.getState();
    expect(store.searchTerm).toBe('changed');
  });
});
