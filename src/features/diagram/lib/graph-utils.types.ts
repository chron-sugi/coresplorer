/**
 * Type definitions for graph traversal and highlighting utilities.
 */

import type { Edge } from '@xyflow/react';

/**
 * Adjacency map for graph traversal.
 * Maps node ID to a set of connected node IDs.
 */
export type AdjacencyMap = Record<string, Set<string>>;

/**
 * Result of highlight computation.
 */
export interface HighlightResult {
    nodes: Set<string>;
    edges: Set<string>;
}

/**
 * Impact highlighting mode.
 */
export type ImpactMode = 'upstream' | 'downstream' | 'both' | 'off';

/**
 * Parameters for computing highlights.
 */
export interface ComputeHighlightsParams {
    focusNodeId: string | null;
    impactMode: ImpactMode;
    incomingMap: AdjacencyMap;
    outgoingMap: AdjacencyMap;
    edges: Edge[];
}
