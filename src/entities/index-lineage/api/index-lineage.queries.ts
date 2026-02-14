/**
 * Index Lineage Queries
 *
 * TanStack Query hooks for fetching index lineage data from index_lineage.json.
 *
 * @module entities/index-lineage/api/index-lineage.queries
 */
import { useQuery } from '@tanstack/react-query';
import { apiConfig } from '@/shared/config';
import { DataFetchError, DataValidationError } from '@/shared/lib';
import { IndexLineageDatasetSchema } from '../model';

async function fetchIndexLineageData() {
  const response = await fetch(apiConfig.endpoints.indexLineage);

  if (!response.ok) {
    throw new DataFetchError(
      `Failed to fetch index lineage data: ${response.status} ${response.statusText}`,
      response.url
    );
  }

  const json = await response.json();
  const parseResult = IndexLineageDatasetSchema.safeParse(json);

  if (!parseResult.success) {
    throw new DataValidationError(
      'Invalid index lineage data structure',
      parseResult.error,
      json
    );
  }

  return parseResult.data;
}

export const indexLineageQueryKeys = {
  all: ['indexLineage'] as const,
  data: () => [...indexLineageQueryKeys.all, 'data'] as const,
};

export function useIndexLineageQuery() {
  return useQuery({
    queryKey: indexLineageQueryKeys.data(),
    queryFn: fetchIndexLineageData,
  });
}

