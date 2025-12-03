/**
 * vis-network Data Transformers
 *
 * Functions to convert diagram data from the useDiagramData hook format
 * to vis-network compatible node and edge objects.
 *
 * @module features/diagram/lib/vis-network-transform
 */
import type { Node as VisNode, Edge as VisEdge } from 'vis-network';
import type { DiagramNode, DiagramEdge } from '../model/hooks/useDiagramData';
import { themeConfig } from '@/shared/config';
import { VIS_NODE_DIMENSIONS } from '../model/constants/vis-network.constants';

/**
 * Extended vis-network node with custom data properties.
 */
export type VisNetworkNode = VisNode & {
  objectType?: string;
  app?: string;
  owner?: string;
  isCore?: boolean;
};

/**
 * Extended vis-network edge with custom data properties.
 */
export type VisNetworkEdge = VisEdge & {
  sourceLabel?: string;
  targetLabel?: string;
};

/**
 * Get the color for a knowledge object type.
 */
function getKOTypeColor(objectType: string): string {
  const colors = themeConfig.colors.koTypes;
  return colors[objectType as keyof typeof colors] || colors.unknown;
}

/**
 * Transform a diagram node to vis-network format.
 */
export function transformNode(
  node: DiagramNode,
  coreId: string | null
): VisNetworkNode {
  const isCore = node.id === coreId;
  const objectType = node.data.object_type || 'unknown';
  const typeColor = getKOTypeColor(objectType);
  const { node: nodeColors } = themeConfig.colors.semantic;
  const { slate } = themeConfig.colors;

  return {
    id: node.id,
    label: node.data.label || node.id,
    // Store custom data for event handlers
    objectType,
    app: node.data.app,
    owner: node.data.owner,
    isCore,
    // Styling
    shape: 'box',
    color: {
      background: isCore ? nodeColors.coreBackground : nodeColors.defaultBackground,
      border: typeColor,
      highlight: {
        background: nodeColors.highlightHover,
        border: typeColor,
      },
      hover: {
        background: nodeColors.hoverBackground,
        border: typeColor,
      },
    },
    borderWidth: isCore ? 2 : 1,
    font: {
      color: slate[800],
      size: isCore ? 14 : 12,
      bold: isCore ? 'bold' : undefined,
    },
    widthConstraint: {
      minimum: isCore ? VIS_NODE_DIMENSIONS.WIDTH_CORE : VIS_NODE_DIMENSIONS.WIDTH,
      maximum: isCore ? VIS_NODE_DIMENSIONS.WIDTH_CORE : VIS_NODE_DIMENSIONS.WIDTH,
    },
    margin: {
      top: 8,
      bottom: 8,
      left: 12,
      right: 12,
    },
    // Add title for tooltip
    title: createNodeTooltip(node, objectType),
  };
}

/**
 * Create HTML tooltip content for a node.
 */
function createNodeTooltip(node: DiagramNode, objectType: string): string {
  const parts = [
    `<strong>${node.data.label || node.id}</strong>`,
    `Type: ${objectType}`,
  ];
  
  if (node.data.app) {
    parts.push(`App: ${node.data.app}`);
  }
  
  return parts.join('<br/>');
}

/**
 * Transform a diagram edge to vis-network format.
 */
export function transformEdge(edge: DiagramEdge): VisNetworkEdge {
  return {
    id: edge.id,
    from: edge.source,
    to: edge.target,
    label: edge.label,
    // Store for reference
    sourceLabel: edge.source,
    targetLabel: edge.target,
    // Visual style based on bidirectional status
    dashes: edge.isBidirectional ? undefined : [6, 4],
  };
}

/**
 * Transform full diagram data to vis-network format.
 */
export function transformDiagramData(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  coreId: string | null
): {
  nodes: VisNetworkNode[];
  edges: VisNetworkEdge[];
} {
  const visNodes = nodes.map((node) => transformNode(node, coreId));
  const visEdges = edges.map((edge) => transformEdge(edge));

  return {
    nodes: visNodes,
    edges: visEdges,
  };
}

/**
 * Update node styling for highlighting state.
 */
export function applyNodeHighlight(
  node: VisNetworkNode,
  state: {
    isFocused: boolean;
    isHighlighted: boolean;
    isDimmed: boolean;
  }
): Partial<VisNode> {
  const { isFocused, isHighlighted, isDimmed } = state;
  const objectType = node.objectType || 'unknown';
  const typeColor = getKOTypeColor(objectType);
  const { node: nodeColors } = themeConfig.colors.semantic;

  if (isFocused) {
    return {
      color: {
        background: nodeColors.focusedBackground,
        border: nodeColors.focusedBorder,
      },
      borderWidth: 3,
    };
  }

  if (isHighlighted) {
    return {
      color: {
        background: nodeColors.highlightedBackground,
        border: typeColor,
      },
      borderWidth: 2,
    };
  }

  if (isDimmed) {
    return {
      color: {
        background: nodeColors.dimmedBackground,
        border: nodeColors.dimmedBorder,
      },
      font: {
        color: nodeColors.dimmedText,
      },
    };
  }

  // Default state
  return {
    color: {
      background: node.isCore ? nodeColors.coreBackground : nodeColors.defaultBackground,
      border: typeColor,
    },
    borderWidth: node.isCore ? 2 : 1,
    opacity: 1,
  };
}

/**
 * Update edge styling for highlighting state.
 */
export function applyEdgeHighlight(
  isHighlighted: boolean,
  isDimmed: boolean
): Partial<VisEdge> {
  const { edge: edgeColors } = themeConfig.colors.semantic;
  const { edgeWidth } = themeConfig.layout;

  if (isHighlighted) {
    return {
      width: edgeWidth.highlighted,
      color: {
        color: edgeColors.highlighted,
      },
      dashes: [5, 5], // Marching ants
    };
  }

  if (isDimmed) {
    return {
      width: edgeWidth.default,
      color: {
        color: edgeColors.dimmed,
        opacity: 0.3,
      },
      dashes: false,
    };
  }

  // Default state
  return {
    width: edgeWidth.default,
    color: {
      color: edgeColors.default,
    },
    dashes: false,
  };
}
