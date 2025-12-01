/**
 * Knowledge Object Queries
 *
 * TanStack Query hooks for fetching Knowledge Object data from index.json.
 * Provides caching, automatic refetching, and proper loading/error states.
 *
 * @module features/ko-explorer/api/ko.queries
 */
import { useQuery } from '@tanstack/react-query';
import { apiConfig } from '@/shared/config';
import { IndexSchema, type KOIndex, type KnowledgeObject } from '@/entities/knowledge-object';
import { KODataFetchError, KODataValidationError } from '../lib/ko-explorer.errors';

/**
 * Fetches and validates index data from the API
 */
async function fetchIndexData(): Promise<KOIndex> {
  const response = await fetch(apiConfig.endpoints.index);

  if (!response.ok) {
    throw new KODataFetchError(
      `Failed to fetch index data: ${response.status} ${response.statusText}`,
      response.url
    );
  }

  const json = await response.json();

  // Runtime validation with Zod
  const parseResult = IndexSchema.safeParse(json);
  if (!parseResult.success) {
    throw new KODataValidationError(
      'Invalid index data structure',
      parseResult.error,
      json
    );
  }

  return parseResult.data;
}

/**
 * Transforms index data into KnowledgeObject array
 */
function transformToKnowledgeObjects(index: KOIndex): KnowledgeObject[] {
  return Object.entries(index).map(([id, node]) => ({
    id,
    name: node.label,
    type: node.type,
    app: node.app,
    owner: node.owner,
    isolated: node.isolated ?? false,
  }));
}

/**
 * Query key factory for KO-related queries
 */
export const koQueryKeys = {
  all: ['ko'] as const,
  index: () => [...koQueryKeys.all, 'index'] as const,
};

/**
 * TanStack Query hook for fetching Knowledge Object index data
 *
 * @returns Query result with raw index data
 *
 * @example
 * const { data, isLoading, error } = useKOIndexQuery();
 */
export function useKOIndexQuery() {
  return useQuery({
    queryKey: koQueryKeys.index(),
    queryFn: fetchIndexData,
  });
}

/**
 * TanStack Query hook for fetching Knowledge Objects with transformation
 *
 * Uses select option to transform index data into KnowledgeObject array.
 * Provides automatic caching, refetching, and proper loading/error states.
 *
 * @returns Query result with KnowledgeObject array
 *
 * @example
 * const { data: kos, isLoading, error, refetch } = useKOListQuery();
 */
export function useKOListQuery() {
  return useQuery({
    queryKey: koQueryKeys.index(),
    queryFn: fetchIndexData,
    select: transformToKnowledgeObjects,
  });
}
