/**
 * Node Details Queries
 *
 * TanStack Query hook for fetching per-node detail JSON files.
 * Uses dynamic imports and Zod validation.
 *
 * @module entities/snapshot/api/node-details.queries
 */
import { useQuery } from '@tanstack/react-query';
import { DataValidationError, isValidNodeId } from '@/shared/lib';
import { NodeDetailRawSchema, normalizeNodeDetail } from '../model';
import type { NodeDetail } from '../model';

/**
 * Fetches and validates details for a specific node
 *
 * @param nodeId - ID of the node to fetch details for
 * @returns Validated node detail data
 * @throws Error if nodeId is invalid or fetch fails
 */
async function fetchNodeDetails(nodeId: string): Promise<NodeDetail> {
  // Validate nodeId format to prevent path traversal attacks
  if (!isValidNodeId(nodeId)) {
    throw new Error(`Invalid node ID format: ${nodeId.substring(0, 50)}`);
  }

  try {
    // Use fetch instead of dynamic import for public assets
    // This avoids Vite analysis issues and works with the public folder structure
    const baseUrl = import.meta.env.BASE_URL;
    // Ensure baseUrl ends with / and remove it from start of path if present to avoid double slashes
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const url = `${normalizedBase}objects/${nodeId}.json`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const rawData = await response.json();

    // Validate against the raw schema (matches actual JSON structure)
    const parseResult = NodeDetailRawSchema.safeParse(rawData);
    if (!parseResult.success) {
      throw new DataValidationError(
        `Invalid node details structure for ${nodeId}`,
        parseResult.error,
        rawData
      );
    }

    // Normalize the data (convert label -> name, provide default description)
    return normalizeNodeDetail(parseResult.data);
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
