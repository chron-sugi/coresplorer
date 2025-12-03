/**
 * Diagram data processing hook for vis-network
 *
 * Loads the snapshot graph and produces a filtered/connected set of
 * nodes and edges for the current `coreId` and visibility filters.
 */
import { useMemo } from 'react';
import { useDiagramGraphQuery } from '@/entities/snapshot';
import type { DiagramData, DiagramNodeData } from '../types';

/** Node structure for diagram processing */
export type DiagramNode = {
    id: string;
    data: DiagramNodeData;
};

/** Edge structure for diagram processing */
export type DiagramEdge = {
    id: string;
    source: string;
    target: string;
    label?: string;
    isBidirectional: boolean;
};

/**
 * Hook for processing diagram data based on visibility rules.
 * 
 * Uses TanStack Query for data fetching, then processes the graph with:
 * - BFS traversal from core node to find connected component
 * - Filtering by hidden types
 * - Conversion to generic node/edge format (consumed by vis-network transform)
 * 
 * @param coreId - ID of the core node to start BFS from
 * @param hiddenTypes - Set of node types to hide from the diagram
 * @returns Processed nodes, edges, and metadata
 */
export const useDiagramData = (
    coreId: string = 'node-1',
    hiddenTypes: Set<string> = new Set(),
): {
    nodes: DiagramNode[];
    edges: DiagramEdge[];
    effectiveCoreId: string | null;
    loading: boolean;
    error: string | null;
    fullData: DiagramData | null;
} => {
    // Fetch raw graph data using TanStack Query
    const { data: fullData, isLoading: loading, error: queryError } = useDiagramGraphQuery() as {
        data: DiagramData | null;
        isLoading: boolean;
        error: unknown;
    };
    
    // Convert query error to string for backward compatibility
    const error = queryError ? (queryError instanceof Error ? queryError.message : 'Unknown error') : null;

    // Process data whenever fullData, coreId, or hiddenTypes changes
    const { nodes, edges, effectiveCoreId } = useMemo(() => {
        const empty = { nodes: [] as DiagramNode[], edges: [] as DiagramEdge[], effectiveCoreId: null };

        if (!fullData) {
            return empty;
        }

        // Find the core node
        const coreNode = fullData.nodes.find(n => n.id === coreId);
        if (!coreNode || !coreNode.edges) {
            return empty;
        }

        const newNodes: DiagramNode[] = [];
        const newEdges: DiagramEdge[] = [];

        // Compute levels from edges array (no graph traversal)
        // Core node = level 0
        // Edge where source has level N → target gets level N-1 (downstream)
        // Edge where target has level N → source gets level N+1 (upstream)
        const nodeLevels = new Map<string, number>();
        nodeLevels.set(coreId, 0);

        // Iterate until all levels are computed
        let changed = true;
        while (changed) {
            changed = false;
            for (const edge of coreNode.edges) {
                // Downstream: source has level, target needs level
                if (nodeLevels.has(edge.source) && !nodeLevels.has(edge.target)) {
                    nodeLevels.set(edge.target, nodeLevels.get(edge.source)! - 1);
                    changed = true;
                }
                // Upstream: target has level, source needs level
                if (nodeLevels.has(edge.target) && !nodeLevels.has(edge.source)) {
                    nodeLevels.set(edge.source, nodeLevels.get(edge.target)! + 1);
                    changed = true;
                }
            }
        }

        // Build set of visible node IDs (only nodes from edges array)
        const visibleNodeIds = new Set<string>(nodeLevels.keys());

        // Create nodes (only for nodes in edges array)
        fullData.nodes.forEach(node => {
            if (!visibleNodeIds.has(node.id)) return;

            const nodeType = node.type ?? 'unknown';
            if (hiddenTypes.has(nodeType)) {
                visibleNodeIds.delete(node.id); // Remove from visible if hidden
                return;
            }

            newNodes.push({
                id: node.id,
                data: {
                    label: node.label,
                    object_type: nodeType,
                    level: nodeLevels.get(node.id) ?? 0,
                    name: node.label,    // Use label as name for URL generation
                    app: node.app,       // Copy from graph data for URL generation
                    owner: node.owner,   // Copy from graph data for URL generation
                },
            });
        });

        // Create edges (only for edges where both nodes are visible)
        // First, detect bidirectional edge pairs
        const edgePairKeys = new Set<string>();
        coreNode.edges.forEach((edge) => {
            const reverseKey = `${edge.target}->${edge.source}`;
            if (edgePairKeys.has(reverseKey)) {
                edgePairKeys.add(`${edge.source}->${edge.target}`);
            } else {
                edgePairKeys.add(`${edge.source}->${edge.target}`);
            }
        });

        // Check if an edge has a reverse edge (bidirectional)
        const hasBidirectional = (source: string, target: string) => {
            return edgePairKeys.has(`${source}->${target}`) && edgePairKeys.has(`${target}->${source}`);
        };

        coreNode.edges.forEach((edge, index) => {
            if (visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)) {
                newEdges.push({
                    id: `e-${edge.source}-${edge.target}-${index}`,
                    source: edge.source,
                    target: edge.target,
                    label: edge.label,
                    isBidirectional: hasBidirectional(edge.source, edge.target),
                });
            }
        });

        return { nodes: newNodes, edges: newEdges, effectiveCoreId: coreId };
    }, [fullData, coreId, hiddenTypes]);

    return { nodes, edges, loading, error, fullData, effectiveCoreId };
};
