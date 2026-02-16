/**
 * Index Lineage Feature
 *
 * @module features/index-lineage
 */

export { IndexLineageFilterBar } from './ui/IndexLineageFilterBar';
export { IndexLineageTable, type IndexLineageSortColumn } from './ui/IndexLineageTable';
export { LineagePathPanel } from './ui/LineagePathPanel';

export { buildFlattenedLineageCsv, downloadCsv } from './lib/export-csv';
export {
  buildLineageRecordContexts,
  deriveLineageFilterOptions,
  matchesLineageKoFilters,
  matchesLineageSearch,
  type LineageFilterOptions,
} from './lib/lineage-filters';
export {
  groupLineageRows,
  GROUP_BY_OPTIONS,
  GROUPED_DIMENSION_WILDCARD,
  type GroupByOption,
  type GroupedLineageContext,
  type GroupedLineageRow,
  type LineageGroupByMode,
} from './lib/lineage-grouping';
