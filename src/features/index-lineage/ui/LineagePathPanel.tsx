import type { IndexLineagePath } from '@/entities/index-lineage';
import type { GroupedLineageRow } from '../lib/lineage-grouping';
import { getKoBadgeClasses, getKoLabel } from '@/entities/knowledge-object';

interface LineagePathPanelProps {
  selectedRecord: GroupedLineageRow | null;
  paths: IndexLineagePath[];
}

function formatPath(pathNodeIds: string[]): string {
  return pathNodeIds.join(' -> ');
}

export function LineagePathPanel({ selectedRecord, paths }: LineagePathPanelProps): React.JSX.Element {
  if (!selectedRecord) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-base font-semibold text-foreground mb-2">Lineage Paths</h2>
        <p className="text-sm text-muted-foreground">Select a lineage row to inspect terminal paths and dependency chains.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-foreground">Lineage Paths</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {selectedRecord.index_label} | {selectedRecord.sourcetype} | {selectedRecord.source}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{paths.length} path(s)</p>
      </div>

      {paths.length === 0 ? (
        <p className="text-sm text-muted-foreground">No paths found for this lineage key.</p>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-auto pr-1">
          {paths.map((pathItem, index) => (
            <div key={`${pathItem.lineage_key}-${index}-${pathItem.path_node_ids.join('->')}`} className="border border-border rounded-md p-3 bg-background/60">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className={getKoBadgeClasses(pathItem.source_object_type)}>
                  {getKoLabel(pathItem.source_object_type)}
                </span>
                <span className="text-xs text-muted-foreground">{pathItem.source_object_id}</span>
              </div>

              <div className="text-sm text-foreground font-mono break-all">
                {formatPath(pathItem.path_node_ids)}
              </div>

              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className={getKoBadgeClasses(pathItem.terminal_object_type)}>
                  {getKoLabel(pathItem.terminal_object_type)}
                </span>
                <span className="text-xs text-muted-foreground">{pathItem.terminal_object_id}</span>
                <span className="text-xs text-muted-foreground">depth: {pathItem.path_length}</span>
                {pathItem.cycle_detected && (
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Cycle detected</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
