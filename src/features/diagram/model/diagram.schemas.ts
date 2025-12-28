/**
 * Runtime validation schemas for diagram feature data.
 * Uses Zod for type-safe parsing of external data sources.
 */

import { z } from 'zod';

// Edge schema
export const DiagramEdgeSchema = z.object({
    from: z.string(),
    to: z.string()
});

// Node data schema
export const DiagramNodeDataSchema = z.object({
    object_type: z.string(),
    label: z.string(),
    name: z.string().optional(),
    linked_nodes: z.array(z.string()),
    edges: z.array(DiagramEdgeSchema)
});

// Full diagram data schema (record of nodes)
export const DiagramDataSchema = z.record(z.string(), DiagramNodeDataSchema);

// Node details schema
export const NodeDetailsSchema = z.object({
    name: z.string(),
    owner: z.string(),
    app: z.string(),
    last_modified: z.string(),
    description: z.string(),
    spl_code: z.string().optional(),
    attributes: z.record(z.string(), z.unknown()).nullable().optional()
});

// Full node details data schema
export const NodeDetailsDataSchema = z.record(z.string(), NodeDetailsSchema);

// Search suggestion schema
export const DiagramSearchSuggestionSchema = z.object({
    id: z.string(),
    label: z.string(),
    type: z.string().optional(),
    app: z.string().optional()
});

// Export inferred types
export type DiagramData = z.infer<typeof DiagramDataSchema>;
export type DiagramNodeData = z.infer<typeof DiagramNodeDataSchema>;
export type DiagramEdge = z.infer<typeof DiagramEdgeSchema>;
export type NodeDetails = z.infer<typeof NodeDetailsSchema>;
export type NodeDetailsData = z.infer<typeof NodeDetailsDataSchema>;
export type DiagramSearchSuggestion = z.infer<typeof DiagramSearchSuggestionSchema>;
