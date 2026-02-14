/**
 * Index Lineage Zod Schemas
 *
 * Runtime validation schemas for index_lineage.json.
 *
 * @module entities/index-lineage/model/index-lineage.schemas
 */
import { z } from 'zod';

export const IndexLineageUnknownTokensSchema = z.object({
  sourcetype: z.string().min(1),
  source: z.string().min(1),
});

export const IndexLineageRecordSchema = z.object({
  lineage_key: z.string().min(1),
  index_id: z.string().min(1),
  index_label: z.string().min(1),
  sourcetype: z.string().min(1),
  source: z.string().min(1),
  direct_dependent_count: z.number().int().nonnegative(),
  transitive_dependent_count: z.number().int().nonnegative(),
  terminal_count: z.number().int().nonnegative(),
  max_depth: z.number().int().nonnegative(),
});

export const IndexLineagePathSchema = z.object({
  lineage_key: z.string().min(1),
  index_id: z.string().min(1),
  source_object_id: z.string().min(1),
  source_object_type: z.string().min(1),
  terminal_object_id: z.string().min(1),
  terminal_object_type: z.string().min(1),
  path_node_ids: z.array(z.string().min(1)).min(2),
  path_length: z.number().int().nonnegative(),
  cycle_detected: z.boolean(),
});

export const IndexLineageDatasetSchema = z.object({
  version: z.string().min(1),
  unknown_tokens: IndexLineageUnknownTokensSchema,
  records: z.array(IndexLineageRecordSchema),
  paths: z.array(IndexLineagePathSchema),
});

export type IndexLineageUnknownTokens = z.infer<typeof IndexLineageUnknownTokensSchema>;
export type IndexLineageRecord = z.infer<typeof IndexLineageRecordSchema>;
export type IndexLineagePath = z.infer<typeof IndexLineagePathSchema>;
export type IndexLineageDataset = z.infer<typeof IndexLineageDatasetSchema>;

