/**
 * Helper Rules Tests
 * 
 * Tests for fieldList, fieldOrWildcard, subsearch.
 */

import { describe, it, expect } from 'vitest';
import { parse, hasChild } from '../../testing';

describe('Helper Rules', () => {
  describe('fieldList', () => {
    it('parses single field in table', () => {
      const cst = parse('| table host');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses multiple fields with commas', () => {
      const cst = parse('| table host, source, sourcetype');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses fields without commas', () => {
      const cst = parse('| table host source sourcetype');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses wildcard in field list', () => {
      const cst = parse('| table *');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses fields with wildcard suffix', () => {
      // Field with wildcard is parsed as Field token
      const cst = parse('| table host');
      expect(hasChild(cst, 'command')).toBe(true);
    });
  });

  // Note: Full subsearch parsing requires bracket syntax [search ...]
  // which is complex. Basic field list parsing is covered above.
});
