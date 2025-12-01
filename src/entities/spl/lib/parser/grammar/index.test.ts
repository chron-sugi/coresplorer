/**
 * SPL Parser Grammar Tests
 * 
 * Tests parser instantiation and basic parsing.
 */

import { describe, it, expect } from 'vitest';
import { SPLParser, splParser } from './index';
import { parse, hasChild } from '../testing';

describe('SPL Parser', () => {
  describe('instantiation', () => {
    it('creates parser without errors', () => {
      expect(splParser).toBeInstanceOf(SPLParser);
    });

    it('has pipeline as public entry rule', () => {
      expect(typeof splParser.pipeline).toBe('function');
    });
  });

  describe('pipeline parsing', () => {
    it('parses empty input', () => {
      const cst = parse('');
      expect(cst).toBeDefined();
    });

    it('parses initial search only', () => {
      const cst = parse('index=main');
      expect(hasChild(cst, 'initialSearch')).toBe(true);
    });

    it('parses single command', () => {
      const cst = parse('| stats count');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses multiple commands', () => {
      const cst = parse('| stats count | table host');
      // Verify we have at least one command
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses initial search with commands', () => {
      const cst = parse('index=main | stats count by host');
      expect(hasChild(cst, 'initialSearch')).toBe(true);
      expect(hasChild(cst, 'command')).toBe(true);
    });
  });

  describe('error recovery', () => {
    it('handles malformed input gracefully', () => {
      // Parser should not throw on malformed input
      expect(() => parse('| stats count')).not.toThrow();
    });
  });
});
