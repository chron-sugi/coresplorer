/**
 * Shared Utilities
 *
 * Re-exports all shared utility functions for use across the application.
 *
 * @module shared/lib
 */

export { cn } from './utils';
export { normalizeSearch, matchesNormalized } from './normalizeSearch';
export {
  encodeUrlParam,
  decodeUrlParam,
  encodeArrayParam,
  decodeArrayParam,
} from './urlEncoding';
export { DataFetchError, DataValidationError } from './errors';
