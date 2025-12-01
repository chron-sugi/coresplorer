/**
 * Diagram styling utilities
 *
 * Pure functions that apply highlighting/dimming styles to nodes and
 * edges based on the current highlight state.
 */
import type { Node, Edge } from '@xyflow/react';
import type { ImpactMode } from './graph-utils.types';

export interface HighlightState {
    highlightedNodes: Set<string>;
    highlightedEdges: Set<string>;
    impactMode: ImpactMode;
    focusNodeId: string | null;
}

/**
 * Pure function to apply highlighting and dimming styles to nodes and edges.
 * Returns new arrays of nodes and edges with updated style properties.
 * Does not mutate the original inputs.
 */
export function applyDiagramStyles(
    nodes: Node[],
    edges: Edge[],
    state: HighlightState
): { nodes: Node[]; edges: Edge[] } {
    const { highlightedNodes, highlightedEdges, impactMode, focusNodeId } = state;

    // Optimization: If no highlighting is active, return original arrays
    // This assumes that "off" mode with no focus means default styles
    if (impactMode === 'off' && !focusNodeId) {
        return { nodes, edges };
    }

    const styledNodes = nodes.map((node) => {
        const isHighlighted = highlightedNodes.has(node.id);
        const isDimmed = impactMode !== 'off' && !isHighlighted;
        const isFocused = node.id === focusNodeId;

        // Only create a new object if properties actually change
        // For now, we always return a new object to be safe with React Flow's change detection
        return {
            ...node,
            data: {
                ...node.data,
                isFocused,
                isHighlighted,
                isDimmed
            }
        };
    });

    const styledEdges = edges.map((edge) => {
        const isHighlighted = highlightedEdges.has(edge.id);
        const isDimmed = impactMode !== 'off' && !isHighlighted;

        return {
            ...edge,
            style: {
                ...edge.style,
                opacity: isDimmed ? 0.2 : 1,
                strokeWidth: isHighlighted ? 2.5 : 1.5
            },
            animated: isHighlighted
        };
    });

    return { nodes: styledNodes, edges: styledEdges };
}
