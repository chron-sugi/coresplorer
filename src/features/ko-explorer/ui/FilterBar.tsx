/**
 * FilterBar Component
 *
 * Filter bar for Knowledge Objects table with search input and structured filters.
 * Includes type chips, app dropdown, owner dropdown, clear button, and inline metrics.
 *
 * @module features/ko-explorer/ui/FilterBar
 */
import { Search } from 'lucide-react';
import { TypeChips } from './TypeChips';
import { AppDropdown } from './AppDropdown';
import { OwnerDropdown } from './OwnerDropdown';
import { ClearFiltersButton } from './ClearFiltersButton';
import type { FilterOptions } from '../lib/deriveFilterOptions';
import type { KnowledgeObject } from '@/entities/knowledge-object';
import { UI_TEXT } from '../model/constants/ko-explorer.constants';

/**
 * Props for the FilterBar component
 */
interface FilterBarProps {
  filterOptions: FilterOptions;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  kos: KnowledgeObject[];
}

/**
 * Filter bar component for Knowledge Objects table
 *
 * Provides structured filters for type, app, and owner with inline metrics.
 * Filters use OR logic within categories and AND logic across categories.
 *
 * @param props - Component props
 * @param props.filterOptions - Available options for each filter category
 * @param props.searchTerm - Current search term
 * @param props.onSearchChange - Callback for search term changes
 * @param props.kos - All knowledge objects for metrics calculation
 * @returns Rendered filter bar
 */
export function FilterBar({
  filterOptions,
  searchTerm,
  onSearchChange,
  kos,
}: FilterBarProps): React.JSX.Element {
  // Calculate metrics
  const totalKOs = kos.length;
  const uniqueApps = new Set(kos.map((ko) => ko.app)).size;

  return (
    <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm py-4 px-6 mb-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Side: Search and Filters */}
          <div className="flex flex-col gap-3">
            {/* Search and Dropdowns */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={UI_TEXT.SEARCH_PLACEHOLDER}
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent transition-all hover:bg-slate-900"
                />
              </div>
              <AppDropdown availableApps={filterOptions.apps} />
              <OwnerDropdown availableOwners={filterOptions.owners} />
              <ClearFiltersButton />
            </div>

            {/* Type Chips */}
            {filterOptions.types.length > 0 && (
              <div className="flex justify-start">
                <TypeChips availableTypes={filterOptions.types} />
              </div>
            )}
          </div>

          {/* Right Side: Metrics Cards */}
          <div className="grid grid-cols-2 gap-3 h-full">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center transition-colors hover:border-slate-700 h-full">
              <div className="text-4xl font-bold text-slate-100 mb-1">{totalKOs}</div>
              <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">Total KOs</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center transition-colors hover:border-slate-700 h-full">
              <div className="text-4xl font-bold text-emerald-400 mb-1">{uniqueApps}</div>
              <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">Apps</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
