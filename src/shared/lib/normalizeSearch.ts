/**
 * Search Normalization Utility
 *
 * Provides fuzzy search matching by normalizing strings.
 * Allows "my search", "my_search", "my-search", and "MySearch" to all match.
 *
 * @module shared/lib/normalizeSearch
 */

/**
 * Normalizes a string for fuzzy search matching.
 *
 * Transformations applied:
 * - Converts to lowercase
 * - Removes underscores, hyphens, and spaces
 *
 * @param input - The string to normalize
 * @returns Normalized string for comparison
 *
 * @example
 * normalizeSearch('My Search') // 'mysearch'
 * normalizeSearch('my_search') // 'mysearch'
 * normalizeSearch('my-search') // 'mysearch'
 * normalizeSearch('MySearch')  // 'mysearch'
 */
export function normalizeSearch(input: string): string {
  if (!input) {
    return '';
  }
  return input
    .toLowerCase()
    .replace(/[_\-\s]/g, '');
}

/**
 * Checks if a value matches a search term using normalized comparison.
 *
 * @param value - The value to check
 * @param searchTerm - The search term to match against
 * @returns True if the normalized value contains the normalized search term
 *
 * @example
 * matchesNormalized('Saved Search', 'saved') // true
 * matchesNormalized('saved_search', 'Saved Search') // true
 */
export function matchesNormalized(value: string, searchTerm: string): boolean {
  if (!searchTerm) {
    return true;
  }
  return normalizeSearch(value).includes(normalizeSearch(searchTerm));
}
