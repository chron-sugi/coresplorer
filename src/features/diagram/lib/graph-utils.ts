/**
 * Pure graph traversal utilities for impact and path highlighting.
 * 
 * All functions are pure (no side effects) and designed for testability.
 * Uses BFS for graph traversal to handle cycles and find shortest paths.
 */

import type { GraphEdge, AdjacencyMap, HighlightResult, ComputeHighlightsParams } from './graph-utils.types';

/**
 * Build adjacency maps from edges.
 * 
 * @param edges - Array of edges with source/target
 * @returns Object containing outgoing and incoming adjacency maps
 */
export function buildAdjacencyMaps(edges: GraphEdge[]): {
    outgoing: AdjacencyMap;
    incoming: AdjacencyMap;
} {
    const outgoing: AdjacencyMap = {};
    const incoming: AdjacencyMap = {};

    for (const edge of edges) {
        // Initialize sets if not exist
        if (!outgoing[edge.source]) outgoing[edge.source] = new Set();
        if (!incoming[edge.target]) incoming[edge.target] = new Set();

        // Add connections
        outgoing[edge.source].add(edge.target);
        incoming[edge.target].add(edge.source);
    }

    return { outgoing, incoming };
}

/**
 * Find all upstream nodes (ancestors) using BFS.
 * Guards against cycles with a visited set.
 * 
 * @param startId - Starting node ID
 * @param incomingMap - Incoming adjacency map
 * @returns Set of upstream node IDs (excluding start node)
 */
export function getUpstreamNodes(
    startId: string,
    incomingMap: AdjacencyMap
): Set<string> {
    const upstream = new Set<string>();
    const visited = new Set<string>();
    const queue: string[] = [startId];

    while (queue.length > 0) {
        const currentId = queue.shift()!;
        
        if (visited.has(currentId)) continue;
        visited.add(currentId);

        const parents = incomingMap[currentId];
        if (!parents) continue;

        for (const parentId of parents) {
            if (!visited.has(parentId)) {
                upstream.add(parentId);
                queue.push(parentId);
            }
        }
    }

    return upstream;
}

/**
 * Find all downstream nodes (descendants) using BFS.
 * Guards against cycles with a visited set.
 * 
 * @param startId - Starting node ID
 * @param outgoingMap - Outgoing adjacency map
 * @returns Set of downstream node IDs (excluding start node)
 */
export function getDownstreamNodes(
    startId: string,
    outgoingMap: AdjacencyMap
): Set<string> {
    const downstream = new Set<string>();
    const visited = new Set<string>();
    const queue: string[] = [startId];

    while (queue.length > 0) {
        const currentId = queue.shift()!;
        
        if (visited.has(currentId)) continue;
        visited.add(currentId);

        const children = outgoingMap[currentId];
        if (!children) continue;

        for (const childId of children) {
            if (!visited.has(childId)) {
                downstream.add(childId);
                queue.push(childId);
            }
        }
    }

    return downstream;
}

/**
 * Find shortest path between two nodes using BFS.
 * 
 * @param sourceId - Source node ID
 * @param targetId - Target node ID
 * @param outgoingMap - Outgoing adjacency map
 * @returns Ordered array of node IDs forming the path, or null if no path exists
 */
export function findShortestPath(
    sourceId: string,
    targetId: string,
    outgoingMap: AdjacencyMap
): string[] | null {
    if (sourceId === targetId) return [sourceId];

    const visited = new Set<string>();
    const queue: Array<{ id: string; path: string[] }> = [
        { id: sourceId, path: [sourceId] }
    ];

    while (queue.length > 0) {
        const { id: currentId, path } = queue.shift()!;
        
        if (visited.has(currentId)) continue;
        visited.add(currentId);

        const neighbors = outgoingMap[currentId];
        if (!neighbors) continue;

        for (const neighborId of neighbors) {
            if (neighborId === targetId) {
                return [...path, neighborId];
            }

            if (!visited.has(neighborId)) {
                queue.push({
                    id: neighborId,
                    path: [...path, neighborId]
                });
            }
        }
    }

    return null; // No path found
}

/**
 * Derive edge IDs from a node path.
 * 
 * @param nodePath - Ordered array of node IDs
 * @param edges - Array of all edges
 * @returns Set of edge IDs that connect the nodes in the path
 */
export function getPathEdges(
    nodePath: string[],
    edges: GraphEdge[]
): Set<string> {
    const pathEdges = new Set<string>();

    for (let i = 0; i < nodePath.length - 1; i++) {
        const source = nodePath[i];
        const target = nodePath[i + 1];

        const edge = edges.find(e => e.source === source && e.target === target);
        if (edge) {
            pathEdges.add(edge.id);
        }
    }

    return pathEdges;
}

/**
 * Compute highlight sets based on focus node and impact mode.
 * 
 * @param params - Computation parameters
 * @returns Object containing highlighted node and edge sets
 */
export function computeHighlights(params: ComputeHighlightsParams): HighlightResult {
    const { focusNodeId, impactMode, incomingMap, outgoingMap, edges } = params;

    // No highlighting if no focus or mode is off
    if (!focusNodeId || impactMode === 'off') {
        return { nodes: new Set(), edges: new Set() };
    }

    const highlightedNodes = new Set<string>();
    const highlightedEdges = new Set<string>();

    // Add focus node
    highlightedNodes.add(focusNodeId);

    // Compute impact sets based on mode
    if (impactMode === 'upstream' || impactMode === 'both') {
        const upstream = getUpstreamNodes(focusNodeId, incomingMap);
        upstream.forEach(id => highlightedNodes.add(id));
    }

    if (impactMode === 'downstream' || impactMode === 'both') {
        const downstream = getDownstreamNodes(focusNodeId, outgoingMap);
        downstream.forEach(id => highlightedNodes.add(id));
    }

    // Find edges connecting highlighted nodes
    for (const edge of edges) {
        if (highlightedNodes.has(edge.source) && highlightedNodes.has(edge.target)) {
            highlightedEdges.add(edge.id);
        }
    }

    return { nodes: highlightedNodes, edges: highlightedEdges };
}
