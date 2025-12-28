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
export {
  formatValidationError,
  logValidationError,
  type FormattedValidationIssue,
  type ValidationErrorLog,
} from './validation-logger';
export {
  logSplParseError,
  logSplAnalysisError,
  logSplSearchError,
  logSplWarning,
  type SplErrorSeverity,
  type SplParseErrorContext,
  type SplAnalysisErrorContext,
  type SplSearchErrorContext,
} from './spl-error-logger';

// Core knowledge object types (used by entities layer)
export { SPLUNK_KO_TYPES, isValidKoType, type SplunkKoType } from './ko-types';

// Security utilities
export {
  escapeRegex,
  sanitizeElement,
  escapeHtml,
  sanitizeAttribute,
} from './security';
export { isValidNodeId, validateNodeId } from './security/validation';

// SPL Safety utilities
export {
  detectRiskyCommands,
  removeRiskyCommands,
  type RiskyCommand,
  type RiskyCommandsResult,
} from './spl-safety';
