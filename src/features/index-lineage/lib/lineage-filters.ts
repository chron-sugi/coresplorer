import type { IndexLineagePath, IndexLineageRecord } from '@/entities/index-lineage';
import type { KnowledgeObject } from '@/entities/knowledge-object';
import { getKoLabel } from '@/entities/knowledge-object';
import { matchesNormalized } from '@/shared/lib';

export interface LineageKoFilters {
  types: string[];
  apps: string[];
  owners: string[];
}

export interface LineageFilterOptions {
  types: string[];
  apps: string[];
  owners: string[];
}

export interface LineageRecordContext {
  paths: IndexLineagePath[];
  relatedKOs: KnowledgeObject[];
}

export interface LineageSearchContext {
  paths: IndexLineagePath[];
  relatedKOs: KnowledgeObject[];
  distinct_sourcetypes?: string[];
  distinct_sources?: string[];
}

export interface LineageSearchRow {
  index_id: string;
  index_label: string;
  sourcetype: string;
  source: string;
  group_key?: string;
  member_lineage_keys?: string[];
}

interface LineageRecordContextInternal {
  paths: IndexLineagePath[];
  relatedKOsById: Map<string, KnowledgeObject>;
}

function hasActiveKoFilters(filters: LineageKoFilters): boolean {
  return filters.types.length > 0 || filters.apps.length > 0 || filters.owners.length > 0;
}

export function buildLineageRecordContexts(
  paths: IndexLineagePath[],
  koById: Map<string, KnowledgeObject>
): Map<string, LineageRecordContext> {
  const internal = new Map<string, LineageRecordContextInternal>();

  paths.forEach((pathItem) => {
    const existing = internal.get(pathItem.lineage_key) ?? {
      paths: [],
      relatedKOsById: new Map<string, KnowledgeObject>(),
    };

    existing.paths.push(pathItem);

    pathItem.path_node_ids.forEach((nodeId) => {
      if (nodeId === pathItem.index_id) {
        return;
      }

      const ko = koById.get(nodeId);
      if (ko) {
        existing.relatedKOsById.set(ko.id, ko);
      }
    });

    internal.set(pathItem.lineage_key, existing);
  });

  const contexts = new Map<string, LineageRecordContext>();
  internal.forEach((value, lineageKey) => {
    contexts.set(lineageKey, {
      paths: value.paths,
      relatedKOs: Array.from(value.relatedKOsById.values()),
    });
  });

  return contexts;
}

export function deriveLineageFilterOptions(
  contexts: Map<string, Pick<LineageRecordContext, 'relatedKOs'>>
): LineageFilterOptions {
  const types = new Set<string>();
  const apps = new Set<string>();
  const owners = new Set<string>();

  contexts.forEach((context) => {
    context.relatedKOs.forEach((ko) => {
      types.add(ko.type);
      apps.add(ko.app);
      owners.add(ko.owner);
    });
  });

  return {
    types: Array.from(types).sort(),
    apps: Array.from(apps).sort(),
    owners: Array.from(owners).sort(),
  };
}

export function matchesLineageKoFilters(
  context: Pick<LineageRecordContext, 'relatedKOs'> | undefined,
  filters: LineageKoFilters
): boolean {
  if (!hasActiveKoFilters(filters)) {
    return true;
  }

  if (!context || context.relatedKOs.length === 0) {
    return false;
  }

  return context.relatedKOs.some((ko) => {
    if (filters.types.length > 0 && !filters.types.includes(ko.type)) {
      return false;
    }

    if (filters.apps.length > 0 && !filters.apps.includes(ko.app)) {
      return false;
    }

    if (filters.owners.length > 0 && !filters.owners.includes(ko.owner)) {
      return false;
    }

    return true;
  });
}

export function matchesLineageSearch(
  record: IndexLineageRecord | LineageSearchRow,
  context: LineageSearchContext | undefined,
  searchTerm: string
): boolean {
  if (!searchTerm.trim()) {
    return true;
  }

  const lineageKeyValues = 'lineage_key' in record ? [record.lineage_key] : [];
  const groupKeyValues = 'group_key' in record && record.group_key ? [record.group_key] : [];
  const memberLineageKeyValues =
    'member_lineage_keys' in record && Array.isArray(record.member_lineage_keys)
      ? record.member_lineage_keys
      : [];

  const matchesRecordFields = [
    ...lineageKeyValues,
    ...groupKeyValues,
    ...memberLineageKeyValues,
    record.index_id,
    record.index_label,
    record.sourcetype,
    record.source,
  ].some((field) => matchesNormalized(field, searchTerm));

  if (matchesRecordFields) {
    return true;
  }

  const paths = context?.paths ?? [];
  const matchesPathFields = paths.some((pathItem) => {
    const pathText = pathItem.path_node_ids.join(' -> ');
    return [
      pathItem.source_object_id,
      pathItem.source_object_type,
      pathItem.terminal_object_id,
      pathItem.terminal_object_type,
      pathText,
    ].some((field) => matchesNormalized(field, searchTerm));
  });

  if (matchesPathFields) {
    return true;
  }

  const collapsedDimensionFields = [
    ...(context?.distinct_sourcetypes ?? []),
    ...(context?.distinct_sources ?? []),
  ];

  const matchesCollapsedDimensions = collapsedDimensionFields.some((field) =>
    matchesNormalized(field, searchTerm)
  );

  if (matchesCollapsedDimensions) {
    return true;
  }

  const relatedKOs = context?.relatedKOs ?? [];
  return relatedKOs.some((ko) =>
    [
      ko.id,
      ko.name,
      ko.type,
      getKoLabel(ko.type),
      ko.app,
      ko.owner,
    ].some((field) => matchesNormalized(field, searchTerm))
  );
}
