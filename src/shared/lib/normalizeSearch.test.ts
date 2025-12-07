import { describe, it, expect } from 'vitest';
import { normalizeSearch, matchesNormalized } from './normalizeSearch';

describe('normalizeSearch', () => {
  describe('normalizeSearch', () => {
    it('converts to lowercase', () => {
      expect(normalizeSearch('Hello World')).toBe('helloworld');
      expect(normalizeSearch('UPPERCASE')).toBe('uppercase');
    });

    it('removes underscores', () => {
      expect(normalizeSearch('my_search')).toBe('mysearch');
      expect(normalizeSearch('saved_search_name')).toBe('savedsearchname');
    });

    it('removes hyphens', () => {
      expect(normalizeSearch('my-search')).toBe('mysearch');
      expect(normalizeSearch('saved-search-name')).toBe('savedsearchname');
    });

    it('removes spaces', () => {
      expect(normalizeSearch('my search')).toBe('mysearch');
      expect(normalizeSearch('saved search name')).toBe('savedsearchname');
    });

    it('handles mixed separators', () => {
      expect(normalizeSearch('my_search-name here')).toBe('mysearchnamehere');
      expect(normalizeSearch('My-Search_Name Here')).toBe('mysearchnamehere');
    });

    it('handles empty and falsy inputs', () => {
      expect(normalizeSearch('')).toBe('');
      // @ts-expect-error - testing runtime behavior with null
      expect(normalizeSearch(null)).toBe('');
      // @ts-expect-error - testing runtime behavior with undefined
      expect(normalizeSearch(undefined)).toBe('');
    });

    it('preserves numbers and special characters', () => {
      expect(normalizeSearch('search123')).toBe('search123');
      expect(normalizeSearch('search@domain.com')).toBe('search@domain.com');
    });
  });

  describe('matchesNormalized', () => {
    it('matches exact normalized strings', () => {
      expect(matchesNormalized('saved_search', 'saved-search')).toBe(true);
      expect(matchesNormalized('SavedSearch', 'saved search')).toBe(true);
    });

    it('matches partial strings', () => {
      expect(matchesNormalized('Saved Search', 'saved')).toBe(true);
      expect(matchesNormalized('saved_search', 'Search')).toBe(true);
    });

    it('returns true for empty search term', () => {
      expect(matchesNormalized('anything', '')).toBe(true);
    });

    it('returns false for non-matching strings', () => {
      expect(matchesNormalized('hello', 'world')).toBe(false);
      expect(matchesNormalized('saved_search', 'lookup')).toBe(false);
    });

    it('is case insensitive', () => {
      expect(matchesNormalized('SAVED SEARCH', 'saved')).toBe(true);
      expect(matchesNormalized('saved search', 'SAVED')).toBe(true);
    });
  });
});
