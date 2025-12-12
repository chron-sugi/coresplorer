/**
 * SPL Command Pattern Registry
 *
 * Aggregates all command patterns from modular files and provides
 * the public API for pattern lookups.
 *
 * @module entities/spl/lib/parser/patterns/registry
 */

import type { CommandSyntax, PatternRegistry } from './types';
import { allCommands } from './commands';

// Re-export all command patterns for backward compatibility
export * from './commands';

// =============================================================================
// PATTERN REGISTRY
// =============================================================================

/**
 * Registry of all command syntax patterns
 *
 * Maps command names to their syntax definitions.
 * This serves as the single source of truth for command syntax.
 *
 * Command patterns are organized into modules by category:
 * - aggregation: stats, chart, timechart, top, rare
 * - field-creators: eval, rex, lookup, spath, etc.
 * - field-modifiers: bin, rename, fillnull, convert, etc.
 * - filters: where, search, dedup, table, fields, etc.
 * - pipeline: join, append, union, foreach, etc.
 * - results: sort, transaction, format, transpose, etc.
 * - generators: makeresults, gentimes, metadata
 * - metrics: mstats, mcatalog, mpreview, etc.
 * - output: outputlookup, outputcsv, sendemail, etc.
 * - misc: remaining utility commands
 */
export const COMMAND_PATTERNS: PatternRegistry = allCommands;

// =============================================================================
// PATTERN REGISTRY API
// =============================================================================

/**
 * Get the syntax pattern definition for a SPL command.
 *
 * This is the primary lookup function for command patterns. It returns the
 * full CommandSyntax definition which includes:
 * - `syntax`: BNF-style grammar structure
 * - `semantics`: Field creation/consumption metadata for lineage tracking
 *
 * Command names are case-insensitive (normalized to lowercase internally).
 *
 * @param commandName - Name of the SPL command (e.g., 'bin', 'eval', 'stats')
 * @returns The CommandSyntax definition if found, undefined otherwise
 *
 * @example
 * ```typescript
 * const pattern = getCommandPattern('eval');
 * if (pattern) {
 *   console.log(pattern.semantics.creates); // Fields created by eval
 * }
 * ```
 */
export function getCommandPattern(commandName: string): CommandSyntax | undefined {
  return COMMAND_PATTERNS[commandName.toLowerCase()];
}

/**
 * Check if a SPL command has a pattern definition in the registry.
 *
 * Use this for existence checks when you don't need the full pattern.
 * More readable than `getCommandPattern(cmd) !== undefined` and
 * encapsulates the case normalization logic.
 *
 * @param commandName - Name of the SPL command (case-insensitive)
 * @returns true if a pattern exists for this command, false otherwise
 *
 * @example
 * ```typescript
 * if (hasPattern('customcommand')) {
 *   // Command has pattern-based field tracking
 * } else {
 *   // Fall back to generic handling
 * }
 * ```
 */
export function hasPattern(commandName: string): boolean {
  return commandName.toLowerCase() in COMMAND_PATTERNS;
}

/**
 * Get all registered SPL command names.
 *
 * Returns the keys of the COMMAND_PATTERNS registry. Useful for:
 * - Building autocomplete suggestions
 * - Validating command names
 * - Generating documentation
 *
 * Note: Command names are lowercase. Some commands may be aliases
 * (e.g., 'bucket' -> binCommand, stats family shares statsCommand).
 *
 * @returns Array of all registered command names (lowercase)
 *
 * @example
 * ```typescript
 * const commands = getAllCommandNames();
 * // ['bin', 'rename', 'eval', 'stats', 'eventstats', ...]
 * ```
 */
export function getAllCommandNames(): string[] {
  return Object.keys(COMMAND_PATTERNS);
}
