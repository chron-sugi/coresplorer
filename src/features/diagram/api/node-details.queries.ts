/**
 * Node details queries for the diagram feature.
 *
 * Provides a TanStack Query hook and loader that dynamically imports
 * per-node JSON details and validates them with Zod.
 */
import { useQuery } from '@tanstack/react-query';
import { NodeDetailSchema } from '@/entities/snapshot';
import type { NodeDetail } from '@/entities/snapshot';
import { DiagramValidationError } from '../diagram.errors';

/**
 * Fetches and validates details for a specific node
 * 
 * @param nodeId - ID of the node to fetch details for
 * @returns Validated node detail data
 */
async function fetchNodeDetails(nodeId: string): Promise<NodeDetail> {
  // Dynamically import the JSON file for this node
  try {
    const module = await import(`/data/nodes/details/${nodeId}.json`);
    const rawData = module.default || module;
    
    // Runtime validation with Zod
    const parseResult = NodeDetailSchema.safeParse(rawData);
    if (!parseResult.success) {
      throw new DiagramValidationError(
        `Invalid node details structure for ${nodeId}`,
        parseResult.error,
        rawData
      );
    }
    
    return parseResult.data;
  } catch (err) {
    if (err instanceof DiagramValidationError) {
      throw err;
    }
    // File not found or import error
    throw new Error(`Failed to load details for node ${nodeId}: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
    enabled: !!nodeId, // Only run query when nodeId is not null
    staleTime: Infinity, // Node details never become stale
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes after last use
    retry: 1,
  });
}
