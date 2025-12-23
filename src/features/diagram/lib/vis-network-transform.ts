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

import { generateNodeSvgUrl } from './node-svg-gen';


/**
 * Extended vis-network node with custom data properties.
 */
export type VisNetworkNode = VisNode & {
  objectType?: string;
  app?: string;
  owner?: string;
  isCore?: boolean;
  displayLabel?: string;
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

  const displayLabel = truncateLabel(node.data.label || node.id, isCore ? 60 : 50);

  // Generate initial SVG image
  const image = generateNodeSvgUrl({
    label: displayLabel,
    type: objectType,
    isCore,
    colors: {
      background: isCore ? nodeColors.coreBackground : nodeColors.defaultBackground,
      border: typeColor,
      text: slate[800],
    },
  });

  return {
    id: node.id,
    level: node.data.level,
    label: ' ', // Hide default label but keep space
    displayLabel, // Store for updates
    // Store custom data for event handlers
    objectType,
    app: node.data.app,
    owner: node.data.owner,
    isCore,
    // Styling
    shape: 'image',
    image,
    font: {
      size: 0,
      color: 'rgba(0,0,0,0)',
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
 * Truncate label text to a maximum length.
 */
function truncateLabel(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Create HTML tooltip content for a node.
 */
function createNodeTooltip(node: DiagramNode, objectType: string): HTMLElement {
  const container = document.createElement('div');
  
  const title = document.createElement('strong');
  title.textContent = node.data.label || node.id;
  container.appendChild(title);
  
  container.appendChild(document.createElement('br'));
  
  const typeText = document.createTextNode(`Type: ${objectType}`);
  container.appendChild(typeText);
  
  if (node.data.app) {
    container.appendChild(document.createElement('br'));
    const appText = document.createTextNode(`App: ${node.data.app}`);
    container.appendChild(appText);
  }
  
  return container;
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

  // DEBUG: Log node levels
  console.log('[vis-network] Node levels:', visNodes.map(n => ({ id: n.id, level: n.level })));

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
  const { slate } = themeConfig.colors;

  let colors: { background: string; border: string; text: string } = {
    background: node.isCore ? nodeColors.coreBackground : nodeColors.defaultBackground,
    border: typeColor,
    text: slate[800],
  };

  if (isFocused) {
    colors = {
      background: nodeColors.focusedBackground,
      border: nodeColors.focusedBorder,
      text: slate[800],
    };
  } else if (isHighlighted) {
    colors = {
      background: nodeColors.highlightedBackground,
      border: typeColor,
      text: slate[800],
    };
  } else if (isDimmed) {
    colors = {
      background: nodeColors.dimmedBackground,
      border: nodeColors.dimmedBorder,
      text: nodeColors.dimmedText,
    };
  }

  // Regenerate SVG with new colors
  const image = generateNodeSvgUrl({
    label: node.displayLabel || node.label || '',
    type: objectType,
    isCore: !!node.isCore,
    colors,
  });

  return {
    image,
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
        opacity: 0, // Hide native edge so we can draw custom animation
      },
      dashes: [5, 5], // Marching ants (kept for data, but invisible)
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
      opacity: 1,
    },
    dashes: false,
  };
}
