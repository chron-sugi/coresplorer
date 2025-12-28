/**
 * Splunk Web UI URL Builder
 *
 * Constructs deep links to knowledge objects in the Splunk Web UI.
 * Supports both static mode (env variables) and dynamic configuration.
 *
 * @module shared/lib/splunk-url-builder
 */

import { z } from 'zod';
import { type SplunkKoType, isValidKoType } from './ko-types';

/** Extended type that includes 'unknown' for URL fallback handling */
type SplunkKoTypeWithUnknown = SplunkKoType | 'unknown';

/**
 * Zod schema for Splunk Web UI configuration
 */
const SplunkWebConfigSchema = z.object({
  host: z.string().min(1),
  port: z.string().regex(/^\d+$/, 'Port must be numeric'),
  protocol: z.enum(['http', 'https']),
});

/**
 * Configuration for Splunk Web UI base URL
 */
type SplunkWebConfig = z.infer<typeof SplunkWebConfigSchema>;

/**
 * Knowledge object metadata required for URL construction
 */
interface KnowledgeObjectUrlParams {
  name: string;
  type: SplunkKoType | string; // Accepts SplunkKoType or unknown strings
  app: string;
  owner?: string; // Currently not used in URL but may be needed for permissions
}

/**
 * Get Splunk Web UI configuration from environment variables.
 * Validates configuration using Zod schema.
 */
function getSplunkWebConfig(): SplunkWebConfig | null {
  const result = SplunkWebConfigSchema.safeParse({
    host: import.meta.env.VITE_SPLUNK_WEB_HOST,
    port: import.meta.env.VITE_SPLUNK_WEB_PORT,
    protocol: import.meta.env.VITE_SPLUNK_WEB_PROTOCOL || 'https',
  });

  return result.success ? result.data : null;
}

/**
 * URL path templates for each knowledge object type
 * Based on Splunk Web UI URL structure
 */
const KO_URL_TEMPLATES: Record<SplunkKoTypeWithUnknown, (app: string, name: string) => string> = {
  dashboard: (app, name) => `/app/${app}/${name}`,
  saved_search: (app, name) => `/manager/${app}/saved/searches/${name}`,
  macro: (app, name) => `/manager/${app}/admin/macros/${name}`,
  lookup_def: (app, name) => `/manager/${app}/data/transforms/lookups/${name}`,
  lookup_file: (app, name) => `/manager/${app}/data/lookups/${name}`,
  data_model: (app, name) => `/manager/${app}/data/models/model/edit/${name}`,
  event_type: (app, name) => `/manager/${app}/saved/eventtypes/${name}`,
  index: (app, name) => `/manager/${app}/data/indexes/${name}`,
  unknown: (app, name) => `/manager/${app}/saved/searches/${name}`, // Fallback to saved search
};

/**
 * Build a Splunk Web UI URL for a knowledge object
 *
 * @param params - Knowledge object parameters
 * @returns Full URL to the knowledge object in Splunk Web UI, or null if config is missing
 *
 * @example
 * ```ts
 * const url = buildSplunkUrl({
 *   name: 'my_saved_search',
 *   type: 'saved_search',
 *   app: 'search',
 *   owner: 'admin'
 * });
 * // Returns: "https://localhost:8000/en-US/manager/search/saved/searches/my_saved_search"
 * ```
 */
export function buildSplunkUrl(params: KnowledgeObjectUrlParams): string | null {
  const config = getSplunkWebConfig();

  if (!config) {
    return null;
  }

  const { name, type, app } = params;

  // URL encode the name and app to handle special characters
  const encodedName = encodeURIComponent(name);
  const encodedApp = encodeURIComponent(app);

  // Normalize type - use 'unknown' for invalid types
  const normalizedType: SplunkKoTypeWithUnknown = isValidKoType(type) ? type : 'unknown';

  // Get the URL path template for this KO type
  const pathTemplate = KO_URL_TEMPLATES[normalizedType];

  if (!pathTemplate) {
    if (import.meta.env.DEV) {
      console.warn(`Unknown knowledge object type: ${type}, using fallback URL pattern`);
    }
    return null;
  }

  // Build the path
  const path = pathTemplate(encodedApp, encodedName);

  // Construct full URL
  const baseUrl = `${config.protocol}://${config.host}:${config.port}`;
  const locale = 'en-US'; // Could be made configurable via env var

  return `${baseUrl}/${locale}${path}`;
}

/**
 * Check if Splunk Web UI URL generation is available
 * (i.e., required environment variables are configured)
 */
export function isSplunkWebUrlAvailable(): boolean {
  return getSplunkWebConfig() !== null;
}
