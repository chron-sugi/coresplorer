import { ArrowDown, ArrowUp } from 'lucide-react';
import type { GroupedLineageRow } from '../lib/lineage-grouping';
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
  records: GroupedLineageRow[];
  loading: boolean;
  error: string | null;
  selectedGroupKey: string | null;
  sortBy: IndexLineageSortColumn;
  sortDirection: 'asc' | 'desc';
  onSort: (column: IndexLineageSortColumn) => void;
  onSelectGroupKey: (groupKey: string) => void;
}

interface SortableHeaderProps {
  labelTop: string;
  labelBottom?: string;
  column: IndexLineageSortColumn;
  sortBy: IndexLineageSortColumn;
  sortDirection: 'asc' | 'desc';
  onSort: (column: IndexLineageSortColumn) => void;
  className?: string;
}

function SortableHeader({
  labelTop,
  labelBottom,
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
        'text-left text-[12px] font-bold text-muted-foreground uppercase tracking-wider hover:text-foreground flex items-center gap-1',
        className
      )}
    >
      <span className="flex flex-col leading-4">
        <span>{labelTop}</span>
        <span>{labelBottom ?? '\u00A0'}</span>
      </span>
      {isSelected && (sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
    </button>
  );
}

export function IndexLineageTable({
  records,
  loading,
  error,
  selectedGroupKey,
  sortBy,
  sortDirection,
  onSort,
  onSelectGroupKey,
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
    <div className="bg-card border border-border rounded-lg shadow-sm overflow-x-auto">
      <div className="min-w-[920px]">
        <div className="grid grid-cols-10 gap-3 px-4 py-3 bg-muted/50 border-b border-border">
          <SortableHeader labelTop="Index" column="index" sortBy={sortBy} sortDirection={sortDirection} onSort={onSort} className="col-span-2" />
          <SortableHeader labelTop="Sourcetype" column="sourcetype" sortBy={sortBy} sortDirection={sortDirection} onSort={onSort} className="col-span-2" />
          <SortableHeader labelTop="Source" column="source" sortBy={sortBy} sortDirection={sortDirection} onSort={onSort} className="col-span-1" />
          <SortableHeader labelTop="Direct" labelBottom="Deps" column="direct" sortBy={sortBy} sortDirection={sortDirection} onSort={onSort} className="col-span-1" />
          <SortableHeader labelTop="Transitive" labelBottom="Deps" column="transitive" sortBy={sortBy} sortDirection={sortDirection} onSort={onSort} className="col-span-1" />
          <SortableHeader labelTop="Terminal" labelBottom="Count" column="terminal" sortBy={sortBy} sortDirection={sortDirection} onSort={onSort} className="col-span-1" />
          <SortableHeader labelTop="Max" labelBottom="Depth" column="depth" sortBy={sortBy} sortDirection={sortDirection} onSort={onSort} className="col-span-2" />
        </div>

        {records.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No lineage rows match the current search.</div>
        ) : (
          records.map((record) => (
            <div
              key={record.group_key}
              onClick={() => onSelectGroupKey(record.group_key)}
              className={cn(
                'w-full grid grid-cols-10 gap-3 px-4 py-3 border-b border-border hover:bg-accent/50 transition-colors text-left cursor-pointer',
                selectedGroupKey === record.group_key && 'bg-sky-500/10'
              )}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelectGroupKey(record.group_key);
                }
              }}
            >
              <div className="col-span-2 text-sm text-foreground font-medium truncate" title={record.index_id}>
                {record.index_label}
              </div>
              <div className="col-span-2 text-sm text-foreground truncate" title={record.sourcetype}>
                {record.sourcetype}
              </div>
              <div className="col-span-1 text-sm text-muted-foreground truncate" title={record.source}>
                {record.source}
              </div>
              <div className="col-span-1 text-sm text-foreground">{record.direct_dependent_count}</div>
              <div className="col-span-1 text-sm text-foreground">{record.transitive_dependent_count}</div>
              <div className="col-span-1 text-sm text-foreground">{record.terminal_count}</div>
              <div className="col-span-2 text-sm text-foreground">{record.max_depth}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
