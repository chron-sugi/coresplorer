/**
 * KO Explorer Filter State Store (Zustand)
 *
 * Centralized state for Knowledge Object filters. Provides actions for
 * updating and clearing filters across the application.
 *
 * @module features/ko-explorer/model/store/useFilterStore
 */
import { create } from 'zustand';
import type { FilterState } from '../ko-explorer.types';

interface FilterStoreState extends FilterState {
  setSearchTerm: (term: string) => void;
  setTypes: (types: string[]) => void;
  setApps: (apps: string[]) => void;
  setOwners: (owners: string[]) => void;
  toggleType: (type: string) => void;
  toggleApp: (app: string) => void;
  toggleOwner: (owner: string) => void;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  clearFilters: () => void;
  hasActiveFilters: () => boolean;
}

const initialState: FilterState = {
  searchTerm: '',
  types: [],
  apps: [],
  owners: [],
};

/**
 * Toggles a value in an array (add if not present, remove if present)
 */
function toggleArrayValue(array: string[], value: string): string[] {
  return array.includes(value)
    ? array.filter((v) => v !== value)
    : [...array, value];
}

/**
 * Zustand store for Knowledge Objects filtering
 *
 * Manages filter state including search term, type filters, app filters, and owner filters.
 * Provides actions for updating individual filters or clearing all at once.
 *
 * @returns Filter store instance with state and actions
 */
export const useFilterStore = create<FilterStoreState>((set, get) => ({
  ...initialState,

  setSearchTerm: (term) => set({ searchTerm: term }),

  setTypes: (types) => set({ types }),

  setApps: (apps) => set({ apps }),

  setOwners: (owners) => set({ owners }),

  toggleType: (type) => set((state) => ({ types: toggleArrayValue(state.types, type) })),

  toggleApp: (app) => set((state) => ({ apps: toggleArrayValue(state.apps, app) })),

  toggleOwner: (owner) => set((state) => ({ owners: toggleArrayValue(state.owners, owner) })),

  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    set({ [key]: value }),

  clearFilters: () => set(initialState),

  hasActiveFilters: () => {
    const state = get();
    return (
      state.types.length > 0 ||
      state.apps.length > 0 ||
      state.owners.length > 0
    );
  },
}));
