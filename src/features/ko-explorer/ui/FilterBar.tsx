/**
 * FilterBar Component
 *
 * Filter bar for Knowledge Objects table with search input and structured filters.
 * Includes type chips, app dropdown, owner dropdown, and clear button.
 *
 * @module features/ko-explorer/ui/FilterBar
 */
import { Search } from 'lucide-react';
import { TypeChips } from './TypeChips';
import { AppDropdown } from './AppDropdown';
import { OwnerDropdown } from './OwnerDropdown';
import { ClearFiltersButton } from './ClearFiltersButton';
import type { FilterOptions } from '../lib/deriveFilterOptions';
import { UI_TEXT } from '../model/constants/ko-explorer.constants';

/**
 * Props for the FilterBar component
 */
interface FilterBarProps {
  filterOptions: FilterOptions;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

/**
 * Filter bar component for Knowledge Objects table
 *
 * Provides structured filters for type, app, and owner.
 * Filters use OR logic within categories and AND logic across categories.
 *
 * @param props - Component props
 * @param props.filterOptions - Available options for each filter category
 * @param props.searchTerm - Current search term
 * @param props.onSearchChange - Callback for search term changes
 * @returns Rendered filter bar
 */
export function FilterBar({
  filterOptions,
  searchTerm,
  onSearchChange,
}: FilterBarProps): React.JSX.Element {
  return (
    <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm py-4 px-6 mb-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4">
          {/* Top Row: Search and Dropdowns */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={UI_TEXT.SEARCH_PLACEHOLDER}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent transition-all hover:bg-slate-900"
              />
            </div>

            {/* Dropdowns & Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <AppDropdown availableApps={filterOptions.apps} />
              <OwnerDropdown availableOwners={filterOptions.owners} />
              <ClearFiltersButton />
            </div>
          </div>

          {/* Bottom Row: Type Chips */}
          {filterOptions.types.length > 0 && (
            <div className="flex justify-start pt-2 border-t border-slate-800/50">
              <TypeChips availableTypes={filterOptions.types} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
