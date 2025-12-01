/**
 * SPLinter Feature Constants
 *
 * UI and editor-specific configuration for the SPLinter feature.
 * SPL domain knowledge (commands, patterns, linting) is in src/entities/spl.
 * 
 * @module features/splinter/model/constants/splinter.constants
 */

import {
  SPL_PATTERNS as _SPL_PATTERNS,
  FIELD_PATTERNS as _FIELD_PATTERNS,
  LINTER_PATTERNS as _LINTER_PATTERNS,
} from '@/entities/spl';

// Re-export domain patterns for external use
export const SPL_PATTERNS = _SPL_PATTERNS;
export const FIELD_PATTERNS = _FIELD_PATTERNS;
export const LINTER_PATTERNS = _LINTER_PATTERNS;

// Backward compatibility alias
export const SPL_REGEX = {
  EVAL_ASSIGNMENT: _FIELD_PATTERNS.EVAL_ASSIGNMENT,
  EVAL_ASSIGNMENT_WITH_CONTENT: _FIELD_PATTERNS.EVAL_ASSIGNMENT_WITH_CONTENT,
  ASSIGNMENT_OPERATOR: _FIELD_PATTERNS.ASSIGNMENT_OPERATOR,
  REX_CAPTURE: _FIELD_PATTERNS.REX_CAPTURE,
  STATS_AS: _FIELD_PATTERNS.STATS_AS,
  JOIN_COMMAND: _LINTER_PATTERNS.JOIN_COMMAND,
  TRANSACTION_COMMAND: _LINTER_PATTERNS.TRANSACTION_COMMAND,
  REALTIME_EARLIEST: _LINTER_PATTERNS.REALTIME_EARLIEST,
  REALTIME_LATEST: _LINTER_PATTERNS.REALTIME_LATEST,
  LEADING_WILDCARD: _LINTER_PATTERNS.LEADING_WILDCARD,
  PIPE_START: _SPL_PATTERNS.PIPE_START,
  COMMAND_EXTRACT: _SPL_PATTERNS.COMMAND_EXTRACT,
  FIELD_ASSIGNMENT: _FIELD_PATTERNS.FIELD_ASSIGNMENT,
  SUBSEARCH_START: '[',
  SUBSEARCH_END: ']',
} as const;

// =============================================================================
// SPLINTER-SPECIFIC UI CONFIGURATION
// =============================================================================

import { editorConfig } from '@/shared/config';

export const ANALYSIS_CONFIG = {
  TOP_FIELDS_LIMIT: 10,
};

export const EDITOR_LAYOUT = {
  LINE_HEIGHT: editorConfig.LINE_HEIGHT,
  PADDING: editorConfig.PADDING_Y,
  THEME_BG: '#2d2d2d',
};

export const SCHEMA_TYPES = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
} as const;
