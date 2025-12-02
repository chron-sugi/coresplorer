/**
 * Graph Data Queries
 *
 * TanStack Query hooks for fetching the global graph JSON.
 * Provides caching and validation for graph data.
 *
 * @module entities/snapshot/api/graph.queries
 */
import { useQuery } from '@tanstack/react-query';
import { apiConfig } from '@/shared/config';
import { DataFetchError, DataValidationError } from '@/shared/lib';
import { GraphSchema } from '../model';

async function fetchGraphData() {
  const response = await fetch(apiConfig.endpoints.graph);
  if (!response.ok) {
    throw new DataFetchError(
      `Failed to fetch graph data: ${response.status} ${response.statusText}`,
      response.url
    );
  }
  const json = await response.json();

  const parseResult = GraphSchema.safeParse(json);
  if (!parseResult.success) {
    throw new DataValidationError(
      'Invalid graph data structure',
      parseResult.error,
      json
    );
  }

  return parseResult.data;
}

/**
 * TanStack Query hook for fetching graph data
 *
 * @returns Query result with validated graph data
 *
 * @example
 * const { data, isLoading, error } = useGraphQuery();
 */
export function useGraphQuery() {
  return useQuery({
    queryKey: ['graph'],
    queryFn: fetchGraphData,
  });
}

// Backward compatibility alias
export const useDiagramGraphQuery = useGraphQuery;
