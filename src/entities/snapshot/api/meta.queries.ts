/**
 * Metadata queries
 *
 * Hooks to fetch and validate snapshot metadata (`meta.json`) used by the
 * application for build/time information. Uses Zod for runtime validation.
 *
 * @module entities/snapshot/api
 */
import { useQuery } from '@tanstack/react-query';
import { apiConfig } from '@/shared/config';
import { MetaSchema, type SnapshotMeta } from '../model';

// Backward-compatible alias for consumers expecting MetaData
export type MetaData = SnapshotMeta;

/**
 * Fetches metadata from data/meta.json with validation
 */
async function fetchMeta(): Promise<SnapshotMeta> {
  const response = await fetch(apiConfig.endpoints.meta);

  if (!response.ok) {
    throw new Error(`Failed to fetch metadata: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Runtime validation with Zod
  const parseResult = MetaSchema.safeParse(data);
  if (!parseResult.success) {
    throw new Error(`Invalid metadata structure: ${parseResult.error.message}`);
  }

  return parseResult.data;
}

/**
 * TanStack Query hook for fetching snapshot metadata
 *
 * @returns Query result with metadata
 *
 * @example
 * const { data, isLoading, error } = useMetaQuery();
 * if (data) {
 *   console.log('Generated at:', data.generated_at);
 * }
 */
export function useMetaQuery() {
  return useQuery({
    queryKey: ['meta'],
    queryFn: fetchMeta,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 1,
  });
}
