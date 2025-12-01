/**
 * Custom hook for managing graph highlighting state.
 * 
 * Handles focus node selection, impact mode, and derives highlight sets
 * using memoized graph traversal utilities.
 */

import { useState, useMemo, useCallback } from 'react';
import type { Edge } from '@xyflow/react';
import type { ImpactMode, HighlightResult } from '../../lib/graph-utils.types';
import { buildAdjacencyMaps, computeHighlights } from '../../lib/graph-utils';

export interface UseGraphHighlightingResult {
    focusNodeId: string | null;
    setFocusNodeId: (id: string | null) => void;
    impactMode: ImpactMode;
    setImpactMode: (mode: ImpactMode) => void;
    highlightedNodes: Set<string>;
    highlightedEdges: Set<string>;
    clearHighlighting: () => void;
}

/**
 * Hook for managing graph highlighting state and computation.
 * 
 * @param nodes - Array of React Flow nodes
 * @param edges - Array of React Flow edges
 * @returns Highlighting state and controls
 */
export function useGraphHighlighting(
    edges: Edge[]
): UseGraphHighlightingResult {
    const [focusNodeId, setFocusNodeId] = useState<string | null>(null);
    const [impactMode, setImpactMode] = useState<ImpactMode>('off');

    // Memoize adjacency maps (only rebuild when edges change)
    const { outgoing, incoming } = useMemo(
        () => buildAdjacencyMaps(edges),
        [edges]
    );

    // Compute highlights (memoized based on dependencies)
    const highlights: HighlightResult = useMemo(
        () => computeHighlights({
            focusNodeId,
            impactMode,
            incomingMap: incoming,
            outgoingMap: outgoing,
            edges
        }),
        [focusNodeId, impactMode, incoming, outgoing, edges]
    );

    // Clear all highlighting
    const clearHighlighting = useCallback(() => {
        setFocusNodeId(null);
        setImpactMode('off');
    }, []);

    return {
        focusNodeId,
        setFocusNodeId,
        impactMode,
        setImpactMode,
        highlightedNodes: highlights.nodes,
        highlightedEdges: highlights.edges,
        clearHighlighting
    };
}
