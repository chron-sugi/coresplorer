/**
 * AppDropdown Component
 *
 * Searchable multi-select dropdown for filtering by App.
 * Uses Radix UI Popover and Checkbox for accessible selection.
 *
 * @module features/ko-explorer/ui/AppDropdown
 */
import { useState, memo } from 'react';
import { ChevronDown } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/ui/popover';
import { Checkbox } from '@/shared/ui/checkbox';
import { useFilterStore } from '../model/store/useFilterStore';
import { matchesNormalized } from '@/shared/lib/normalizeSearch';
import { dropdownTriggerVariants } from '../ko-explorer.variants';

interface AppDropdownProps {
  availableApps: string[];
}

/**
 * Searchable multi-select dropdown for filtering by app.
 *
 * Features:
 * - Search input to filter options
 * - Checkbox list for multi-select
 * - Immediate state updates
 *
 * @param props - Component props
 * @param props.availableApps - Array of available app values
 */
export const AppDropdown = memo(function AppDropdown({ availableApps }: AppDropdownProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedApps = useFilterStore((state) => state.apps);
  const toggleApp = useFilterStore((state) => state.toggleApp);

  const filteredApps = availableApps.filter((app) =>
    matchesNormalized(app, search)
  );

  const selectedCount = selectedApps.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Filter by App${selectedCount > 0 ? ` (${selectedCount} selected)` : ''}`}
          aria-expanded={open}
          aria-haspopup="listbox"
          className={dropdownTriggerVariants({ state: selectedCount > 0 ? 'active' : 'inactive' })}
        >
          App
          {selectedCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs rounded bg-sky-600 text-white">
              {selectedCount}
            </span>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <div className="p-2 border-b border-slate-700">
          <input
            type="text"
            placeholder="Search apps..."
            aria-label="Search available apps"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-2 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
        <div className="max-h-60 overflow-y-auto p-2" role="listbox" aria-label="Available apps">
          {filteredApps.length === 0 ? (
            <div className="py-4 text-center text-sm text-slate-500">
              No apps found
            </div>
          ) : (
            <div className="space-y-1">
              {filteredApps.map((app) => (
                <label
                  key={app}
                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-800 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedApps.includes(app)}
                    onCheckedChange={() => toggleApp(app)}
                    aria-label={`Select ${app}`}
                  />
                  <span className="text-sm text-slate-200 truncate">{app}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
});
