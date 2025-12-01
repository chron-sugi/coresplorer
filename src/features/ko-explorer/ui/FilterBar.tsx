/**
 * FilterBar Component
 *
 * Filter bar for Knowledge Objects table with search input and structured filters.
 * Includes type chips, app dropdown, owner dropdown, and clear button.
 *
 * @module features/ko-explorer/ui/FilterBar
 */
import { Search } from 'lucide-react';
import type { FilterState } from '../model/ko-explorer.types';
import type { FilterOptions } from '../lib/deriveFilterOptions';
import { UI_TEXT } from '../model/constants/ko-explorer.constants';
import { TypeChips } from './TypeChips';
import { AppDropdown } from './AppDropdown';
import { OwnerDropdown } from './OwnerDropdown';
import { ClearFiltersButton } from './ClearFiltersButton';

/**
 * Props for the FilterBar component
 */
interface FilterBarProps {
  filters: FilterState;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  clearFilters: () => void;
  filterOptions: FilterOptions;
}

/**
 * Filter bar component for Knowledge Objects table
 *
 * Provides search input and structured filters for type, app, and owner.
 * Filters use OR logic within categories and AND logic across categories.
 *
 * @param props - Component props
 * @param props.filters - Current filter state
 * @param props.setFilter - Function to update a specific filter
 * @param props.clearFilters - Function to clear all filters
 * @param props.filterOptions - Available options for each filter category
 * @returns Rendered filter bar
 */
export function FilterBar({
  filters,
  setFilter,
  filterOptions,
}: FilterBarProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 mb-6">
      {/* Search Column */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
        <input
          type="text"
          placeholder={UI_TEXT.SEARCH_PLACEHOLDER}
          value={filters.searchTerm}
          onChange={(e) => setFilter('searchTerm', e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Filters Column */}
      <div className="flex flex-col gap-3">
        {/* Tier 1: Type Chips */}
        {filterOptions.types.length > 0 && (
          <div className="flex justify-start lg:justify-end">
            <TypeChips availableTypes={filterOptions.types} />
          </div>
        )}

        {/* Tier 2: Dropdowns */}
        <div className="flex flex-wrap items-center justify-start lg:justify-end gap-3">
          <AppDropdown availableApps={filterOptions.apps} />
          <OwnerDropdown availableOwners={filterOptions.owners} />
          <ClearFiltersButton />
        </div>
      </div>
    </div>
  );
}
