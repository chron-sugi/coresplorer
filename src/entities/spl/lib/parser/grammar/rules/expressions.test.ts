/**
 * Expression Rules Tests
 * 
 * Tests for arithmetic, logical, and comparison expressions.
 */

import { describe, it, expect } from 'vitest';
import { parse, hasChild } from '../../testing';

describe('Expression Rules', () => {
  describe('arithmetic expressions', () => {
    it('parses addition', () => {
      const cst = parse('| eval x = a + b');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses subtraction', () => {
      const cst = parse('| eval x = a - b');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses multiplication', () => {
      const cst = parse('| eval x = a * b');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses division', () => {
      const cst = parse('| eval x = a / b');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses modulo', () => {
      const cst = parse('| eval x = a % b');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses complex arithmetic', () => {
      const cst = parse('| eval x = (a + b) * c / d - e');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses negative numbers', () => {
      const cst = parse('| eval x = -5');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses unary minus on number', () => {
      // Unary minus on numbers works
      const cst = parse('| eval x = -5');
      expect(hasChild(cst, 'command')).toBe(true);
    });
  });

  describe('comparison expressions', () => {
    it('parses equals', () => {
      const cst = parse('| where status = 200');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses not equals', () => {
      const cst = parse('| where status != 500');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses less than', () => {
      const cst = parse('| where count < 100');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses less than or equal', () => {
      const cst = parse('| where count <= 100');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses greater than', () => {
      const cst = parse('| where count > 0');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses greater than or equal', () => {
      const cst = parse('| where count >= 10');
      expect(hasChild(cst, 'command')).toBe(true);
    });
  });

  describe('logical expressions', () => {
    it('parses AND', () => {
      const cst = parse('| where a = 1 AND b = 2');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses OR', () => {
      const cst = parse('| where a = 1 OR b = 2');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses NOT', () => {
      const cst = parse('| where NOT status = 500');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses complex logical expressions', () => {
      const cst = parse('| where (a = 1 OR b = 2) AND NOT c = 3');
      expect(hasChild(cst, 'command')).toBe(true);
    });
  });

  describe('function calls', () => {
    it('parses function with no args', () => {
      const cst = parse('| eval x = now()');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses function with single arg', () => {
      const cst = parse('| eval x = lower(host)');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses function with multiple args', () => {
      const cst = parse('| eval x = if(status=200, "ok", "error")');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses nested function calls', () => {
      // Nested calls with string literals work
      const cst = parse('| eval x = upper(trim("hello"))');
      expect(hasChild(cst, 'command')).toBe(true);
    });
  });

  describe('literals', () => {
    it('parses string literals', () => {
      const cst = parse('| eval x = "hello world"');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses number literals', () => {
      const cst = parse('| eval x = 42');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses boolean literals', () => {
      const cst = parse('| eval x = true');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses null literal', () => {
      const cst = parse('| eval x = null');
      expect(hasChild(cst, 'command')).toBe(true);
    });
  });

  describe('parenthesized expressions', () => {
    it('parses parenthesized expression', () => {
      const cst = parse('| eval x = (a + b)');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses nested parentheses', () => {
      const cst = parse('| eval x = ((a + b) * (c - d))');
      expect(hasChild(cst, 'command')).toBe(true);
    });
  });

  describe('LIKE operator', () => {
    it('parses LIKE with wildcard pattern', () => {
      const cst = parse('| where host LIKE "web%"');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses LIKE with field reference', () => {
      const cst = parse('| where message LIKE pattern');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses like() function (SPL function)', () => {
      const cst = parse('| where like(host, "web%")');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses LIKE in complex expression', () => {
      const cst = parse('| where host LIKE "web%" AND status = 200');
      expect(hasChild(cst, 'command')).toBe(true);
    });
  });

  describe('IN operator', () => {
    it('parses IN with number list', () => {
      const cst = parse('| where status IN (200, 201, 204)');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses IN with string list', () => {
      const cst = parse('| where host IN ("web1", "web2", "web3")');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses IN with single value', () => {
      const cst = parse('| where status IN (200)');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses IN in complex expression', () => {
      const cst = parse('| where status IN (200, 201) AND host = "web1"');
      expect(hasChild(cst, 'command')).toBe(true);
    });
  });

  describe('NOT IN operator', () => {
    it('parses NOT IN with number list', () => {
      const cst = parse('| where status NOT IN (400, 500, 503)');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses NOT IN with string list', () => {
      const cst = parse('| where host NOT IN ("localhost", "127.0.0.1")');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses NOT IN in complex expression', () => {
      const cst = parse('| where status NOT IN (400, 500) OR host = "special"');
      expect(hasChild(cst, 'command')).toBe(true);
    });
  });

  describe('BETWEEN operator', () => {
    it('parses BETWEEN with numbers', () => {
      const cst = parse('| where count BETWEEN 10 AND 100');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses BETWEEN with field references', () => {
      const cst = parse('| where value BETWEEN minVal AND maxVal');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses BETWEEN in complex expression', () => {
      const cst = parse('| where count BETWEEN 10 AND 100 OR status = 200');
      expect(hasChild(cst, 'command')).toBe(true);
    });
  });
});
