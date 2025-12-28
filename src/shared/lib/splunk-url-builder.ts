/**
 * Splunk Web UI URL Builder
 *
 * Constructs deep links to knowledge objects in the Splunk Web UI.
 * URL templates are configurable via VITE_SPLUNK_URL_* environment variables.
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
  owner?: string; // Used in URL placeholder replacement
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
 * Default URL path templates for each knowledge object type.
 * These can be overridden via VITE_SPLUNK_URL_* environment variables.
 *
 * Available placeholders: {app}, {owner}, {name}
 */
const DEFAULT_URL_TEMPLATES: Record<SplunkKoTypeWithUnknown, string> = {
  dashboard: '/app/{app}/{name}',
  saved_search: '/app/{app}/report?s={name}',
  macro: '/manager/{app}/admin/macros/{name}',
  lookup_def: '/manager/{app}/data/transforms/lookups/{name}',
  lookup_file: '/manager/{app}/data/lookups/{name}',
  data_model: '/manager/{app}/data/models/model/edit/{name}',
  event_type: '/manager/{app}/saved/eventtypes/{name}',
  index: '/manager/{app}/data/indexes/{name}',
  unknown: '/app/{app}/search',
};

/**
 * Get URL template for a KO type, with environment variable override support.
 *
 * Override any template by setting VITE_SPLUNK_URL_{TYPE} env var.
 * Example: VITE_SPLUNK_URL_SAVED_SEARCH=/app/{app}/report?s={name}
 *
 * @param type - Knowledge object type
 * @returns URL path template with {app}, {owner}, {name} placeholders
 */
function getUrlTemplate(type: SplunkKoTypeWithUnknown): string {
  const envKey = `VITE_SPLUNK_URL_${type.toUpperCase()}`;
  return import.meta.env[envKey] || DEFAULT_URL_TEMPLATES[type] || DEFAULT_URL_TEMPLATES.unknown;
}

/**
 * Replace placeholders in a URL template with actual values.
 *
 * @param template - URL template with {app}, {owner}, {name} placeholders
 * @param params - Values to substitute
 * @returns URL path with placeholders replaced
 */
function applyTemplate(template: string, params: { app: string; owner: string; name: string }): string {
  return template
    .replace(/\{app\}/g, encodeURIComponent(params.app))
    .replace(/\{owner\}/g, encodeURIComponent(params.owner))
    .replace(/\{name\}/g, encodeURIComponent(params.name));
}

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
 * // Returns: "https://localhost:8000/en-US/app/search/report?s=my_saved_search"
 * ```
 */
export function buildSplunkUrl(params: KnowledgeObjectUrlParams): string | null {
  const config = getSplunkWebConfig();

  if (!config) {
    return null;
  }

  const { name, type, app, owner = '' } = params;

  // Normalize type - use 'unknown' for invalid types
  const normalizedType: SplunkKoTypeWithUnknown = isValidKoType(type) ? type : 'unknown';

  // Get the URL template (with env var override support)
  const template = getUrlTemplate(normalizedType);

  // Apply placeholder substitution
  const path = applyTemplate(template, { app, owner, name });

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
