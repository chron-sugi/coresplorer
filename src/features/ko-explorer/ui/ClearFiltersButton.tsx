/**
 * ClearFiltersButton Component
 *
 * Button to reset all filters. Only visible when filters are active.
 *
 * @module features/ko-explorer/ui/ClearFiltersButton
 */
import { X } from 'lucide-react';
import { useFilterStore } from '../model/store/useFilterStore';
import { dropdownTriggerVariants } from '../ko-explorer.variants';

/**
 * Button to clear all active filters.
 *
 * Only renders when at least one filter (type, app, or owner) is active.
 * Clicking clears all filter selections.
 */
export function ClearFiltersButton(): React.JSX.Element | null {
  const hasActiveFilters = useFilterStore((state) => state.hasActiveFilters)();
  const clearFilters = useFilterStore((state) => state.clearFilters);

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={clearFilters}
      aria-label="Clear all filters"
      className={dropdownTriggerVariants({ state: "inactive" })}
    >
      <X className="h-3.5 w-3.5" />
      Clear
    </button>
  );
}
