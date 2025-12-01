/**
 * Structural Commands Tests
 * 
 * Tests for where, bin, fillnull, mvexpand, transaction commands.
 */

import { describe, it, expect } from 'vitest';
import { parse, hasChild } from '../../../testing';

describe('Structural Commands', () => {
  describe('where command', () => {
    it('parses simple where', () => {
      const cst = parse('| where status = 200');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses where with comparison', () => {
      const cst = parse('| where count > 100');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses where with logical operators', () => {
      const cst = parse('| where status = 200 AND count > 0');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses where with function', () => {
      // Function call with string argument
      const cst = parse('| where len("test") > 0');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses where with complex expression', () => {
      const cst = parse('| where (a = 1 OR b = 2) AND NOT c = 3');
      expect(hasChild(cst, 'command')).toBe(true);
    });
  });

  describe('bin command', () => {
    it('parses simple bin', () => {
      const cst = parse('| bin _time');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses bin with span', () => {
      const cst = parse('| bin _time span=1h');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses bin with numeric span', () => {
      const cst = parse('| bin count span=10');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses bin with alias', () => {
      const cst = parse('| bin _time as time_bucket');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses bucket (alias for bin)', () => {
      const cst = parse('| bucket _time span=5m');
      expect(hasChild(cst, 'command')).toBe(true);
    });
  });

  describe('fillnull command', () => {
    it('parses simple fillnull', () => {
      const cst = parse('| fillnull');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses fillnull with value', () => {
      const cst = parse('| fillnull value=0');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses fillnull with string value', () => {
      const cst = parse('| fillnull value="N/A"');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses fillnull with field list', () => {
      const cst = parse('| fillnull value=0 count, total');
      expect(hasChild(cst, 'command')).toBe(true);
    });
  });

  describe('mvexpand command', () => {
    it('parses simple mvexpand', () => {
      const cst = parse('| mvexpand values');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses mvexpand with limit', () => {
      const cst = parse('| mvexpand values limit=100');
      expect(hasChild(cst, 'command')).toBe(true);
    });
  });

  describe('transaction command', () => {
    it('parses simple transaction', () => {
      const cst = parse('| transaction session_id');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses transaction with multiple fields', () => {
      const cst = parse('| transaction user, session');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses transaction with maxspan option', () => {
      const cst = parse('| transaction maxspan=30m session_id');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses transaction with maxpause option', () => {
      const cst = parse('| transaction maxpause=5m user');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses transaction with keepevicted option', () => {
      const cst = parse('| transaction keepevicted=true host');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses transaction with multiple options', () => {
      const cst = parse('| transaction maxspan=1h maxpause=10m session_id, user');
      expect(hasChild(cst, 'command')).toBe(true);
    });
  });
});
