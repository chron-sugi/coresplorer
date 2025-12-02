/**
 * Node Details Queries
 *
 * TanStack Query hook for fetching per-node detail JSON files.
 * Uses dynamic imports and Zod validation.
 *
 * @module entities/snapshot/api/node-details.queries
 */
import { useQuery } from '@tanstack/react-query';
import { DataValidationError } from '@/shared/lib';
import { NodeDetailSchema } from '../model';
import type { NodeDetail } from '../model';

/**
 * Fetches and validates details for a specific node
 *
 * @param nodeId - ID of the node to fetch details for
 * @returns Validated node detail data
 */
async function fetchNodeDetails(nodeId: string): Promise<NodeDetail> {
  try {
    const module = await import(`/data/nodes/details/${nodeId}.json`);
    const rawData = module.default || module;

    const parseResult = NodeDetailSchema.safeParse(rawData);
    if (!parseResult.success) {
      throw new DataValidationError(
        `Invalid node details structure for ${nodeId}`,
        parseResult.error,
        rawData
      );
    }

    return parseResult.data;
  } catch (err) {
    if (err instanceof DataValidationError) {
      throw err;
    }
    throw new Error(
      `Failed to load details for node ${nodeId}: ${err instanceof Error ? err.message : 'Unknown error'}`
    );
  }
}

/**
 * TanStack Query hook for fetching individual node details
 *
 * Uses dynamic imports to load JSON files on-demand.
 * Results are cached indefinitely since node details don't change.
 *
 * @param nodeId - ID of the node to fetch, or null to disable query
 * @returns Query result with node details
 *
 * @example
 * const { data, isLoading, error } = useNodeDetailsQuery('node-1');
 * if (data) {
 *   console.log('Node name:', data.name);
 *   console.log('SPL code:', data.spl_code);
 * }
 */
export function useNodeDetailsQuery(nodeId: string | null) {
  return useQuery({
    queryKey: ['nodeDetails', nodeId],
    queryFn: () => fetchNodeDetails(nodeId!),
    enabled: !!nodeId,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });
}
