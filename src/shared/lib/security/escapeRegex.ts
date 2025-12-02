/**
 * Regex Escape Utility
 *
 * Escapes special regex metacharacters to prevent ReDoS attacks
 * and ensure safe regex pattern construction from user input.
 *
 * @module shared/lib/security/escapeRegex
 */

/**
 * Escape all regex metacharacters in a string.
 *
 * This prevents ReDoS (Regular Expression Denial of Service) attacks
 * when user input is used to construct regex patterns.
 *
 * @param str - String to escape
 * @returns Escaped string safe for use in RegExp constructor
 *
 * @example
 * const userInput = '(a+)+$'; // malicious ReDoS pattern
 * const safePattern = escapeRegex(userInput);
 * const regex = new RegExp(safePattern, 'gi'); // Safe!
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
