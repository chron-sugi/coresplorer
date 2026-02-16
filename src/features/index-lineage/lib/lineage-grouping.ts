import type { IndexLineagePath, IndexLineageRecord } from '@/entities/index-lineage';
import type { KnowledgeObject } from '@/entities/knowledge-object';
import type { LineageRecordContext } from './lineage-filters';

export type LineageGroupByMode =
  | 'index'
  | 'index+sourcetype'
  | 'index+source'
  | 'index+sourcetype+source';

export interface GroupByOption {
  value: LineageGroupByMode;
  label: string;
}

export const GROUP_BY_OPTIONS: GroupByOption[] = [
  { value: 'index', label: 'Index' },
  { value: 'index+sourcetype', label: 'Index + Sourcetype' },
  { value: 'index+source', label: 'Index + Source' },
  { value: 'index+sourcetype+source', label: 'Index + Sourcetype + Source' },
];

export const GROUPED_DIMENSION_WILDCARD = '*';

export interface GroupedLineageRow {
  group_key: string;
  group_by: LineageGroupByMode;
  index_id: string;
  index_label: string;
  sourcetype: string;
  source: string;
  direct_dependent_count: number;
  transitive_dependent_count: number;
  terminal_count: number;
  max_depth: number;
  member_lineage_keys: string[];
}

export interface GroupedLineageContext {
  paths: IndexLineagePath[];
  relatedKOs: KnowledgeObject[];
  distinct_sourcetypes: string[];
  distinct_sources: string[];
}

interface MutableGroup {
  groupKey: string;
  groupBy: LineageGroupByMode;
  indexId: string;
  indexLabel: string;
  sourcetypes: Set<string>;
  sources: Set<string>;
  memberLineageKeys: Set<string>;
  paths: IndexLineagePath[];
  relatedKoById: Map<string, KnowledgeObject>;
}

function getGroupedValue(record: IndexLineageRecord, groupBy: LineageGroupByMode): string {
  switch (groupBy) {
    case 'index':
      return `${record.index_id}|${GROUPED_DIMENSION_WILDCARD}|${GROUPED_DIMENSION_WILDCARD}`;
    case 'index+sourcetype':
      return `${record.index_id}|${record.sourcetype}|${GROUPED_DIMENSION_WILDCARD}`;
    case 'index+source':
      return `${record.index_id}|${GROUPED_DIMENSION_WILDCARD}|${record.source}`;
    case 'index+sourcetype+source':
      return `${record.index_id}|${record.sourcetype}|${record.source}`;
    default:
      return record.lineage_key;
  }
}

function toSortedArray(values: Set<string>): string[] {
  return Array.from(values).sort((a, b) => a.localeCompare(b));
}

function getSingleValue(sortedValues: string[], fallback: string): string {
  return sortedValues.length > 0 ? sortedValues[0] : fallback;
}

function computeDirectDependentCount(paths: IndexLineagePath[]): number {
  return new Set(paths.map((path) => path.source_object_id)).size;
}

function computeTransitiveDependentCount(paths: IndexLineagePath[]): number {
  const dependentNodeIds = new Set<string>();

  paths.forEach((path) => {
    path.path_node_ids.forEach((nodeId) => {
      if (nodeId !== path.index_id) {
        dependentNodeIds.add(nodeId);
      }
    });
  });

  return dependentNodeIds.size;
}

function computeTerminalCount(paths: IndexLineagePath[]): number {
  return new Set(paths.map((path) => path.terminal_object_id)).size;
}

function computeMaxDepth(paths: IndexLineagePath[]): number {
  return paths.reduce((maxDepth, path) => Math.max(maxDepth, path.path_length), 0);
}

function createGroup(
  record: IndexLineageRecord,
  groupBy: LineageGroupByMode
): MutableGroup {
  return {
    groupKey: getGroupedValue(record, groupBy),
    groupBy,
    indexId: record.index_id,
    indexLabel: record.index_label,
    sourcetypes: new Set<string>(),
    sources: new Set<string>(),
    memberLineageKeys: new Set<string>(),
    paths: [],
    relatedKoById: new Map<string, KnowledgeObject>(),
  };
}

export function groupLineageRows(
  records: IndexLineageRecord[],
  contextsByLineageKey: Map<string, LineageRecordContext>,
  groupBy: LineageGroupByMode
): {
  rows: GroupedLineageRow[];
  contextsByGroupKey: Map<string, GroupedLineageContext>;
} {
  const mutableGroups = new Map<string, MutableGroup>();

  records.forEach((record) => {
    const groupKey = getGroupedValue(record, groupBy);
    const mutableGroup = mutableGroups.get(groupKey) ?? createGroup(record, groupBy);

    mutableGroup.sourcetypes.add(record.sourcetype);
    mutableGroup.sources.add(record.source);
    mutableGroup.memberLineageKeys.add(record.lineage_key);

    const lineageContext = contextsByLineageKey.get(record.lineage_key);
    if (lineageContext) {
      mutableGroup.paths.push(...lineageContext.paths);
      lineageContext.relatedKOs.forEach((ko) => {
        mutableGroup.relatedKoById.set(ko.id, ko);
      });
    }

    mutableGroups.set(groupKey, mutableGroup);
  });

  const rows: GroupedLineageRow[] = [];
  const contextsByGroupKey = new Map<string, GroupedLineageContext>();

  mutableGroups.forEach((group) => {
    const sortedSourcetypes = toSortedArray(group.sourcetypes);
    const sortedSources = toSortedArray(group.sources);
    const sortedMemberLineageKeys = toSortedArray(group.memberLineageKeys);

    const sourcetypeDisplay =
      group.groupBy === 'index+source' || group.groupBy === 'index'
        ? GROUPED_DIMENSION_WILDCARD
        : getSingleValue(sortedSourcetypes, GROUPED_DIMENSION_WILDCARD);

    const sourceDisplay =
      group.groupBy === 'index+sourcetype' || group.groupBy === 'index'
        ? GROUPED_DIMENSION_WILDCARD
        : getSingleValue(sortedSources, GROUPED_DIMENSION_WILDCARD);

    rows.push({
      group_key: group.groupKey,
      group_by: group.groupBy,
      index_id: group.indexId,
      index_label: group.indexLabel,
      sourcetype: sourcetypeDisplay,
      source: sourceDisplay,
      direct_dependent_count: computeDirectDependentCount(group.paths),
      transitive_dependent_count: computeTransitiveDependentCount(group.paths),
      terminal_count: computeTerminalCount(group.paths),
      max_depth: computeMaxDepth(group.paths),
      member_lineage_keys: sortedMemberLineageKeys,
    });

    contextsByGroupKey.set(group.groupKey, {
      paths: group.paths,
      relatedKOs: Array.from(group.relatedKoById.values()),
      distinct_sourcetypes: sortedSourcetypes,
      distinct_sources: sortedSources,
    });
  });

  rows.sort((a, b) => a.group_key.localeCompare(b.group_key));

  return { rows, contextsByGroupKey };
}
