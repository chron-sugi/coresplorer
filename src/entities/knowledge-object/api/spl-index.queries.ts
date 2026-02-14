/**
 * SPL Index Queries
 *
 * TanStack Query hook for fetching the SPL index (spl-index.json).
 * Provides a bulk lookup of node ID -> SPL code for search features.
 *
 * @module entities/knowledge-object/api/spl-index.queries
 */
import { useQuery } from '@tanstack/react-query';
import { apiConfig } from '@/shared/config';
import { DataFetchError, DataValidationError } from '@/shared/lib';
import { SplIndexSchema } from '../model';
import type { SplIndex } from '../model';

async function fetchSplIndex(): Promise<SplIndex> {
  const response = await fetch(apiConfig.endpoints.splIndex);

  if (!response.ok) {
    throw new DataFetchError(
      `Failed to fetch SPL index: ${response.status} ${response.statusText}`,
      response.url
    );
  }

  const json = await response.json();

  const parseResult = SplIndexSchema.safeParse(json);
  if (!parseResult.success) {
    throw new DataValidationError(
      'Invalid SPL index data structure',
      parseResult.error,
      json
    );
  }

  return parseResult.data;
}

export const splIndexQueryKeys = {
  all: ['splIndex'] as const,
};

/**
 * TanStack Query hook for fetching the SPL index
 *
 * @returns Query result with SPL index data (map of nodeId -> spl_code)
 */
export function useSplIndexQuery() {
  return useQuery({
    queryKey: splIndexQueryKeys.all,
    queryFn: fetchSplIndex,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
  });
}
