/**
 * Core Knowledge Object Type Definitions
 *
 * Base type identifiers for Splunk knowledge objects.
 * This module lives in shared/ to avoid FSD layering violations.
 * Entity-specific metadata (icons, colors, labels) remains in entities layer.
 *
 * @module shared/lib/ko-types
 */

/**
 * Knowledge object type identifiers.
 * Single source of truth for all KO type string constants.
 */
export const SPLUNK_KO_TYPES = {
  DASHBOARD: 'dashboard',
  SAVED_SEARCH: 'saved_search',
  MACRO: 'macro',
  EVENT_TYPE: 'event_type',
  LOOKUP: 'lookup',
  DATA_MODEL: 'data_model',
  INDEX: 'index',
} as const;

/**
 * Union type of all valid Splunk knowledge object types.
 */
export type SplunkKoType = (typeof SPLUNK_KO_TYPES)[keyof typeof SPLUNK_KO_TYPES];

/**
 * Type guard to check if a string is a valid SplunkKoType.
 *
 * @param type - The string to validate
 * @returns True if the type is a valid SplunkKoType
 *
 * @example
 * ```ts
 * if (isValidKoType(unknownType)) {
 *   // unknownType is narrowed to SplunkKoType
 * }
 * ```
 */
export function isValidKoType(type: string): type is SplunkKoType {
  return Object.values(SPLUNK_KO_TYPES).includes(type as SplunkKoType);
}
