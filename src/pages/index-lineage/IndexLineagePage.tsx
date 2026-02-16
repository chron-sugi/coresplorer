/**
 * Index Lineage Page
 *
 * Route: /index-lineage
 *
 * @module pages/index-lineage/IndexLineagePage
 */
import { useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { useIndexLineageQuery } from '@/entities/index-lineage';
import { useKOListQuery } from '@/entities/knowledge-object';
import { Layout } from '@/widgets/layout';
import { SearchCommand } from '@/widgets/header';
import { Button } from '@/shared/ui/button';
import {
  IndexLineageFilterBar,
  IndexLineageTable,
  LineagePathPanel,
  buildFlattenedLineageCsv,
  downloadCsv,
  type IndexLineageSortColumn,
} from '@/features/index-lineage';
import {
  buildLineageRecordContexts,
  deriveLineageFilterOptions,
  matchesLineageKoFilters,
  matchesLineageSearch,
} from '@/features/index-lineage/lib/lineage-filters';
import {
  groupLineageRows,
  type GroupedLineageRow,
  type LineageGroupByMode,
} from '@/features/index-lineage/lib/lineage-grouping';

function compareStrings(a: string, b: string): number {
  return a.localeCompare(b);
}

function toggleArrayValue(values: string[], nextValue: string): string[] {
  return values.includes(nextValue)
    ? values.filter((value) => value !== nextValue)
    : [...values, nextValue];
}

function sortRows(
  rows: GroupedLineageRow[],
  sortBy: IndexLineageSortColumn,
  sortDirection: 'asc' | 'desc'
): GroupedLineageRow[] {
  const sorted = [...rows].sort((a, b) => {
    switch (sortBy) {
      case 'index':
        return compareStrings(a.index_id, b.index_id);
      case 'sourcetype':
        return compareStrings(a.sourcetype, b.sourcetype);
      case 'source':
        return compareStrings(a.source, b.source);
      case 'direct':
        return a.direct_dependent_count - b.direct_dependent_count;
      case 'transitive':
        return a.transitive_dependent_count - b.transitive_dependent_count;
      case 'terminal':
        return a.terminal_count - b.terminal_count;
      case 'depth':
        return a.max_depth - b.max_depth;
      default:
        return 0;
    }
  });

  return sortDirection === 'asc' ? sorted : sorted.reverse();
}

export function IndexLineagePage(): React.JSX.Element {
  const { data, isLoading, error } = useIndexLineageQuery();
  const { data: koList = [] } = useKOListQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<IndexLineageSortColumn>('index');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [groupBy, setGroupBy] = useState<LineageGroupByMode>('index+sourcetype+source');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);

  const records = data?.records ?? [];
  const errorMessage = error ? (error instanceof Error ? error.message : 'Unknown error') : null;

  const koById = useMemo(
    () => new Map(koList.map((ko) => [ko.id, ko])),
    [koList]
  );

  const lineageRecordContexts = useMemo(
    () => buildLineageRecordContexts(data?.paths ?? [], koById),
    [data?.paths, koById]
  );

  const groupedData = useMemo(
    () => groupLineageRows(records, lineageRecordContexts, groupBy),
    [groupBy, lineageRecordContexts, records]
  );

  const groupedRows = groupedData.rows;
  const contextsByGroupKey = groupedData.contextsByGroupKey;

  const filterOptions = useMemo(
    () => deriveLineageFilterOptions(contextsByGroupKey),
    [contextsByGroupKey]
  );

  const filteredRows = useMemo(
    () =>
      groupedRows.filter((row) => {
        const context = contextsByGroupKey.get(row.group_key);
        const passesKoFilters = matchesLineageKoFilters(context, {
          types: selectedTypes,
          apps: selectedApps,
          owners: selectedOwners,
        });

        if (!passesKoFilters) {
          return false;
        }

        return matchesLineageSearch(row, context, searchTerm);
      }),
    [contextsByGroupKey, groupedRows, searchTerm, selectedApps, selectedOwners, selectedTypes]
  );

  const sortedRows = useMemo(
    () => sortRows(filteredRows, sortBy, sortDirection),
    [filteredRows, sortBy, sortDirection]
  );

  useEffect(() => {
    if (sortedRows.length === 0) {
      setSelectedGroupKey(null);
      return;
    }

    const stillExists = selectedGroupKey
      ? sortedRows.some((row) => row.group_key === selectedGroupKey)
      : false;

    if (!stillExists) {
      setSelectedGroupKey(sortedRows[0].group_key);
    }
  }, [selectedGroupKey, sortedRows]);

  const filteredPathsCount = useMemo(
    () =>
      sortedRows.reduce(
        (total, row) => total + (contextsByGroupKey.get(row.group_key)?.paths.length ?? 0),
        0
      ),
    [contextsByGroupKey, sortedRows]
  );

  const selectedRow = useMemo(
    () => sortedRows.find((row) => row.group_key === selectedGroupKey) ?? null,
    [selectedGroupKey, sortedRows]
  );

  const selectedPaths = useMemo(
    () => (selectedGroupKey ? contextsByGroupKey.get(selectedGroupKey)?.paths ?? [] : []),
    [contextsByGroupKey, selectedGroupKey]
  );

  const handleSort = (column: IndexLineageSortColumn) => {
    if (sortBy === column) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortBy(column);
    setSortDirection('asc');
  };

  const handleExportCsv = () => {
    const csvContent = buildFlattenedLineageCsv(sortedRows, contextsByGroupKey);
    const dateStamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`index-lineage-${dateStamp}.csv`, csvContent);
  };

  const handleToggleType = (type: string) => {
    setSelectedTypes((values) => toggleArrayValue(values, type));
  };

  const handleToggleApp = (app: string) => {
    setSelectedApps((values) => toggleArrayValue(values, app));
  };

  const handleToggleOwner = (owner: string) => {
    setSelectedOwners((values) => toggleArrayValue(values, owner));
  };

  const handleClearStructuredFilters = () => {
    setSelectedTypes([]);
    setSelectedApps([]);
    setSelectedOwners([]);
  };

  return (
    <Layout searchComponent={<SearchCommand />}>
      <div className="bg-background min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          <IndexLineageFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            totalGroups={groupedRows.length}
            filteredGroups={sortedRows.length}
            filteredPaths={filteredPathsCount}
            filterOptions={filterOptions}
            selectedTypes={selectedTypes}
            selectedApps={selectedApps}
            selectedOwners={selectedOwners}
            groupBy={groupBy}
            onGroupByChange={setGroupBy}
            onToggleType={handleToggleType}
            onToggleApp={handleToggleApp}
            onToggleOwner={handleToggleOwner}
            onClearStructuredFilters={handleClearStructuredFilters}
          />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pb-6">
            <div className="xl:col-span-2 space-y-3">
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleExportCsv}
                  className="whitespace-nowrap"
                  disabled={sortedRows.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
              <IndexLineageTable
                records={sortedRows}
                loading={isLoading}
                error={errorMessage}
                selectedGroupKey={selectedGroupKey}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={handleSort}
                onSelectGroupKey={setSelectedGroupKey}
              />
            </div>
            <div className="xl:col-span-1">
              <LineagePathPanel selectedRecord={selectedRow} paths={selectedPaths} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
