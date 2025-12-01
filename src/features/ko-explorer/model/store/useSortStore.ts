/**
 * KO Explorer Sort State Store (Zustand)
 *
 * Centralized state for Knowledge Object table sorting. Provides actions for
 * updating sort column and direction.
 *
 * @module features/ko-explorer/model/store/useSortStore
 */
import { create } from 'zustand';
import type { SortColumn, SortDirection } from '../ko-explorer.types';

interface SortStoreState {
  sortBy: SortColumn;
  sortDirection: SortDirection;
  setSortBy: (column: SortColumn) => void;
  setSortDirection: (direction: SortDirection) => void;
  toggleDirection: () => void;
  handleSort: (column: SortColumn) => void;
  reset: () => void;
}

const initialState = {
  sortBy: 'name' as const,
  sortDirection: 'asc' as const,
};

/**
 * Zustand store for Knowledge Objects table sorting
 * 
 * Manages sort column and direction state with actions for toggling
 * and updating. Provides centralized sort state that persists across
 * navigation and component unmounts.
 * 
 * @returns Sort store instance with state and actions
 */
export const useSortStore = create<SortStoreState>((set) => ({
  ...initialState,

  setSortBy: (column) => set({ sortBy: column }),

  setSortDirection: (direction) => set({ sortDirection: direction }),

  toggleDirection: () =>
    set((state) => ({
      sortDirection: state.sortDirection === 'asc' ? 'desc' : 'asc',
    })),

  handleSort: (column) =>
    set((state) => ({
      sortBy: column,
      sortDirection: state.sortBy === column ? (state.sortDirection === 'asc' ? 'desc' : 'asc') : 'asc',
    })),

  reset: () => set(initialState),
}));
