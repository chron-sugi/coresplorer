/**
 * KO Explorer Feature
 *
 * Public API for the Knowledge Objects Explorer feature.
 * Provides components, hooks, and types for browsing and filtering KOs.
 *
 * @module features/ko-explorer
 */

// =============================================================================
// UI COMPONENTS
// =============================================================================

export { FilterBar } from './ui/FilterBar';
export { KOTable } from './ui/KOTable';
export { SummaryStrip } from './ui/SummaryStrip';

// =============================================================================
// API / QUERIES (re-exported from entity for backward compatibility)
// =============================================================================

export { useKOIndexQuery, useKOListQuery, koQueryKeys } from '@/entities/knowledge-object';

// =============================================================================
// HOOKS
// =============================================================================

export { useKOData } from './model/hooks/useKOData';
export { useKOFilters } from './model/hooks/useKOFilters';
export { useKOSort } from './model/hooks/useKOSort';

// =============================================================================
// LIB / UTILITIES
// =============================================================================

export { deriveFilterOptions, type FilterOptions } from './lib/deriveFilterOptions';

// =============================================================================
// STORES
// =============================================================================

export { useFilterStore } from './model/store/useFilterStore';
export { useSortStore } from './model/store/useSortStore';

// =============================================================================
// TYPES
// =============================================================================

// Note: KnowledgeObject is in @/entities/knowledge-object
export type { FilterState, SortColumn, SortDirection } from './model/ko-explorer.types';

// =============================================================================
// VARIANTS (deprecated - use @/entities/knowledge-object instead)
// =============================================================================

/** @deprecated Use getKoBadgeClasses from @/entities/knowledge-object */
export { koTypeBadgeVariants, type KOTypeBadgeVariant } from './ko-explorer.variants';
