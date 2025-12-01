import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useSortStore } from './useSortStore';

describe('useSortStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    act(() => {
      useSortStore.getState().reset();
    });
  });

  describe('initial state', () => {
    it('should have sortBy set to "name" by default', () => {
      const { result } = renderHook(() => useSortStore());
      expect(result.current.sortBy).toBe('name');
    });

    it('should have sortDirection set to "asc" by default', () => {
      const { result } = renderHook(() => useSortStore());
      expect(result.current.sortDirection).toBe('asc');
    });
  });

  describe('setSortBy', () => {
    it('should update sortBy column', () => {
      const { result } = renderHook(() => useSortStore());

      act(() => {
        result.current.setSortBy('type');
      });

      expect(result.current.sortBy).toBe('type');
    });

    it('should update to app column', () => {
      const { result } = renderHook(() => useSortStore());

      act(() => {
        result.current.setSortBy('app');
      });

      expect(result.current.sortBy).toBe('app');
    });

    it('should update to owner column', () => {
      const { result } = renderHook(() => useSortStore());

      act(() => {
        result.current.setSortBy('owner');
      });

      expect(result.current.sortBy).toBe('owner');
    });
  });

  describe('setSortDirection', () => {
    it('should update sortDirection to desc', () => {
      const { result } = renderHook(() => useSortStore());

      act(() => {
        result.current.setSortDirection('desc');
      });

      expect(result.current.sortDirection).toBe('desc');
    });

    it('should update sortDirection to asc', () => {
      const { result } = renderHook(() => useSortStore());

      act(() => {
        result.current.setSortDirection('desc');
        result.current.setSortDirection('asc');
      });

      expect(result.current.sortDirection).toBe('asc');
    });
  });

  describe('toggleDirection', () => {
    it('should toggle from asc to desc', () => {
      const { result } = renderHook(() => useSortStore());

      act(() => {
        result.current.toggleDirection();
      });

      expect(result.current.sortDirection).toBe('desc');
    });

    it('should toggle from desc to asc', () => {
      const { result } = renderHook(() => useSortStore());

      act(() => {
        result.current.setSortDirection('desc');
        result.current.toggleDirection();
      });

      expect(result.current.sortDirection).toBe('asc');
    });
  });

  describe('handleSort', () => {
    it('should toggle direction when sorting same column', () => {
      const { result } = renderHook(() => useSortStore());

      // Initial: name, asc
      act(() => {
        result.current.handleSort('name');
      });

      expect(result.current.sortBy).toBe('name');
      expect(result.current.sortDirection).toBe('desc');
    });

    it('should change column and reset to asc when sorting different column', () => {
      const { result } = renderHook(() => useSortStore());

      // First set to desc on name
      act(() => {
        result.current.handleSort('name'); // toggles to desc
      });

      // Now sort by type
      act(() => {
        result.current.handleSort('type');
      });

      expect(result.current.sortBy).toBe('type');
      expect(result.current.sortDirection).toBe('asc');
    });

    it('should toggle through asc -> desc -> asc on same column', () => {
      const { result } = renderHook(() => useSortStore());

      act(() => {
        result.current.handleSort('name'); // asc -> desc
      });
      expect(result.current.sortDirection).toBe('desc');

      act(() => {
        result.current.handleSort('name'); // desc -> asc
      });
      expect(result.current.sortDirection).toBe('asc');
    });
  });

  describe('reset', () => {
    it('should reset sortBy to name', () => {
      const { result } = renderHook(() => useSortStore());

      act(() => {
        result.current.setSortBy('owner');
        result.current.reset();
      });

      expect(result.current.sortBy).toBe('name');
    });

    it('should reset sortDirection to asc', () => {
      const { result } = renderHook(() => useSortStore());

      act(() => {
        result.current.setSortDirection('desc');
        result.current.reset();
      });

      expect(result.current.sortDirection).toBe('asc');
    });

    it('should reset all state after multiple changes', () => {
      const { result } = renderHook(() => useSortStore());

      act(() => {
        result.current.setSortBy('app');
        result.current.setSortDirection('desc');
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.sortBy).toBe('name');
      expect(result.current.sortDirection).toBe('asc');
    });
  });

  describe('selector pattern', () => {
    it('should work with selectors', () => {
      const { result } = renderHook(() =>
        useSortStore((state) => ({
          sortBy: state.sortBy,
          handleSort: state.handleSort,
        }))
      );

      act(() => {
        result.current.handleSort('type');
      });

      expect(result.current.sortBy).toBe('type');
    });
  });
});
