/**
 * Scope Utilities
 *
 * Utilities for creating and managing scope contexts in field lineage analysis.
 * Scopes track whether field events occur in the root pipeline or within subsearches.
 *
 * @module entities/field/lib/lineage/scope-utils
 */

import type { ScopeContext } from '../../model/lineage.types';

/** The ID for the root (main) pipeline scope */
export const ROOT_SCOPE_ID = 'root';

/**
 * Generates a scope ID for a subsearch.
 * Format: "parent.command@Lline"
 *
 * @example
 * createSubsearchScopeId("root", "append", 5) // "root.append@L5"
 * createSubsearchScopeId("root.append@L5", "join", 10) // "root.append@L5.join@L10"
 */
export function createSubsearchScopeId(
  parentScopeId: string,
  command: string,
  line: number
): string {
  return `${parentScopeId}.${command}@L${line}`;
}

/**
 * Creates the root scope context for the main pipeline.
 */
export function createRootScope(): ScopeContext {
  return {
    id: ROOT_SCOPE_ID,
    type: 'root',
    parentId: null,
  };
}

/**
 * Creates a subsearch scope context.
 *
 * @param parentScope - The parent scope (root or another subsearch)
 * @param command - The command that creates this subsearch (e.g., "append", "join")
 * @param line - The line number where the subsearch starts
 */
export function createSubsearchScope(
  parentScope: ScopeContext,
  command: string,
  line: number
): ScopeContext {
  return {
    id: createSubsearchScopeId(parentScope.id, command, line),
    type: 'subsearch',
    parentId: parentScope.id,
    command,
    line,
  };
}

/**
 * Checks if a scope is the root scope.
 */
export function isRootScope(scope: ScopeContext): boolean {
  return scope.type === 'root';
}

/**
 * Checks if a scope is a subsearch scope.
 */
export function isSubsearchScope(scope: ScopeContext): boolean {
  return scope.type === 'subsearch';
}

/**
 * Checks if scopeA is an ancestor of scopeB (i.e., scopeB is nested within scopeA).
 * The root scope is an ancestor of all subsearch scopes.
 *
 * @example
 * isAncestorScope({ id: "root" }, { id: "root.append@L5" }) // true
 * isAncestorScope({ id: "root.append@L5" }, { id: "root" }) // false
 */
export function isAncestorScope(
  ancestorScope: ScopeContext,
  descendantScope: ScopeContext
): boolean {
  if (ancestorScope.id === descendantScope.id) {
    return false; // A scope is not its own ancestor
  }
  return descendantScope.id.startsWith(ancestorScope.id + '.');
}

/**
 * Parses a scope ID to extract its components.
 *
 * @example
 * parseScopeId("root") // { parts: ["root"], depth: 0 }
 * parseScopeId("root.append@L5") // { parts: ["root", "append@L5"], depth: 1 }
 * parseScopeId("root.append@L5.join@L10") // { parts: ["root", "append@L5", "join@L10"], depth: 2 }
 */
export function parseScopeId(scopeId: string): {
  parts: string[];
  depth: number;
} {
  const parts = scopeId.split('.');
  return {
    parts,
    depth: parts.length - 1, // root is depth 0
  };
}
