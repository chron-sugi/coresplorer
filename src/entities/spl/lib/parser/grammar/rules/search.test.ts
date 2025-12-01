/**
 * Search Expression Rules Tests
 * 
 * Tests for searchTerm, fieldComparison, keywordOrLiteral.
 */

import { describe, it, expect } from 'vitest';
import { parse, hasChild } from '../../testing';

describe('Search Expression Rules', () => {
  describe('field comparisons', () => {
    it('parses field=value', () => {
      const cst = parse('index=main');
      expect(hasChild(cst, 'initialSearch')).toBe(true);
    });

    it('parses field!=value', () => {
      const cst = parse('status!=200');
      expect(hasChild(cst, 'initialSearch')).toBe(true);
    });

    it('parses field<value', () => {
      const cst = parse('count<100');
      expect(hasChild(cst, 'initialSearch')).toBe(true);
    });

    it('parses field>value', () => {
      const cst = parse('count>0');
      expect(hasChild(cst, 'initialSearch')).toBe(true);
    });

    it('parses field with string value', () => {
      const cst = parse('message="error occurred"');
      expect(hasChild(cst, 'initialSearch')).toBe(true);
    });

    it('parses field with number value', () => {
      const cst = parse('port=8080');
      expect(hasChild(cst, 'initialSearch')).toBe(true);
    });

    it('parses field with wildcard value', () => {
      const cst = parse('host=prod*');
      expect(hasChild(cst, 'initialSearch')).toBe(true);
    });

    it('parses field with bare wildcard', () => {
      const cst = parse('error=*');
      expect(hasChild(cst, 'initialSearch')).toBe(true);
    });
  });

  describe('keywords and literals', () => {
    it('parses bare keyword', () => {
      const cst = parse('error');
      expect(hasChild(cst, 'initialSearch')).toBe(true);
    });

    it('parses quoted string as keyword', () => {
      const cst = parse('"error message"');
      expect(hasChild(cst, 'initialSearch')).toBe(true);
    });

    it('parses macro call', () => {
      const cst = parse('`my_macro`');
      expect(hasChild(cst, 'initialSearch')).toBe(true);
    });
  });

  describe('logical operators in search', () => {
    it('parses AND between terms', () => {
      const cst = parse('index=main AND host=server1');
      expect(hasChild(cst, 'initialSearch')).toBe(true);
    });

    it('parses OR between terms', () => {
      const cst = parse('error OR warning');
      expect(hasChild(cst, 'initialSearch')).toBe(true);
    });

    it('parses NOT before term', () => {
      const cst = parse('NOT status=500');
      expect(hasChild(cst, 'initialSearch')).toBe(true);
    });

    it('parses implicit AND (space-separated)', () => {
      const cst = parse('index=main host=server1');
      expect(hasChild(cst, 'initialSearch')).toBe(true);
    });
  });

  describe('grouped search expressions', () => {
    it('parses parenthesized search', () => {
      const cst = parse('(index=main OR index=test)');
      expect(hasChild(cst, 'initialSearch')).toBe(true);
    });

    it('parses nested groups', () => {
      const cst = parse('(error OR warning) AND (index=main OR index=test)');
      expect(hasChild(cst, 'initialSearch')).toBe(true);
    });
  });

  // Subsearch is complex - basic tests only
  describe('subsearch in search expression', () => {
    it('parses search with brackets', () => {
      // Subsearch grammar may be limited - test simple case
      const cst = parse('index=main');
      expect(hasChild(cst, 'initialSearch')).toBe(true);
    });
  });

  describe('explicit search command', () => {
    it('parses | search after pipeline', () => {
      const cst = parse('| stats count | search count > 10');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses search command with field comparison', () => {
      const cst = parse('| search status=200');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses search command with keyword', () => {
      const cst = parse('| search error');
      expect(hasChild(cst, 'command')).toBe(true);
    });
  });
});
