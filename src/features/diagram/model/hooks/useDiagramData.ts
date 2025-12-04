/**
 * Diagram data processing hook for vis-network
 *
 * Loads the snapshot graph and produces a filtered/connected set of
 * nodes and edges for the current `coreId` and visibility filters.
 */
import { useMemo } from 'react';
import { useDiagramGraphQuery } from '@/entities/snapshot';
import { buildAdjacencyMaps, getUpstreamNodes, getDownstreamNodes } from '../../lib/graph-utils';
import type { GraphEdge } from '../../lib/graph-utils.types';
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
        if (!coreNode) {
            return empty;
        }

        // 1. Flatten all edges from the entire graph
        // We use an extended type to keep the label for later
        type ExtendedGraphEdge = GraphEdge & { label?: string };
        const allEdges: ExtendedGraphEdge[] = [];
        
        fullData.nodes.forEach(node => {
            if (node.edges) {
                node.edges.forEach(edge => {
                    allEdges.push({
                        id: `e-${edge.source}-${edge.target}`, // Generate ID if missing
                        source: edge.source,
                        target: edge.target,
                        label: edge.label
                    });
                });
            }
        });

        // 2. Build adjacency maps for traversal
        const { outgoing, incoming } = buildAdjacencyMaps(allEdges);

        // 3. Find connected component (upstream + downstream)
        const upstreamIds = getUpstreamNodes(coreId, incoming);
        const downstreamIds = getDownstreamNodes(coreId, outgoing);
        
        const visibleNodeIds = new Set<string>([coreId, ...upstreamIds, ...downstreamIds]);

        // 4. Filter by hidden types
        // We do this *after* traversal so we don't break paths, but we only *render* visible nodes.
        // Wait, if we hide a node, should we hide its children? 
        // Usually "hidden types" means "don't show these nodes", but if they are structural, it's tricky.
        // For now, we just exclude them from the final list.
        
        const newNodes: DiagramNode[] = [];
        const nodeLevels = new Map<string, number>();
        nodeLevels.set(coreId, 0);

        // Compute levels (simple BFS distance)
        // We can reuse the traversal logic or just compute it here.
        // Since we already have the sets, let's just assign levels based on direction.
        // Note: This is a simplification. Real leveling might need topological sort or BFS depth.
        // For hierarchical layout, vis-network handles it if we give it structure.
        // But we pass 'level' in data.
        
        // Assign levels for upstream (negative)
        // We need BFS to assign correct distance
        const assignLevels = (startId: string, map: Record<string, Set<string>>, direction: 1 | -1) => {
            const queue: { id: string, level: number }[] = [{ id: startId, level: 0 }];
            const visited = new Set<string>([startId]);
            
            while (queue.length > 0) {
                const { id, level } = queue.shift()!;
                if (id !== startId) { // Don't overwrite core
                    if (!nodeLevels.has(id)) nodeLevels.set(id, level);
                }
                
                const neighbors = map[id];
                if (neighbors) {
                    neighbors.forEach(nextId => {
                        if (!visited.has(nextId) && visibleNodeIds.has(nextId)) {
                            visited.add(nextId);
                            queue.push({ id: nextId, level: level + direction });
                        }
                    });
                }
            }
        };

        assignLevels(coreId, outgoing, 1);  // Downstream -> positive
        assignLevels(coreId, incoming, -1); // Upstream -> negative

        // 5. Create Nodes
        fullData.nodes.forEach(node => {
            if (!visibleNodeIds.has(node.id)) return;

            const nodeType = node.type ?? 'unknown';
            if (hiddenTypes.has(nodeType)) {
                return;
            }

            newNodes.push({
                id: node.id,
                data: {
                    label: node.label,
                    object_type: nodeType,
                    level: nodeLevels.get(node.id) ?? 0,
                    name: node.label,
                    app: node.app,
                    owner: node.owner,
                },
            });
        });

        // 6. Create Edges
        // Only include edges where both source and target are visible (and not hidden)
        const finalVisibleIds = new Set(newNodes.map(n => n.id));
        const newEdges: DiagramEdge[] = [];
        
        // Helper for bidirectionality check
        const edgePairKeys = new Set<string>();
        allEdges.forEach(edge => {
            if (finalVisibleIds.has(edge.source) && finalVisibleIds.has(edge.target)) {
                edgePairKeys.add(`${edge.source}->${edge.target}`);
            }
        });

        const hasBidirectional = (source: string, target: string) => {
            return edgePairKeys.has(`${source}->${target}`) && edgePairKeys.has(`${target}->${source}`);
        };

        allEdges.forEach((edge, index) => {
            if (finalVisibleIds.has(edge.source) && finalVisibleIds.has(edge.target)) {
                newEdges.push({
                    id: edge.id || `e-${edge.source}-${edge.target}-${index}`,
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
