/**
 * vis-network Configuration Constants
 *
 * Centralized configuration for the vis-network diagram renderer.
 * Includes physics simulation, node/edge styling, and interaction settings.
 *
 * @module features/diagram/model/constants/vis-network.constants
 */
import type { Options } from 'vis-network';
import { themeConfig } from '@/shared/config';

/**
 * Physics configuration for hierarchical layout.
 * Uses hierarchicalRepulsion solver for structured tree-like graphs.
 */
export const VIS_PHYSICS_OPTIONS: Options['physics'] = {
  enabled: true, // Enable physics to help with spacing
  solver: 'hierarchicalRepulsion',
  hierarchicalRepulsion: {
    centralGravity: 0.0,
    springLength: 100,
    springConstant: 0.06,
    nodeDistance: 280, // Increased to prevent x-axis overlap
    damping: 0.09,
  },
  stabilization: {
    enabled: true,
    iterations: 1000,
    updateInterval: 25,
    onlyDynamicEdges: false,
    fit: true,
  },
};

/**
 * Default node styling options.
 */
export const VIS_NODE_OPTIONS: Options['nodes'] = {
  shape: 'box',
  borderWidth: 1,
  borderWidthSelected: 2,
  color: {
    background: themeConfig.colors.semantic.node.defaultBackground,
    border: themeConfig.colors.semantic.node.defaultBorder,
    highlight: {
      background: themeConfig.colors.semantic.node.highlightedBackground,
      border: themeConfig.colors.semantic.edge.highlighted,
    },
    hover: {
      background: themeConfig.colors.semantic.node.hoverBackground,
      border: themeConfig.colors.slate[400],
    },
  },
  font: {
    color: themeConfig.colors.slate[800],
    size: 12,
    face: 'system-ui, -apple-system, sans-serif',
  },
  margin: {
    top: 8,
    bottom: 8,
    left: 12,
    right: 12,
  },
  shadow: {
    enabled: true,
    color: 'rgba(0, 0, 0, 0.1)',
    size: 4,
    x: 0,
    y: 2,
  },
};

/**
 * Default edge styling options.
 */
export const VIS_EDGE_OPTIONS: Options['edges'] = {
  width: themeConfig.layout.edgeWidth.default,
  color: {
    color: themeConfig.colors.semantic.edge.default,
    highlight: themeConfig.colors.semantic.edge.highlighted,
    hover: themeConfig.colors.slate[600],
    opacity: 1,
  },
  arrows: {
    to: {
      enabled: true,
      scaleFactor: 0.5,
      type: 'arrow',
    },
  },
  smooth: {
    enabled: true,
    type: 'cubicBezier',
    forceDirection: 'vertical',
    roundness: 0.4,
  },
  selectionWidth: 1.5,
  hoverWidth: 1.5,
};

/**
 * Interaction settings for user input handling.
 */
export const VIS_INTERACTION_OPTIONS: Options['interaction'] = {
  hover: true,
  hoverConnectedEdges: true,
  selectConnectedEdges: false,
  multiselect: false,
  dragNodes: true,
  dragView: true,
  zoomView: true,
  zoomSpeed: 1,
  keyboard: {
    enabled: true,
    speed: { x: 10, y: 10, zoom: 0.02 },
    bindToWindow: false,
  },
  navigationButtons: false,
  tooltipDelay: 300,
};

/**
 * Combined vis-network options.
 */
export const VIS_NETWORK_OPTIONS: Options = {
  physics: VIS_PHYSICS_OPTIONS,
  nodes: VIS_NODE_OPTIONS,
  edges: VIS_EDGE_OPTIONS,
  interaction: VIS_INTERACTION_OPTIONS,
  layout: {
    improvedLayout: true,
    hierarchical: {
      enabled: true,
      levelSeparation: 150,
      nodeSpacing: 250,
      treeSpacing: 200,
      blockShifting: false,
      edgeMinimization: false,
      parentCentralization: true,
      direction: 'UD',
      sortMethod: 'directed',
      shakeTowards: 'roots',
    },
  },
  autoResize: true,
};

/**
 * Node dimensions for sizing calculations.
 */
export const VIS_NODE_DIMENSIONS = {
  WIDTH: 180,
  HEIGHT: 32,
  WIDTH_CORE: 220,
  HEIGHT_CORE: 40,
} as const;

/**
 * Edge styling for highlighted (lineage) paths.
 */
export const VIS_EDGE_HIGHLIGHT_STYLE = {
  width: themeConfig.layout.edgeWidth.highlighted,
  color: themeConfig.colors.semantic.edge.highlighted,
  dashes: [5, 5],   // Marching ants effect
} as const;

/**
 * Edge styling for dimmed (non-highlighted) paths.
 */
export const VIS_EDGE_DIM_STYLE = {
  width: themeConfig.layout.edgeWidth.default,
  color: {
    color: themeConfig.colors.semantic.edge.dimmed,
    opacity: 0.2,
  },
} as const;
