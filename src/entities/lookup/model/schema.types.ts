/**
 * Lookup Schema Types
 *
 * Type definitions and Zod schemas for lookup table field discovery.
 * Enables static schema files to define CSV column structures for
 * inputlookup field lineage tracking.
 *
 * @module entities/lookup/model/schema.types
 */

import { z } from 'zod';

/**
 * Schema for a single field in a lookup table
 */
export const LookupFieldSchema = z.object({
  /** Field name (column name in CSV) */
  name: z.string(),
  /** Field data type */
  type: z
    .enum(['string', 'number', 'boolean', 'time', 'unknown'])
    .optional()
    .default('unknown'),
  /** Human-readable field description */
  description: z.string().optional(),
});

/**
 * Schema for a complete lookup table definition
 */
export const LookupSchemaSchema = z.object({
  /** Lookup name (matches the name used in SPL inputlookup command) */
  lookupName: z.string(),
  /** Schema version for future compatibility */
  version: z.string().optional(),
  /** Array of field definitions */
  fields: z.array(LookupFieldSchema),
});

/**
 * TypeScript type for a lookup field
 */
export type LookupField = z.infer<typeof LookupFieldSchema>;

/**
 * TypeScript type for a complete lookup schema
 */
export type LookupSchema = z.infer<typeof LookupSchemaSchema>;
