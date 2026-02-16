/**
 * Feature Flags configuration
 *
 * Centralized feature toggles controlled by Vite environment variables.
 *
 * @module shared/config/feature-flags.config
 */

/**
 * Whether SPL field lineage analysis and UI interactions are enabled.
 *
 * Defaults to enabled unless explicitly set to 'false'.
 */
export function isFieldLineageEnabled(): boolean {
  return import.meta.env.VITE_ENABLE_FIELD_LINEAGE !== 'false';
}

export const featureFlags = {
  fieldLineage: isFieldLineageEnabled(),
} as const;

