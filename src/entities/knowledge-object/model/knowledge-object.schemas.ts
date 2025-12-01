/**
 * Knowledge Object Zod Schemas
 *
 * Runtime validation schemas for the index.json API response.
 * These validate the raw API shape before transformation to domain model.
 *
 * @module entities/knowledge-object/model/knowledge-object.schemas
 */
import { z } from 'zod';

/**
 * Schema for a single node in index.json.
 * Note: Uses `label` which gets transformed to `name` in the domain model.
 */
export const IndexNodeSchema = z.object({
  label: z.string(),
  type: z.string(),
  app: z.string(),
  owner: z.string(),
  isolated: z.boolean().optional(),
});

/**
 * Schema for the full index.json response.
 * Key-value object where key is the knowledge object ID.
 */
export const IndexSchema = z.record(z.string(), IndexNodeSchema);

// Inferred types from schemas
export type IndexNode = z.infer<typeof IndexNodeSchema>;
export type KOIndex = z.infer<typeof IndexSchema>;
