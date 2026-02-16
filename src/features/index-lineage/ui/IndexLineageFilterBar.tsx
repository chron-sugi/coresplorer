import { memo, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { getKoLabel, isValidKoType, type SplunkKoType } from '@/entities/knowledge-object';
import { matchesNormalized } from '@/shared/lib';
import { Checkbox } from '@/shared/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group';
import type { LineageFilterOptions } from '../lib/lineage-filters';
import { GROUP_BY_OPTIONS, type LineageGroupByMode } from '../lib/lineage-grouping';

const dropdownTriggerClass =
  'inline-flex items-center gap-1.5 h-8 px-3 text-sm rounded-md border transition-colors';

interface MultiSelectDropdownProps {
  label: string;
  selectedValues: string[];
  availableValues: string[];
  searchPlaceholder: string;
  emptyMessage: string;
  onToggle: (value: string) => void;
}

const MultiSelectDropdown = memo(function MultiSelectDropdown({
  label,
  selectedValues,
  availableValues,
  searchPlaceholder,
  emptyMessage,
  onToggle,
}: MultiSelectDropdownProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const filteredValues = availableValues.filter((value) => matchesNormalized(value, searchValue));
  const selectedCount = selectedValues.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Filter by ${label}${selectedCount > 0 ? ` (${selectedCount} selected)` : ''}`}
          aria-expanded={open}
          aria-haspopup="listbox"
          className={`${dropdownTriggerClass} ${
            selectedCount > 0
              ? 'border-sky-500 bg-sky-600/20 text-sky-300'
              : 'border-border bg-muted text-foreground hover:bg-accent hover:text-foreground'
          }`}
        >
          {label}
          {selectedCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs rounded bg-sky-600 text-white">
              {selectedCount}
            </span>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <div className="p-2 border-b border-border">
          <input
            type="text"
            placeholder={searchPlaceholder}
            aria-label={`Search ${label.toLowerCase()} filters`}
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            className="w-full px-2 py-1.5 text-sm bg-muted border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
        <div className="max-h-60 overflow-y-auto p-2" role="listbox" aria-label={`Available ${label.toLowerCase()} filters`}>
          {filteredValues.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">{emptyMessage}</div>
          ) : (
            <div className="space-y-1">
              {filteredValues.map((value) => (
                <label
                  key={value}
                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent cursor-pointer"
                >
                  <Checkbox
                    checked={selectedValues.includes(value)}
                    onCheckedChange={() => onToggle(value)}
                    aria-label={`Select ${value}`}
                  />
                  <span className="text-sm text-foreground truncate">{value}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
});

interface GroupByDropdownProps {
  groupBy: LineageGroupByMode;
  onGroupByChange: (mode: LineageGroupByMode) => void;
}

const GroupByDropdown = memo(function GroupByDropdown({
  groupBy,
  onGroupByChange,
}: GroupByDropdownProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const selectedLabel = GROUP_BY_OPTIONS.find((option) => option.value === groupBy)?.label ?? 'Index + Sourcetype + Source';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Group lineage rows"
          aria-expanded={open}
          aria-haspopup="listbox"
          className={`${dropdownTriggerClass} border-border bg-muted text-foreground hover:bg-accent hover:text-foreground`}
        >
          Group By: {selectedLabel}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-1" align="start">
        <div role="listbox" aria-label="Group by options" className="space-y-1">
          {GROUP_BY_OPTIONS.map((option) => {
            const isSelected = option.value === groupBy;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onGroupByChange(option.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between rounded px-3 py-2 text-left text-sm ${
                  isSelected ? 'bg-sky-600/20 text-sky-300' : 'hover:bg-accent text-foreground'
                }`}
              >
                <span>{option.label}</span>
                {isSelected && <Check className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
});

interface IndexLineageFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  totalGroups: number;
  filteredGroups: number;
  filteredPaths: number;
  filterOptions: LineageFilterOptions;
  selectedTypes: string[];
  selectedApps: string[];
  selectedOwners: string[];
  groupBy: LineageGroupByMode;
  onGroupByChange: (mode: LineageGroupByMode) => void;
  onToggleType: (value: string) => void;
  onToggleApp: (value: string) => void;
  onToggleOwner: (value: string) => void;
  onClearStructuredFilters: () => void;
}

export function IndexLineageFilterBar({
  searchTerm,
  onSearchChange,
  totalGroups,
  filteredGroups,
  filteredPaths,
  filterOptions,
  selectedTypes,
  selectedApps,
  selectedOwners,
  groupBy,
  onGroupByChange,
  onToggleType,
  onToggleApp,
  onToggleOwner,
  onClearStructuredFilters,
}: IndexLineageFilterBarProps): React.JSX.Element {
  const hasActiveStructuredFilters =
    selectedTypes.length > 0 || selectedApps.length > 0 || selectedOwners.length > 0;

  const handleTypeValueChange = (values: string[]) => {
    const added = values.find((value) => !selectedTypes.includes(value));
    const removed = selectedTypes.find((value) => !values.includes(value));
    const toggledType = added ?? removed;

    if (toggledType) {
      onToggleType(toggledType);
    }
  };

  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm py-4 px-6 mb-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="index-lineage-search"
                  type="text"
                  placeholder="Search by index, sourcetype, source, KO name, app, owner, type, or path..."
                  value={searchTerm}
                  onChange={(event) => onSearchChange(event.target.value)}
                  className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent transition-all hover:bg-card"
                />
              </div>

              <GroupByDropdown groupBy={groupBy} onGroupByChange={onGroupByChange} />

              <MultiSelectDropdown
                label="App"
                availableValues={filterOptions.apps}
                selectedValues={selectedApps}
                onToggle={onToggleApp}
                searchPlaceholder="Search apps..."
                emptyMessage="No apps found"
              />
              <MultiSelectDropdown
                label="Owner"
                availableValues={filterOptions.owners}
                selectedValues={selectedOwners}
                onToggle={onToggleOwner}
                searchPlaceholder="Search owners..."
                emptyMessage="No owners found"
              />
              {hasActiveStructuredFilters && (
                <button
                  type="button"
                  onClick={onClearStructuredFilters}
                  aria-label="Clear lineage KO filters"
                  className={`${dropdownTriggerClass} border-border bg-muted text-foreground hover:bg-accent hover:text-foreground`}
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </button>
              )}
            </div>

            {filterOptions.types.length > 0 && (
              <div className="flex justify-start">
                <ToggleGroup
                  type="multiple"
                  value={selectedTypes}
                  onValueChange={handleTypeValueChange}
                  className="flex-wrap gap-3"
                >
                  {filterOptions.types.map((type) => (
                    <ToggleGroupItem key={type} value={type} aria-label={`Filter by ${type}`}>
                      {isValidKoType(type) ? getKoLabel(type as SplunkKoType) : type}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 h-full">
            <div className="bg-card border border-border rounded-lg p-4 flex flex-col items-center justify-center transition-colors hover:border-accent h-full">
              <div className="text-4xl font-bold text-foreground mb-1">{filteredGroups}</div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                Matching Groups / {totalGroups}
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 flex flex-col items-center justify-center transition-colors hover:border-accent h-full">
              <div className="text-4xl font-bold text-foreground mb-1">{filteredPaths}</div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Matching Paths</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 flex flex-col items-center justify-center transition-colors hover:border-accent h-full">
              <div className="text-4xl font-bold text-foreground mb-1">
                {selectedTypes.length + selectedApps.length + selectedOwners.length}
              </div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Active KO Filters</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
