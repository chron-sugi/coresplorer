/**
 * SPL Parser Integration Tests
 * 
 * Tests the public parseSPL API end-to-end.
 */

import { describe, it, expect } from 'vitest';
import { parseSPL } from './index';

describe('parseSPL Integration', () => {
  describe('successful parsing', () => {
    it('parses simple search', () => {
      const result = parseSPL('index=main');
      expect(result.success).toBe(true);
      expect(result.lexErrors).toHaveLength(0);
      expect(result.parseErrors).toHaveLength(0);
    });

    it('parses pipeline with commands', () => {
      const result = parseSPL('index=main | stats count by host');
      expect(result.success).toBe(true);
      expect(result.lexErrors).toHaveLength(0);
    });

    it('returns AST on success', () => {
      const result = parseSPL('| stats count');
      expect(result.success).toBe(true);
      expect(result.ast).toBeDefined();
    });
  });

  describe('complex pipelines', () => {
    it('parses real-world SPL query', () => {
      const spl = `
        index=web sourcetype=access_combined
        | stats count by status
        | where count > 100
        | table status, count
      `;
      const result = parseSPL(spl);
      expect(result.tokens.length).toBeGreaterThan(0);
    });

    it('parses query with stats', () => {
      const spl = `
        index=main 
        | stats count by host
      `;
      const result = parseSPL(spl);
      expect(result.success).toBe(true);
    });

    it('parses query with eval expressions', () => {
      const spl = `
        index=sales
        | eval revenue = price * quantity
        | eval final_price = revenue * 0.9
        | stats sum(final_price) as total by product
      `;
      const result = parseSPL(spl);
      expect(result.success).toBe(true);
    });

    it('parses query with complex search expression', () => {
      const spl = `
        (index=main OR index=test)
        host=prod* NOT debug
        | stats count by host
      `;
      const result = parseSPL(spl);
      expect(result.success).toBe(true);
    });

    it('parses query with macros', () => {
      const spl = '`my_base_search`';
      const result = parseSPL(spl);
      expect(result.success).toBe(true);
    });
  });

  describe('error handling', () => {
    it('reports lexer errors', () => {
      const result = parseSPL('field@invalid');
      expect(result.success).toBe(false);
      expect(result.lexErrors.length).toBeGreaterThan(0);
    });

    it('handles parse errors gracefully', () => {
      const result = parseSPL('| stats count | ??? | table host');
      // Should have errors due to ???
      expect(result.lexErrors.length + result.parseErrors.length).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('handles empty input', () => {
      const result = parseSPL('');
      expect(result.success).toBe(true);
    });

    it('handles whitespace only', () => {
      const result = parseSPL('   \n\t  ');
      expect(result.success).toBe(true);
    });

    it('handles very long field names', () => {
      const longField = 'a'.repeat(100);
      const result = parseSPL(`| eval ${longField} = 1`);
      expect(result.success).toBe(true);
    });

    it('handles unicode in string literals', () => {
      const result = parseSPL('| eval msg = "こんにちは"');
      expect(result.success).toBe(true);
    });
  });

  describe('token position tracking', () => {
    it('includes token positions in result', () => {
      const result = parseSPL('index=main');
      expect(result.tokens).toBeDefined();
      expect(result.tokens.length).toBeGreaterThan(0);
      expect(result.tokens[0]).toHaveProperty('startOffset');
      expect(result.tokens[0]).toHaveProperty('endOffset');
    });
  });
});
