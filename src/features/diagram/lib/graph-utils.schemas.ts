/**
 * Zod schemas for graph utilities runtime validation.
 */

import { z } from 'zod';

/**
 * Impact mode schema
 */
export const ImpactModeSchema = z.enum(['upstream', 'downstream', 'both', 'off']);

/**
 * Highlight result schema
 */
export const HighlightResultSchema = z.object({
    nodes: z.set(z.string()),
    edges: z.set(z.string())
});

/**
 * Compute highlights params schema
 */
export const ComputeHighlightsParamsSchema = z.object({
    focusNodeId: z.string().nullable(),
    impactMode: ImpactModeSchema,
    incomingMap: z.record(z.string(), z.set(z.string())),
    outgoingMap: z.record(z.string(), z.set(z.string())),
    edges: z.array(z.any()) // React Flow Edge type
});

// Export inferred types
export type ImpactMode = z.infer<typeof ImpactModeSchema>;
export type HighlightResult = z.infer<typeof HighlightResultSchema>;
export type ComputeHighlightsParams = z.infer<typeof ComputeHighlightsParamsSchema>;
