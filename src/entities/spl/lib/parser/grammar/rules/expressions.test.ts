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
});
