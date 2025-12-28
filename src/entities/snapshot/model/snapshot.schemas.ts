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
  'lookup_def',
  'lookup_file',
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
// 3. Node Detail Schemas (public/data/nodes/{id}.json)
// ----------------------------------------------------------------------------

/**
 * Raw schema matching the actual JSON file structure in public/data/nodes/
 * Files have 'label' field instead of 'name', and description is optional
 */
export const NodeDetailRawSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: NodeTypeSchema,
  app: z.string(),
  owner: z.string(),
  last_modified: z.string(),
  description: z.string().optional(),
  spl_code: z.string().nullable().optional(),
  attributes: z.record(z.string(), z.unknown()).nullable().optional()
});

export type NodeDetailRaw = z.infer<typeof NodeDetailRawSchema>;

/**
 * Normalized schema with 'name' field for UI consistency
 */
export const NodeDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: NodeTypeSchema,
  app: z.string(),
  owner: z.string(),
  last_modified: z.string(),
  description: z.string(),
  spl_code: z.string().nullable().optional(),
  attributes: z.record(z.string(), z.unknown()).nullable().optional()
});

export type NodeDetail = z.infer<typeof NodeDetailSchema>;

/**
 * Transform raw node detail to normalized format
 */
export function normalizeNodeDetail(raw: NodeDetailRaw): NodeDetail {
  return {
    ...raw,
    name: raw.label,
    description: raw.description || 'No description available',
    spl_code: raw.spl_code ?? undefined,
    attributes: raw.attributes ?? null
  };
}

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
