/**
 * Lookup Schema Preloading
 *
 * Utility to preload lookup schemas at app startup by fetching the
 * lookup index and loading all registered schemas into the cache.
 *
 * @module entities/lookup/lib/preload-schemas
 */

import { preloadSchemas } from './schema-loader';

/**
 * Preload all lookup schemas listed in the index file
 *
 * Fetches `/public/data/lookups/index.json` to get the list of available
 * lookups, then preloads all schemas in parallel. This should be called
 * at app startup to populate the schema cache before lineage analysis runs.
 *
 * Gracefully handles missing index file or fetch errors - the function
 * will not throw but will log warnings in development mode.
 *
 * @returns Promise that resolves when preloading is complete
 */
export async function preloadLookupSchemas(): Promise<void> {
  try {
    // Build URL to lookup index
    const baseUrl = import.meta.env.BASE_URL || '/';
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const url = `${normalizedBase}data/lookups/index.json`;

    // Fetch lookup index
    const response = await fetch(url);

    if (!response.ok) {
      if (import.meta.env.DEV) {
        console.info('[LookupSchema] Lookup index not found, skipping schema preload');
      }
      return;
    }

    // Parse index and preload schemas
    const index: { lookups: string[] } = await response.json();
    if (index.lookups && Array.isArray(index.lookups)) {
      await preloadSchemas(index.lookups);

      if (import.meta.env.DEV) {
        console.info(`[LookupSchema] Preloaded ${index.lookups.length} lookup schemas`);
      }
    }
  } catch (err) {
    // Log warning but don't throw - app should continue even if schemas fail to load
    if (import.meta.env.DEV) {
      console.warn('[LookupSchema] Schema preload failed:', err);
    }
  }
}
