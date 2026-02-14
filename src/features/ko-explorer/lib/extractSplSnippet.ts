/**
 * SPL Snippet Extraction Utility
 *
 * Extracts a contextual snippet from SPL code around a search term match.
 * Used to show users why a KO matched their search when the match is in SPL.
 *
 * @module features/ko-explorer/lib/extractSplSnippet
 */

/** Maximum characters to show in the snippet */
const SNIPPET_MAX_LENGTH = 120;
/** Characters of context to show before/after the match */
const CONTEXT_CHARS = 40;

/**
 * Extracts a snippet of SPL code centered around the first occurrence
 * of the search term, with surrounding context.
 *
 * @param splCode - The full SPL code string
 * @param searchTerm - The search term to find within the SPL code
 * @returns A trimmed snippet string with ellipsis indicators, or null if no match
 */
export function extractSplSnippet(splCode: string, searchTerm: string): string | null {
  if (!splCode || !searchTerm) return null;

  // Collapse whitespace (SPL can have newlines/tabs)
  const normalized = splCode.replace(/\s+/g, ' ').trim();
  const normalizedLower = normalized.toLowerCase();
  const matchIndex = normalizedLower.indexOf(searchTerm.toLowerCase());

  if (matchIndex === -1) return null;

  // Calculate snippet window
  const snippetStart = Math.max(0, matchIndex - CONTEXT_CHARS);
  const snippetEnd = Math.min(
    normalized.length,
    matchIndex + searchTerm.length + CONTEXT_CHARS
  );

  let snippet = normalized.slice(snippetStart, snippetEnd);

  // Add ellipsis indicators
  if (snippetStart > 0) snippet = '...' + snippet;
  if (snippetEnd < normalized.length) snippet = snippet + '...';

  // Enforce max length
  if (snippet.length > SNIPPET_MAX_LENGTH) {
    snippet = snippet.slice(0, SNIPPET_MAX_LENGTH - 3) + '...';
  }

  return snippet;
}
