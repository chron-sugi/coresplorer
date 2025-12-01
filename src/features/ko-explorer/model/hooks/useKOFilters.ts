/**
 * useKOFilters Hook
 *
 * Hook for filtering KO data based on store state.
 * Uses Zustand for centralized filter state management.
 *
 * @module features/ko-explorer/model/hooks/useKOFilters
 */
import { useMemo } from 'react';
import type { KnowledgeObject } from '@/entities/knowledge-object';
import type { FilterState } from '../ko-explorer.types';
import { useFilterStore } from '../store/useFilterStore';
import { useFilterUrlSync } from './useFilterUrlSync';

/**
 * Hook for filtering KO data based on store state.
 *
 * Uses Zustand for centralized filter state management instead of local useState.
 * This allows filter state to persist across navigation and be shared with other components.
 * Automatically syncs filter state with URL parameters.
 */
export function useKOFilters(kos: KnowledgeObject[]): {
    filters: FilterState;
    setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
    clearFilters: () => void;
    filteredKOs: KnowledgeObject[];
    hasActiveFilters: boolean;
} {
    // Sync filters with URL
    useFilterUrlSync();

    // Use individual selectors to avoid unnecessary re-renders
    const searchTerm = useFilterStore((state) => state.searchTerm);
    const types = useFilterStore((state) => state.types);
    const apps = useFilterStore((state) => state.apps);
    const owners = useFilterStore((state) => state.owners);
    const setFilter = useFilterStore((state) => state.setFilter);
    const clearFilters = useFilterStore((state) => state.clearFilters);
    const hasActiveFilters = useFilterStore((state) => state.hasActiveFilters)();

    // Memoize the filters object to maintain stable reference
    const filters = useMemo<FilterState>(() => ({
        searchTerm,
        types,
        apps,
        owners,
    }), [searchTerm, types, apps, owners]);

    const filteredKOs = useMemo(() => {
        return kos.filter(ko => {
            // Search term filter
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                const matchesSearch =
                    ko.name?.toLowerCase().includes(searchLower) ||
                    ko.id?.toLowerCase().includes(searchLower) ||
                    ko.app?.toLowerCase().includes(searchLower) ||
                    ko.owner?.toLowerCase().includes(searchLower);
                if (!matchesSearch) return false;
            }

            // Type filter (OR within category)
            if (types.length > 0 && !types.includes(ko.type)) {
                return false;
            }

            // App filter (OR within category)
            if (apps.length > 0 && !apps.includes(ko.app)) {
                return false;
            }

            // Owner filter (OR within category)
            if (owners.length > 0 && !owners.includes(ko.owner)) {
                return false;
            }

            return true;
        });
    }, [kos, searchTerm, types, apps, owners]);

    return { filters, setFilter, clearFilters, filteredKOs, hasActiveFilters };
}
