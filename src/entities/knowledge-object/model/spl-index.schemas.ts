/**
 * SPL Index Zod Schema
 *
 * Runtime validation schema for spl-index.json.
 * Maps node IDs to their SPL code strings.
 *
 * @module entities/knowledge-object/model/spl-index.schemas
 */
import { z } from 'zod';

/**
 * Schema for spl-index.json.
 * Key-value object where key is the knowledge object ID
 * and value is the SPL code string.
 */
export const SplIndexSchema = z.record(z.string(), z.string());

export type SplIndex = z.infer<typeof SplIndexSchema>;
