import { Download, Search } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

interface IndexLineageFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  totalRecords: number;
  filteredRecords: number;
  filteredPaths: number;
  onExportCsv: () => void;
}

export function IndexLineageFilterBar({
  searchTerm,
  onSearchChange,
  totalRecords,
  filteredRecords,
  filteredPaths,
  onExportCsv,
}: IndexLineageFilterBarProps): React.JSX.Element {
  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm py-4 px-6 mb-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
        <div className="lg:col-span-2 space-y-2">
          <label htmlFor="index-lineage-search" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Search Index, Source, Sourcetype, Paths
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="index-lineage-search"
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search index lineage..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex items-end justify-end gap-2">
          <Button type="button" variant="outline" onClick={onExportCsv} className="whitespace-nowrap">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-lg px-4 py-3">
            <div className="text-2xl font-bold text-foreground">{filteredRecords}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Matching Keys / {totalRecords} Total
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg px-4 py-3">
            <div className="text-2xl font-bold text-foreground">{filteredPaths}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Matching Paths</div>
          </div>
          <div className="bg-card border border-border rounded-lg px-4 py-3">
            <div className="text-2xl font-bold text-foreground">{searchTerm.trim() ? 'Filtered' : 'All'}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Scope</div>
          </div>
        </div>
      </div>
    </div>
  );
}

