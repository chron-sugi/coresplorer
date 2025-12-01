/**
 * Snapshot Data Schemas
 *
 * Zod schemas describing the structure of the public graph and node
 * metadata JSON files. These schemas are used for runtime validation
 * when loading `public/data/graph.json`.
 *
 * @module entities/snapshot/model/snapshot.schemas
 */
import { z } from 'zod';

// ----------------------------------------------------------------------------
// 1. Shared Enums & Types
// ----------------------------------------------------------------------------

export const NodeTypeSchema = z.enum([
  'saved_search',
  'data_model',
  'event_type',
  'lookup',
  'macro',
  'index',
  'dashboard',
  'unknown'
]);

export type NodeType = z.infer<typeof NodeTypeSchema>;

// ----------------------------------------------------------------------------
// 2. Graph Schemas (public/data/graph.json)
// ----------------------------------------------------------------------------

export const GraphEdgeSchema = z.object({
  source: z.string(),
  target: z.string(),
  label: z.string().optional()
});

export type GraphEdge = z.infer<typeof GraphEdgeSchema>;

export const GraphNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: NodeTypeSchema,
  app: z.string(),
  owner: z.string(),
  last_modified: z.string().datetime(),
  edges: z.array(GraphEdgeSchema).optional()
});

export type GraphNode = z.infer<typeof GraphNodeSchema>;

export const GraphSchema = z.object({
  version: z.string(),
  nodes: z.array(GraphNodeSchema)
});

export type Graph = z.infer<typeof GraphSchema>;

// ----------------------------------------------------------------------------
// 3. Node Detail Schemas (public/data/nodes/details/{id}.json)
// ----------------------------------------------------------------------------

export const NodeDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: NodeTypeSchema,
  app: z.string(),
  owner: z.string(),
  last_modified: z.string().datetime(),
  description: z.string(),
  spl_code: z.string().optional(),
  metadata: z.object({
    created: z.string().datetime().optional(),
    tags: z.array(z.string()).optional(),
    permissions: z.string().optional()
  }).optional(),
  relationships: z.object({
    incoming: z.array(z.string()),
    outgoing: z.array(z.string()),
    upstream_count: z.number(),
    downstream_count: z.number()
  }).optional()
});

export type NodeDetail = z.infer<typeof NodeDetailSchema>;

// ----------------------------------------------------------------------------
// 4. Meta Schema (public/data/meta.json)
// ----------------------------------------------------------------------------

export const MetaSchema = z.object({
  generated_at: z.string().datetime(),
  env: z.string().optional()
});

export type SnapshotMeta = z.infer<typeof MetaSchema>;

// ----------------------------------------------------------------------------
// 5. Helper Functions
// ----------------------------------------------------------------------------

export function parseGraphJson(json: unknown): Graph {
  return GraphSchema.parse(json);
}

export function parseNodeDetailJson(json: unknown): NodeDetail {
  return NodeDetailSchema.parse(json);
}

export function parseMetaJson(json: unknown): SnapshotMeta {
  return MetaSchema.parse(json);
}
