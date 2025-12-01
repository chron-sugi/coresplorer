import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useFilterStore } from './useFilterStore';

describe('useFilterStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    act(() => {
      useFilterStore.getState().clearFilters();
    });
  });

  describe('initial state', () => {
    it('should have empty searchTerm by default', () => {
      const { result } = renderHook(() => useFilterStore());
      expect(result.current.searchTerm).toBe('');
    });

    it('should have empty types array by default', () => {
      const { result } = renderHook(() => useFilterStore());
      expect(result.current.types).toEqual([]);
    });

    it('should have empty apps array by default', () => {
      const { result } = renderHook(() => useFilterStore());
      expect(result.current.apps).toEqual([]);
    });

    it('should have empty owners array by default', () => {
      const { result } = renderHook(() => useFilterStore());
      expect(result.current.owners).toEqual([]);
    });
  });

  describe('setSearchTerm', () => {
    it('should update searchTerm', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setSearchTerm('test query');
      });

      expect(result.current.searchTerm).toBe('test query');
    });
  });

  describe('setTypes', () => {
    it('should replace types array', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setTypes(['dashboard', 'lookup']);
      });

      expect(result.current.types).toEqual(['dashboard', 'lookup']);
    });
  });

  describe('setApps', () => {
    it('should replace apps array', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setApps(['search', 'security']);
      });

      expect(result.current.apps).toEqual(['search', 'security']);
    });
  });

  describe('setOwners', () => {
    it('should replace owners array', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setOwners(['admin', 'user1']);
      });

      expect(result.current.owners).toEqual(['admin', 'user1']);
    });
  });

  describe('toggleType', () => {
    it('should add type when not present', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.toggleType('dashboard');
      });

      expect(result.current.types).toContain('dashboard');
    });

    it('should remove type when already present', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.toggleType('dashboard');
        result.current.toggleType('dashboard');
      });

      expect(result.current.types).not.toContain('dashboard');
    });

    it('should handle multiple types', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.toggleType('dashboard');
        result.current.toggleType('lookup');
      });

      expect(result.current.types).toEqual(['dashboard', 'lookup']);
    });
  });

  describe('toggleApp', () => {
    it('should add app when not present', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.toggleApp('search');
      });

      expect(result.current.apps).toContain('search');
    });

    it('should remove app when already present', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.toggleApp('search');
        result.current.toggleApp('search');
      });

      expect(result.current.apps).not.toContain('search');
    });
  });

  describe('toggleOwner', () => {
    it('should add owner when not present', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.toggleOwner('admin');
      });

      expect(result.current.owners).toContain('admin');
    });

    it('should remove owner when already present', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.toggleOwner('admin');
        result.current.toggleOwner('admin');
      });

      expect(result.current.owners).not.toContain('admin');
    });
  });

  describe('setFilter', () => {
    it('should update searchTerm via setFilter', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setFilter('searchTerm', 'generic search');
      });

      expect(result.current.searchTerm).toBe('generic search');
    });

    it('should update types via setFilter', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setFilter('types', ['macro']);
      });

      expect(result.current.types).toEqual(['macro']);
    });
  });

  describe('clearFilters', () => {
    it('should reset all filters to initial state', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setSearchTerm('test');
        result.current.setTypes(['dashboard']);
        result.current.setApps(['search']);
        result.current.setOwners(['admin']);
      });

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.searchTerm).toBe('');
      expect(result.current.types).toEqual([]);
      expect(result.current.apps).toEqual([]);
      expect(result.current.owners).toEqual([]);
    });
  });

  describe('hasActiveFilters', () => {
    it('should return false when no filters are active', () => {
      const { result } = renderHook(() => useFilterStore());
      expect(result.current.hasActiveFilters()).toBe(false);
    });

    it('should return true when types filter is active', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.toggleType('dashboard');
      });

      expect(result.current.hasActiveFilters()).toBe(true);
    });

    it('should return true when apps filter is active', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.toggleApp('search');
      });

      expect(result.current.hasActiveFilters()).toBe(true);
    });

    it('should return true when owners filter is active', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.toggleOwner('admin');
      });

      expect(result.current.hasActiveFilters()).toBe(true);
    });

    it('should return false when only searchTerm is set', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setSearchTerm('test query');
      });

      expect(result.current.hasActiveFilters()).toBe(false);
    });
  });

  describe('selector pattern', () => {
    it('should work with selectors', () => {
      const { result } = renderHook(() =>
        useFilterStore((state) => ({
          searchTerm: state.searchTerm,
          setSearchTerm: state.setSearchTerm,
        }))
      );

      act(() => {
        result.current.setSearchTerm('selector test');
      });

      expect(result.current.searchTerm).toBe('selector test');
    });
  });
});
