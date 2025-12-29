/**
 * Input Validation Utilities
 *
 * Validation functions for user input to prevent injection attacks.
 *
 * @module shared/lib/security/validation
 */

/**
 * Validate that a node ID is safe for use in file paths.
 *
 * Prevents path traversal attacks by ensuring the ID only contains
 * safe characters (alphanumeric, hyphens, underscores, dots).
 * Dots are allowed for filenames (e.g., "lookup.csv") but path
 * traversal patterns ("..") are blocked.
 *
 * @param nodeId - Node ID to validate
 * @returns True if the node ID is valid
 *
 * @example
 * isValidNodeId('my-node-123'); // true
 * isValidNodeId('lookup.csv'); // true
 * isValidNodeId('../../../etc/passwd'); // false
 * isValidNodeId('node<script>'); // false
 */
export function isValidNodeId(nodeId: string): boolean {
  // Block path traversal patterns first
  if (nodeId.includes('..') || nodeId.includes('/') || nodeId.includes('\\')) {
    return false;
  }

  // Block IDs that are just dots (not meaningful node IDs)
  if (/^\.+$/.test(nodeId)) {
    return false;
  }

  // Allow alphanumeric, hyphens, underscores, dots, and Splunk-specific chars
  // - Dots for filenames: "lookup.csv", "named_lookup.cs"
  // - Parens for macro args: "my_macro(1)"
  // - Brackets/asterisks for patterns: "lookup[*]"
  return /^[a-zA-Z0-9_.\-\[\]\(\)\*]+$/.test(nodeId);
}

/**
 * Validate and sanitize a node ID, returning null if invalid.
 *
 * @param nodeId - Node ID to validate
 * @returns The node ID if valid, null otherwise
 */
export function validateNodeId(nodeId: string | null | undefined): string | null {
  if (!nodeId || typeof nodeId !== 'string') {
    return null;
  }

  if (!isValidNodeId(nodeId)) {
    if (import.meta.env.DEV) {
      console.warn(`Invalid node ID format rejected: ${nodeId.substring(0, 50)}`);
    }
    return null;
  }

  return nodeId;
}
