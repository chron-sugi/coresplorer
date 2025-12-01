/**
 * KO Explorer Feature Types
 *
 * UI-specific types for the Knowledge Object Explorer feature.
 * For domain entity types, import from @/entities/knowledge-object.
 *
 * @module features/ko-explorer/model/ko-explorer.types
 */

// Feature-specific UI types
export interface FilterState {
  searchTerm: string;
  types: string[];
  apps: string[];
  owners: string[];
}

export type SortColumn = 'name' | 'type' | 'app' | 'owner';

export type { SortDirection } from '@/types';
