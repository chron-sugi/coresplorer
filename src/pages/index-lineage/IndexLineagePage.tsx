/**
 * Index Lineage Page
 *
 * Route: /index-lineage
 *
 * @module pages/index-lineage/IndexLineagePage
 */
import { useEffect, useMemo, useState } from 'react';
import { useIndexLineageQuery } from '@/entities/index-lineage';
import { Layout } from '@/widgets/layout';
import {
  IndexLineageFilterBar,
  IndexLineageTable,
  LineagePathPanel,
  buildFlattenedLineageCsv,
  downloadCsv,
  type IndexLineageSortColumn,
} from '@/features/index-lineage';
import { matchesNormalized } from '@/shared/lib';

function compareStrings(a: string, b: string): number {
  return a.localeCompare(b);
}

export function IndexLineagePage(): React.JSX.Element {
  const { data, isLoading, error } = useIndexLineageQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLineageKey, setSelectedLineageKey] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<IndexLineageSortColumn>('index');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const records = data?.records ?? [];
  const paths = data?.paths ?? [];

  const errorMessage = error ? (error instanceof Error ? error.message : 'Unknown error') : null;

  const pathsByLineageKey = useMemo(() => {
    const grouped = new Map<string, typeof paths>();
    paths.forEach((lineagePath) => {
      const existing = grouped.get(lineagePath.lineage_key) ?? [];
      existing.push(lineagePath);
      grouped.set(lineagePath.lineage_key, existing);
    });
    return grouped;
  }, [paths]);

  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) {
      return records;
    }

    return records.filter((record) => {
      const recordMatch = [
        record.lineage_key,
        record.index_id,
        record.index_label,
        record.sourcetype,
        record.source,
      ].some((field) => matchesNormalized(field, searchTerm));

      if (recordMatch) {
        return true;
      }

      const keyPaths = pathsByLineageKey.get(record.lineage_key) ?? [];
      return keyPaths.some((lineagePath) => {
        const pathText = lineagePath.path_node_ids.join(' -> ');
        return [
          lineagePath.source_object_id,
          lineagePath.source_object_type,
          lineagePath.terminal_object_id,
          lineagePath.terminal_object_type,
          pathText,
        ].some((field) => matchesNormalized(field, searchTerm));
      });
    });
  }, [records, pathsByLineageKey, searchTerm]);

  const sortedRecords = useMemo(() => {
    const sorted = [...filteredRecords].sort((a, b) => {
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
  }, [filteredRecords, sortBy, sortDirection]);

  useEffect(() => {
    if (sortedRecords.length === 0) {
      setSelectedLineageKey(null);
      return;
    }

    const stillExists = selectedLineageKey
      ? sortedRecords.some((record) => record.lineage_key === selectedLineageKey)
      : false;

    if (!stillExists) {
      setSelectedLineageKey(sortedRecords[0].lineage_key);
    }
  }, [selectedLineageKey, sortedRecords]);

  const filteredPathsCount = useMemo(
    () => sortedRecords.reduce((total, record) => total + (pathsByLineageKey.get(record.lineage_key)?.length ?? 0), 0),
    [pathsByLineageKey, sortedRecords]
  );

  const selectedRecord = useMemo(
    () => sortedRecords.find((record) => record.lineage_key === selectedLineageKey) ?? null,
    [selectedLineageKey, sortedRecords]
  );

  const selectedPaths = useMemo(
    () => (selectedLineageKey ? pathsByLineageKey.get(selectedLineageKey) ?? [] : []),
    [pathsByLineageKey, selectedLineageKey]
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
    const csvContent = buildFlattenedLineageCsv(sortedRecords, paths);
    const dateStamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`index-lineage-${dateStamp}.csv`, csvContent);
  };

  return (
    <Layout>
      <div className="bg-background min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          <IndexLineageFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            totalRecords={records.length}
            filteredRecords={sortedRecords.length}
            filteredPaths={filteredPathsCount}
            onExportCsv={handleExportCsv}
          />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pb-6">
            <div className="xl:col-span-2">
              <IndexLineageTable
                records={sortedRecords}
                loading={isLoading}
                error={errorMessage}
                selectedLineageKey={selectedLineageKey}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={handleSort}
                onSelectLineageKey={setSelectedLineageKey}
              />
            </div>
            <div className="xl:col-span-1">
              <LineagePathPanel selectedRecord={selectedRecord} paths={selectedPaths} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

