/**
 * Diagram model types
 *
 * Shared types for the diagram feature: view-model nodes and data payload
 * used by hooks and UI components.
 */

export type DiagramEdgeView = {
  source: string;
  target: string;
  label?: string;
};

export type DiagramNodeView = {
  id: string;
  label?: string;
  type?: string;
  edges?: DiagramEdgeView[];
  data?: unknown;
  object_type?: string;
  app?: string;
  owner?: string;
};

export type DiagramData = {
  nodes: DiagramNodeView[];
};

// React Flow node.data payload used in UI rendering
export type DiagramNodeData = {
  label?: string;
  object_type: string;
  level?: number;
  isCore?: boolean;
  // Add for Splunk URL generation
  name?: string;   // Use label as fallback
  app?: string;    // From graph data
  owner?: string;  // From graph data
};
