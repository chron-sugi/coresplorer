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
 * Physics configuration for force-directed layout.
 * ForceAtlas2Based is optimized for dense "hairball" graphs.
 */
export const VIS_PHYSICS_OPTIONS: Options['physics'] = {
  enabled: true,
  solver: 'forceAtlas2Based',
  forceAtlas2Based: {
    gravitationalConstant: -50,
    centralGravity: 0.01,
    springLength: 100,
    springConstant: 0.08,
    damping: 0.4,
    avoidOverlap: 0.5,
  },
  stabilization: {
    enabled: true,
    iterations: 1000,
    updateInterval: 25,
    onlyDynamicEdges: false,
    fit: true,
  },
  maxVelocity: 50,
  minVelocity: 0.1,
  timestep: 0.5,
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
      background: '#dbeafe', // sky-100
      border: '#3b82f6',     // sky-500
    },
    hover: {
      background: '#f1f5f9', // slate-100
      border: '#94a3b8',     // slate-400
    },
  },
  font: {
    color: '#1e293b',        // slate-800
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
    hover: '#475569', // slate-600
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
    type: 'continuous',
    roundness: 0.5,
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
    clusterThreshold: 150,
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
  color: '#3b82f6', // sky-500
  dashes: [5, 5],   // Marching ants effect
} as const;

/**
 * Edge styling for dimmed (non-highlighted) paths.
 */
export const VIS_EDGE_DIM_STYLE = {
  width: themeConfig.layout.edgeWidth.default,
  color: {
    color: themeConfig.colors.semantic.edge.default,
    opacity: 0.2,
  },
} as const;
