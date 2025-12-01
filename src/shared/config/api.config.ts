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
const useSplunkMode = (): boolean => {
  const isEnabled = import.meta.env.VITE_USE_SPLUNK_API === 'true';
  const hasConfig = getSplunkBaseUrl() !== null;
  
  return isEnabled && hasConfig;
};

/**
 * Base URL - either Splunk server or static files
 */
const baseUrl = getSplunkBaseUrl() || import.meta.env.BASE_URL;

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
    meta: useSplunkMode() 
      ? `${baseUrl}/services/data/meta` 
      : `${import.meta.env.BASE_URL}data/meta.json`,
    
    /** Flat KO list for home/index page */
    index: useSplunkMode()
      ? `${baseUrl}/services/data/indexes`
      : `${import.meta.env.BASE_URL}index.json`,
    
    /** Full graph with nodes and edges for diagram page */
    graph: useSplunkMode()
      ? `${baseUrl}/services/data/graph`
      : `${import.meta.env.BASE_URL}graph.json`,
    
    /** Node details endpoint */
    nodeDetails: useSplunkMode()
      ? `${baseUrl}/services/data/objects`
      : `${import.meta.env.BASE_URL}objects`,
  },
  
  /**
   * Base path for static assets
   */
  basePath: `${import.meta.env.BASE_URL}`,
  
  /**
   * Splunk server configuration (if available)
   */
  splunk: {
    enabled: useSplunkMode(),
    baseUrl: getSplunkBaseUrl(),
    token: splunkConfig.token,
  },
} as const;
