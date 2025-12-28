/**
 * Lookup Entity
 *
 * Domain entity for lookup table schema discovery and field lineage.
 * Provides schema types, loading services, and preloading utilities.
 *
 * @module entities/lookup
 */

// =============================================================================
// TYPES
// =============================================================================

export type { LookupSchema, LookupField } from './model/schema.types';

// =============================================================================
// SCHEMA LOADING
// =============================================================================

export {
  getCachedSchema,
  fetchLookupSchema,
  preloadSchemas,
  clearSchemaCache,
} from './lib/schema-loader';

export { preloadLookupSchemas } from './lib/preload-schemas';
