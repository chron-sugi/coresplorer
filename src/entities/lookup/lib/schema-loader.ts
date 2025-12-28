/**
 * Lookup Schema Loader
 *
 * Service for fetching, caching, and retrieving lookup table schemas.
 * Provides both async loading and sync cache access for use in lineage analysis.
 *
 * @module entities/lookup/lib/schema-loader
 */

import { LookupSchemaSchema, type LookupSchema } from '../model/schema.types';

/**
 * In-memory cache for lookup schemas
 * Maps lookup name to schema (or null if fetch failed/not found)
 */
const schemaCache = new Map<string, LookupSchema | null>();

/**
 * Fetch and parse a lookup schema from the public directory
 *
 * Results are cached to avoid repeated network requests.
 * Returns null if schema not found or parsing fails.
 *
 * @param lookupName - Name of the lookup (e.g., "users", "assets")
 * @returns Promise resolving to LookupSchema or null
 */
export async function fetchLookupSchema(lookupName: string): Promise<LookupSchema | null> {
  // Return cached value if available
  if (schemaCache.has(lookupName)) {
    return schemaCache.get(lookupName)!;
  }

  try {
    // Build URL to schema file
    const baseUrl = import.meta.env.BASE_URL || '/';
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const url = `${normalizedBase}data/lookups/${lookupName}.schema.json`;

    // Fetch schema file
    const response = await fetch(url);

    if (!response.ok) {
      // Schema not found - cache null to avoid repeated failures
      schemaCache.set(lookupName, null);
      if (import.meta.env.DEV) {
        console.info(`[LookupSchema] Schema not found for lookup: ${lookupName}`);
      }
      return null;
    }

    // Parse and validate schema
    const data = await response.json();
    const schema = LookupSchemaSchema.parse(data);

    // Cache and return
    schemaCache.set(lookupName, schema);
    return schema;
  } catch (err) {
    // Parse error or network error - cache null and return gracefully
    schemaCache.set(lookupName, null);
    if (import.meta.env.DEV) {
      console.warn(`[LookupSchema] Failed to load schema for lookup ${lookupName}:`, err);
    }
    return null;
  }
}

/**
 * Get cached schema synchronously
 *
 * Returns schema from cache if available, otherwise null.
 * This is used by the lineage handler which is synchronous.
 *
 * @param lookupName - Name of the lookup
 * @returns Cached LookupSchema or null if not in cache
 */
export function getCachedSchema(lookupName: string): LookupSchema | null {
  return schemaCache.get(lookupName) ?? null;
}

/**
 * Pre-load multiple lookup schemas in parallel
 *
 * Useful for app initialization to populate the cache before
 * lineage analysis runs.
 *
 * @param lookupNames - Array of lookup names to preload
 * @returns Promise that resolves when all fetches complete (success or failure)
 */
export async function preloadSchemas(lookupNames: string[]): Promise<void> {
  await Promise.allSettled(lookupNames.map((name) => fetchLookupSchema(name)));
}

/**
 * Clear the schema cache
 *
 * Useful for testing or forcing a refresh of schemas.
 */
export function clearSchemaCache(): void {
  schemaCache.clear();
}
