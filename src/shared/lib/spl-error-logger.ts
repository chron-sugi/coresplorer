/**
 * SPL Error Logging Utilities
 *
 * Provides structured logging for SPL parsing, analysis, and search errors
 * with actionable context for debugging.
 *
 * @module shared/lib/spl-error-logger
 */

/** Severity levels for SPL errors */
export type SplErrorSeverity = 'error' | 'warn' | 'info';

/** Context for a parsing error */
export interface SplParseErrorContext {
  functionName: string;
  spl: string;
  tokenCount?: number;
  lexErrors?: unknown[];
  parseErrors?: unknown[];
  cst?: unknown;
}

/** Context for an analysis error */
export interface SplAnalysisErrorContext {
  functionName: string;
  code: string;
  parseResultAvailable: boolean;
  astAvailable: boolean;
  lineCount?: number;
  commandMapSize?: number;
  fieldMapSize?: number;
}

/** Context for a search error */
export interface SplSearchErrorContext {
  functionName: string;
  code: string;
  searchTerm: string;
  filters: { commands: boolean; fields: boolean; text: boolean };
  parseResultAvailable: boolean;
  astAvailable: boolean;
  resultCount?: number;
}

/**
 * Extracts first N lines from SPL code for error context
 */
function extractSplSample(spl: string, maxLines: number = 5): string {
  const lines = spl.split('\n').slice(0, maxLines);
  const sample = lines.join('\n');
  const totalLines = spl.split('\n').length;
  if (totalLines > maxLines) {
    return sample + `\n... [${totalLines - maxLines} more lines]`;
  }
  return sample;
}

/**
 * Truncates a string to a maximum length with ellipsis
 */
function truncate(str: string, maxLen: number = 200): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '... [truncated]';
}

/**
 * Logs an SPL parsing error with full context
 */
export function logSplParseError(
  error: Error,
  context: SplParseErrorContext
): void {
  const timestamp = new Date().toISOString();

  console.group(`[SPL Parse Error] ${context.functionName}`);
  console.error('Timestamp:', timestamp);
  console.error('Error:', error.message);

  console.group('SPL Input (sample):');
  console.error(extractSplSample(context.spl));
  console.groupEnd();

  console.group('Parser State:');
  console.error('Token count:', context.tokenCount ?? 'unknown');
  console.error('Lex errors:', context.lexErrors?.length ?? 0);
  console.error('Parse errors:', context.parseErrors?.length ?? 0);
  console.error(
    'CST available:',
    context.cst !== undefined && context.cst !== null
  );
  console.groupEnd();

  if (context.lexErrors?.length) {
    console.group('Lexer Errors (first 3):');
    context.lexErrors.slice(0, 3).forEach((err, i) => {
      console.error(`Lex error ${i + 1}:`, err);
    });
    console.groupEnd();
  }

  if (context.parseErrors?.length) {
    console.group('Parser Errors (first 3):');
    context.parseErrors.slice(0, 3).forEach((err, i) => {
      console.error(`Parse error ${i + 1}:`, err);
    });
    console.groupEnd();
  }

  console.group('Stack Trace:');
  console.error(error.stack);
  console.groupEnd();

  console.groupEnd();
}

/**
 * Logs an SPL analysis error with full context
 */
export function logSplAnalysisError(
  error: Error,
  context: SplAnalysisErrorContext
): void {
  const timestamp = new Date().toISOString();

  console.group(`[SPL Analysis Error] ${context.functionName}`);
  console.error('Timestamp:', timestamp);
  console.error('Error:', error.message);

  console.group('Input:');
  console.error('Code sample:', extractSplSample(context.code));
  console.error(
    'Line count:',
    context.lineCount ?? context.code.split('\n').length
  );
  console.groupEnd();

  console.group('Parser State:');
  console.error('ParseResult available:', context.parseResultAvailable);
  console.error('AST available:', context.astAvailable);
  console.groupEnd();

  if (
    context.commandMapSize !== undefined ||
    context.fieldMapSize !== undefined
  ) {
    console.group('Extraction State:');
    console.error('Commands extracted:', context.commandMapSize ?? 'N/A');
    console.error('Fields extracted:', context.fieldMapSize ?? 'N/A');
    console.groupEnd();
  }

  console.group('Stack Trace:');
  console.error(error.stack);
  console.groupEnd();

  console.groupEnd();
}

/**
 * Logs an SPL search error with full context
 */
export function logSplSearchError(
  error: Error,
  context: SplSearchErrorContext
): void {
  const timestamp = new Date().toISOString();

  console.group(`[SPL Search Error] ${context.functionName}`);
  console.error('Timestamp:', timestamp);
  console.error('Error:', error.message);

  console.group('Search Parameters:');
  console.error('Search term:', truncate(context.searchTerm, 100));
  console.error('Filters:', context.filters);
  console.groupEnd();

  console.group('Input:');
  console.error('Code sample:', extractSplSample(context.code));
  console.groupEnd();

  console.group('Parser State:');
  console.error('ParseResult available:', context.parseResultAvailable);
  console.error('AST available:', context.astAvailable);
  console.error('Results before error:', context.resultCount ?? 'unknown');
  console.groupEnd();

  console.group('Stack Trace:');
  console.error(error.stack);
  console.groupEnd();

  console.groupEnd();
}

/**
 * Logs a warning for non-fatal SPL issues
 */
export function logSplWarning(
  functionName: string,
  message: string,
  details?: Record<string, unknown>
): void {
  console.group(`[SPL Warning] ${functionName}`);
  console.warn('Timestamp:', new Date().toISOString());
  console.warn('Message:', message);
  if (details) {
    console.group('Details:');
    Object.entries(details).forEach(([key, value]) => {
      console.warn(`${key}:`, value);
    });
    console.groupEnd();
  }
  console.groupEnd();
}
