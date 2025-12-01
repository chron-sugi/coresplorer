/**
 * SPL Regex Patterns
 *
 * Shared regex patterns for SPL parsing, linting, and analysis.
 * Used by both domain linter and splinter features.
 *
 * @module entities/spl/model/patterns
 */

// =============================================================================
// COMMAND & STRUCTURE PATTERNS
// =============================================================================

export const SPL_PATTERNS = {
  /** Extract command name from start of line (after optional pipe) */
  COMMAND_EXTRACT: /^\|?\s*(\w+)/i,

  /** Match pipe at start of line */
  PIPE_START: /^\s*\|/,

  /** Subsearch delimiters */
  SUBSEARCH_START: '[',
  SUBSEARCH_END: ']',
} as const;

// =============================================================================
// FIELD EXTRACTION PATTERNS
// =============================================================================

export const FIELD_PATTERNS = {
  /** Match eval command at end of line (for context detection) */
  EVAL_ASSIGNMENT: /eval\s+$/i,

  /** Match eval command with content */
  EVAL_ASSIGNMENT_WITH_CONTENT: /eval\s+.*\s+$/i,

  /** Match assignment operator at start */
  ASSIGNMENT_OPERATOR: /^\s*=/,

  /** Match rex capture group opening */
  REX_CAPTURE: /\(\?<$/,

  /** Match AS keyword at end (for field aliasing) */
  STATS_AS: /AS\s+$/i,

  /** Match field assignments globally */
  FIELD_ASSIGNMENT: /\b([a-z_][a-z0-9_]*)\s*=/gi,
} as const;

// =============================================================================
// LINTER PATTERNS
// =============================================================================

export const LINTER_PATTERNS = {
  /** Detect join command */
  JOIN_COMMAND: /\bjoin\b/i,

  /** Detect transaction command */
  TRANSACTION_COMMAND: /\btransaction\b/i,

  /** Detect append/appendcols/union commands */
  APPEND_UNION_COMMAND: /\b(append|appendcols|union)\b/i,

  /** Detect mvexpand command */
  MVEXPAND_COMMAND: /\bmvexpand\b/i,

  /** Detect real-time earliest modifier */
  REALTIME_EARLIEST: /\bearliest\s*=\s*rt/i,

  /** Detect real-time latest modifier */
  REALTIME_LATEST: /\blatest\s*=\s*rt/i,

  /** Detect leading wildcards (inefficient) - anchored on whitespace or start */
  LEADING_WILDCARD: /(^|\s)\*\w+/,

  /** Detect sort 0 (removes limit) */
  SORT_NO_LIMIT: /\bsort\s+0\b/i,

  /** Detect broad time range (30+ days or years) */
  BROAD_TIME_RANGE: /earliest\s*=\s*-\s*([3-9]\d|\d{3,})d/i,

  /** Detect year-based time range */
  YEAR_TIME_RANGE: /earliest\s*=\s*-\s*\d+y/i,

  /** Detect missing index specification */
  INDEX_SPEC: /\bindex\s*=/i,

  /** Detect wildcard index */
  WILDCARD_INDEX: /\bindex\s*=\s*\*/i,
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Extract command name from a line of SPL.
 */
export function extractCommandName(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const match = trimmed.match(SPL_PATTERNS.COMMAND_EXTRACT);
  return match?.[1]?.toLowerCase() ?? null;
}

/**
 * Check if a line starts with a pipe (continuation of pipeline).
 */
export function isPipelineContinuation(line: string): boolean {
  return SPL_PATTERNS.PIPE_START.test(line);
}
