/**
 * Splunk-specific configuration and utilities
 * 
 * Provides helper functions for working with Splunk REST API,
 * including authentication headers and request options.
 * 
 * @module shared/config/splunk.config
 */

/**
 * Get default headers for Splunk API requests
 * Includes authentication token if available
 */
export function getSplunkHeaders(): HeadersInit {
  const token = import.meta.env.VITE_SPLUNK_TOKEN;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Get default fetch options for Splunk API requests
 * Includes authentication and CORS settings
 */
export function getSplunkFetchOptions(customOptions: RequestInit = {}): RequestInit {
  return {
    headers: getSplunkHeaders(),
    credentials: 'include', // Include cookies for session-based auth
    ...customOptions,
  };
}

/**
 * Check if Splunk mode is enabled
 */
export function isSplunkModeEnabled(): boolean {
  return !!(
    import.meta.env.VITE_SPLUNK_HOST && 
    import.meta.env.VITE_SPLUNK_PORT
  );
}

/**
 * Splunk REST API documentation base URL
 */
export const SPLUNK_DOCS_URL = 'https://docs.splunk.com/Documentation/Splunk/latest/RESTREF' as const;

/**
 * Splunk Web UI URL builder utilities
 * Re-exported for convenient access from config module
 *
 * URL templates are configurable via VITE_SPLUNK_URL_* environment variables.
 * See .env.development for available options.
 */
export { buildSplunkUrl, isSplunkWebUrlAvailable } from '@/shared/lib/splunk-url-builder';
