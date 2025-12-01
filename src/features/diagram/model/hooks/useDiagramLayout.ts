/**
 * Diagram layout hook
 *
 * Wraps dagre layout to compute positions for React Flow nodes and edges.
 * Supports specifying a `coreNodeId` which will be vertically centered at Y=0.
 */
import { type Node, type Edge, Position } from '@xyflow/react';
import { useCallback } from 'react';
import dagre from 'dagre';
import { DIAGRAM_LAYOUT } from '../constants/diagram.constants';

interface UseDiagramLayoutOptions {
    graphFactory?: () => dagre.graphlib.Graph;
}

const defaultGraphFactory = () => new dagre.graphlib.Graph();

export const useDiagramLayout = (options: UseDiagramLayoutOptions = {}): {
    getLayoutedElements: (nodes: Node[], edges: Edge[], direction?: string, coreNodeId?: string) => { nodes: Node[]; edges: Edge[] };
} => {
    const { graphFactory = defaultGraphFactory } = options;
    
    const getLayoutedElements = useCallback((nodes: Node[], edges: Edge[], direction = 'TB', coreNodeId?: string) => {
        const dagreGraph = graphFactory();
        dagreGraph.setDefaultEdgeLabel(() => ({}));
        
        const isHorizontal = direction === 'LR';
        dagreGraph.setGraph({
            rankdir: direction,
            nodesep: DIAGRAM_LAYOUT.NODE_SEPARATION,
            ranksep: DIAGRAM_LAYOUT.RANK_SEPARATION,
            ranker: 'network-simplex',
        });

        nodes.forEach((node) => {
            const isCore = node.id === coreNodeId;
            const width = isCore ? DIAGRAM_LAYOUT.NODE_WIDTH_CORE : DIAGRAM_LAYOUT.NODE_WIDTH;
            const height = isCore ? DIAGRAM_LAYOUT.NODE_HEIGHT_CORE : DIAGRAM_LAYOUT.NODE_HEIGHT;
            dagreGraph.setNode(node.id, { width, height });
        });

        edges.forEach((edge) => {
            dagreGraph.setEdge(edge.source, edge.target);
        });

        dagre.layout(dagreGraph);

        // Calculate Y-offset to center the core node at Y=0
        let yOffset = 0;
        if (coreNodeId) {
            const coreNodePos = dagreGraph.node(coreNodeId);
            if (coreNodePos) {
                yOffset = coreNodePos.y;
            }
        }

        const newNodes = nodes.map((node) => {
            const nodeWithPosition = dagreGraph.node(node.id);
            const isCore = node.id === coreNodeId;

            // Safety check for layout failure
            let x = 0;
            let y = 0;

            if (nodeWithPosition) {
                // Dagre gives center positions. With nodeOrigin=[0.5, 0.5] in ReactFlow,
                // we use center coords directly (no width/height offset needed)
                x = nodeWithPosition.x;
                y = nodeWithPosition.y - yOffset;
            } else {
                console.warn(`Layout failed for node ${node.id}, defaulting to (0,0)`);
            }

            // Ensure no NaNs
            if (isNaN(x)) x = 0;
            if (isNaN(y)) y = 0;

            const newNode = {
                ...node,
                targetPosition: isHorizontal ? Position.Left : Position.Top,
                sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
                position: { x, y },
                data: {
                    ...node.data,
                    isCore,
                }
            };

            return newNode;
        });

        return { nodes: newNodes, edges };
    }, [graphFactory]);

    return { getLayoutedElements };
};
