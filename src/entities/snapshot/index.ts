/**
 * Snapshot Entity
 *
 * Domain entity for graph snapshot data schemas.
 * Provides Zod schemas and types for graph, node, and metadata.
 *
 * @module entities/snapshot
 */

// Model - Schemas and types
export {
  NodeTypeSchema,
  GraphEdgeSchema,
  GraphNodeSchema,
  GraphSchema,
  NodeDetailSchema,
  MetaSchema,
  parseGraphJson,
  parseNodeDetailJson,
  parseMetaJson,
} from './model';

export type {
  NodeType,
  GraphEdge,
  GraphNode,
  Graph,
  NodeDetail,
  SnapshotMeta,
} from './model';

// API - Data fetching
export { useMetaQuery, type MetaData } from './api';
export { useGraphQuery, useDiagramGraphQuery } from './api';
export { useNodeDetailsQuery } from './api';

// Hooks - React hooks
export { useSnapshotMeta } from './hooks';

// UI - Components
export { SnapshotFreshnessBadge } from './ui';
