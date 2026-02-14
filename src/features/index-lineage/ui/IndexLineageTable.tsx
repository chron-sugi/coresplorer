import { ArrowDown, ArrowUp, Network } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { IndexLineageRecord } from '@/entities/index-lineage';
import { Button } from '@/shared/ui/button';
import { encodeUrlParam } from '@/shared/lib';
import { cn } from '@/shared/lib/utils';

export type IndexLineageSortColumn =
  | 'index'
  | 'sourcetype'
  | 'source'
  | 'direct'
  | 'transitive'
  | 'terminal'
  | 'depth';

interface IndexLineageTableProps {
  records: IndexLineageRecord[];
  loading: boolean;
  error: string | null;
  selectedLineageKey: string | null;
  sortBy: IndexLineageSortColumn;
  sortDirection: 'asc' | 'desc';
  onSort: (column: IndexLineageSortColumn) => void;
  onSelectLineageKey: (lineageKey: string) => void;
}

interface SortableHeaderProps {
  label: string;
  column: IndexLineageSortColumn;
  sortBy: IndexLineageSortColumn;
  sortDirection: 'asc' | 'desc';
  onSort: (column: IndexLineageSortColumn) => void;
  className?: string;
}

function SortableHeader({
  label,
  column,
  sortBy,
  sortDirection,
  onSort,
  className,
}: SortableHeaderProps) {
  const isSelected = sortBy === column;

  return (
    <button
      type="button"
      onClick={() => onSort(column)}
      className={cn(
        'text-left text-sm font-bold text-muted-foreground uppercase tracking-wider hover:text-foreground flex items-center gap-1',
        className
      )}
    >
      {label}
      {isSelected && (sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
    </button>
  );
}

export function IndexLineageTable({
  records,
  loading,
  error,
  selectedLineageKey,
  sortBy,
  sortDirection,
  onSort,
  onSelectLineageKey,
}: IndexLineageTableProps): React.JSX.Element {
  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <div className="text-muted-foreground text-sm">Loading index lineage...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
      <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-muted/50 border-b border-border">
        <SortableHeader label="Index" column="index" sortBy={sortBy} sortDirection={sortDirection} onSort={onSort} className="col-span-2" />
        <SortableHeader label="Sourcetype" column="sourcetype" sortBy={sortBy} sortDirection={sortDirection} onSort={onSort} className="col-span-2" />
        <SortableHeader label="Source" column="source" sortBy={sortBy} sortDirection={sortDirection} onSort={onSort} className="col-span-2" />
        <SortableHeader label="Direct" column="direct" sortBy={sortBy} sortDirection={sortDirection} onSort={onSort} className="col-span-1" />
        <SortableHeader label="Transitive" column="transitive" sortBy={sortBy} sortDirection={sortDirection} onSort={onSort} className="col-span-1" />
        <SortableHeader label="Terminals" column="terminal" sortBy={sortBy} sortDirection={sortDirection} onSort={onSort} className="col-span-1" />
        <SortableHeader label="Max Depth" column="depth" sortBy={sortBy} sortDirection={sortDirection} onSort={onSort} className="col-span-1" />
        <div className="col-span-2 text-left text-sm font-bold text-muted-foreground uppercase tracking-wider">
          Actions
        </div>
      </div>

      {records.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground text-sm">No lineage rows match the current search.</div>
      ) : (
        records.map((record) => (
          <div
            key={record.lineage_key}
            onClick={() => onSelectLineageKey(record.lineage_key)}
            className={cn(
              'w-full grid grid-cols-12 gap-3 px-4 py-3 border-b border-border hover:bg-accent/50 transition-colors text-left cursor-pointer',
              selectedLineageKey === record.lineage_key && 'bg-sky-500/10'
            )}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelectLineageKey(record.lineage_key);
              }
            }}
          >
            <div className="col-span-2 text-sm text-foreground font-medium truncate" title={record.index_id}>
              {record.index_label}
            </div>
            <div className="col-span-2 text-sm text-foreground truncate" title={record.sourcetype}>
              {record.sourcetype}
            </div>
            <div className="col-span-2 text-sm text-muted-foreground truncate" title={record.source}>
              {record.source}
            </div>
            <div className="col-span-1 text-sm text-foreground">{record.direct_dependent_count}</div>
            <div className="col-span-1 text-sm text-foreground">{record.transitive_dependent_count}</div>
            <div className="col-span-1 text-sm text-foreground">{record.terminal_count}</div>
            <div className="col-span-1 text-sm text-foreground">{record.max_depth}</div>
            <div className="col-span-2 flex items-center justify-start" onClick={(event) => event.stopPropagation()}>
              <Button asChild variant="ghost" size="sm" className="h-8">
                <Link to={`/diagram/${encodeUrlParam(record.index_id)}`} title="Open index in dependency map">
                  <Network className="mr-2 h-4 w-4" />
                  Diagram
                </Link>
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
