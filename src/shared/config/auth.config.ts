/**
 * Auth configuration
 *
 * Centralized endpoints for the authentication backend.
 * Uses environment variables for runtime configuration.
 *
 * @module shared/config/auth.config
 */

/**
 * Base URL for auth API
 * Defaults to localhost:8000 for local development
 */
const getAuthBaseUrl = (): string => {
  return import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8000';
};

/**
 * Whether auth is enabled (toggle via .env)
 */
const isAuthEnabled = (): boolean => {
  return import.meta.env.VITE_AUTH_ENABLED === 'true';
};

export const authConfig = {
  enabled: isAuthEnabled(),
  baseUrl: getAuthBaseUrl(),
  endpoints: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    me: '/api/auth/me',
  },
} as const;

/**
 * Build full URL for an auth endpoint
 */
export function buildAuthUrl(endpoint: string): string {
  return `${authConfig.baseUrl}${endpoint}`;
}
