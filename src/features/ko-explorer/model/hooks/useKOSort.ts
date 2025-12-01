/**
 * useKOSort Hook
 *
 * Hook for sorting KO data based on store state.
 * Uses Zustand for centralized sort state management.
 *
 * @module features/ko-explorer/model/hooks/useKOSort
 */
import { useMemo } from 'react';
import type { KnowledgeObject } from '@/entities/knowledge-object';
import type { SortColumn, SortDirection } from '../ko-explorer.types';
import { useSortStore } from '../store/useSortStore';

/**
 * Hook for sorting KO data based on store state.
 *
 * Uses Zustand for centralized sort state management instead of local useState.
 * This allows sort state to persist across navigation and be shared with other components.
 */
export function useKOSort(kos: KnowledgeObject[]): {
    sortBy: SortColumn;
    sortDirection: SortDirection;
    handleSort: (column: SortColumn) => void;
    sortedKOs: KnowledgeObject[];
} {
    const sortBy = useSortStore((state) => state.sortBy);
    const sortDirection = useSortStore((state) => state.sortDirection);
    const handleSort = useSortStore((state) => state.handleSort);

    const sortedKOs = useMemo(() => {
        const sorted = [...kos].sort((a, b) => {
            let aValue: string | number;
            let bValue: string | number;

            switch (sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'type':
                    aValue = a.type;
                    bValue = b.type;
                    break;
                case 'app':
                    aValue = a.app;
                    bValue = b.app;
                    break;
                case 'owner':
                    aValue = a.owner;
                    bValue = b.owner;
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [kos, sortBy, sortDirection]);

    return { sortBy, sortDirection, handleSort, sortedKOs };
}
