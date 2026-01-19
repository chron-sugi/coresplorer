/**
 * API configuration
 *
 * Centralized endpoints used by the app for fetching static JSON
 * assets (graph, meta) and any other API routes. Uses `import.meta.env` to
 * compose runtime-safe URLs.
 *
 * Supports two modes:
 * 1. Static mode: Loads JSON files from the public folder (default)
 * 2. Splunk mode: Connects to a live Splunk server API (when configured)
 *
 * All paths are now configured via environment variables in .env files.
 *
 * @module shared/config/api.config
 */

/**
 * Splunk server configuration from environment variables
 */
const splunkConfig = {
  host: import.meta.env.VITE_SPLUNK_HOST,
  port: import.meta.env.VITE_SPLUNK_PORT,
  protocol: import.meta.env.VITE_SPLUNK_PROTOCOL || 'https',
  token: import.meta.env.VITE_SPLUNK_TOKEN,
} as const;

/**
 * Build base URL for Splunk server API
 * Returns null if Splunk configuration is incomplete
 */
const getSplunkBaseUrl = (): string | null => {
  if (!splunkConfig.host || !splunkConfig.port) {
    return null;
  }
  return `${splunkConfig.protocol}://${splunkConfig.host}:${splunkConfig.port}`;
};

/**
 * Determine if we should use Splunk server mode
 *
 * Requires both:
 * 1. Valid Splunk configuration (host/port)
 * 2. Explicit opt-in via VITE_USE_SPLUNK_API='true'
 */
const shouldUseSplunkMode = (): boolean => {
  const isEnabled = import.meta.env.VITE_USE_SPLUNK_API === 'true';
  const hasConfig = getSplunkBaseUrl() !== null;

  return isEnabled && hasConfig;
};

/**
 * Get base path for static assets
 * Uses BASE_URL which is set by Vite based on VITE_BASE_PATH
 */
const getBasePath = (): string => {
  const base = import.meta.env.BASE_URL;
  return base.endsWith('/') ? base : `${base}/`;
};

/**
 * Build full path for static data files
 */
const buildStaticPath = (relativePath: string): string => {
  const base = getBasePath();
  // Remove leading slash from relativePath to avoid double slashes
  const path = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  return `${base}${path}`;
};

/**
 * API configuration object
 * Endpoints automatically switch between static files and Splunk API
 * based on environment variable configuration
 */
export const apiConfig = {
  /**
   * API endpoints
   */
  endpoints: {
    /** Metadata about the knowledge object snapshot */
    meta: shouldUseSplunkMode()
      ? `${getSplunkBaseUrl()}/services/data/meta`
      : buildStaticPath(import.meta.env.VITE_DATA_META_PATH || 'data/meta.json'),

    /** Flat KO list for home/index page */
    index: shouldUseSplunkMode()
      ? `${getSplunkBaseUrl()}/services/data/indexes`
      : buildStaticPath(import.meta.env.VITE_DATA_INDEX_PATH || 'index.json'),

    /** Full graph with nodes and edges for diagram page */
    graph: shouldUseSplunkMode()
      ? `${getSplunkBaseUrl()}/services/data/graph`
      : buildStaticPath(import.meta.env.VITE_DATA_GRAPH_PATH || 'graph.json'),

    /** Node details endpoint */
    nodeDetails: shouldUseSplunkMode()
      ? `${getSplunkBaseUrl()}/services/data/objects`
      : buildStaticPath(import.meta.env.VITE_DATA_OBJECTS_PATH || 'objects'),

    /** Release notes data */
    releaseNotes: buildStaticPath(
      import.meta.env.VITE_DATA_RELEASE_NOTES_PATH || 'data/release_notes.json'
    ),
  },

  /**
   * Base path for static assets
   */
  basePath: getBasePath(),

  /**
   * Splunk server configuration (if available)
   */
  splunk: {
    enabled: shouldUseSplunkMode(),
    baseUrl: getSplunkBaseUrl(),
    token: splunkConfig.token,
  },
} as const;
