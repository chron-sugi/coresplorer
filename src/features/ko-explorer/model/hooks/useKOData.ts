/**
 * useKOData Hook
 *
 * Hook for fetching Knowledge Object data from graph.json.
 * Uses TanStack Query for caching, automatic refetching, and proper state management.
 *
 * @module features/ko-explorer/model/hooks/useKOData
 */
import { type KnowledgeObject, useKOListQuery } from '@/entities/knowledge-object';

/**
 * Hook for fetching Knowledge Object data from graph.json.
 *
 * Wrapper around TanStack Query that provides a stable API for consumers.
 * Handles caching, automatic refetching, and proper loading/error states.
 *
 * @returns Object containing KOs array, loading state, error message, and refetch function
 *
 * @example
 * const { kos, loading, error, refetch } = useKOData();
 */
export function useKOData(): {
  kos: KnowledgeObject[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const { data, isLoading, error: queryError, refetch: queryRefetch } = useKOListQuery();

  // Convert query error to string for backward compatibility
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : 'Unknown error'
    : null;

  return {
    kos: data ?? [],
    loading: isLoading,
    error,
    refetch: () => {
      void queryRefetch();
    },
  };
}
