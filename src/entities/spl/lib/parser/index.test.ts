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

  describe('regression: command dispatch', () => {
    it('maps search command to SearchExpression stage', () => {
      const result = parseSPL('index=main | search host=web*');
      expect(result.success).toBe(true);
      expect(result.ast?.stages[1]?.type).toBe('SearchExpression');
    });

    it('maps setfields, tags, contingency, xyseries, and timewrap to dedicated AST nodes', () => {
      const result = parseSPL('index=main | setfields foo=1, bar=2 | tags outputfield=tag host | contingency host status | xyseries _time host count | timewrap 1h');
      expect(result.success).toBe(true);
      expect(result.ast?.stages[1]?.type).toBe('SetfieldsCommand');
      expect(result.ast?.stages[2]?.type).toBe('TagsCommand');
      expect(result.ast?.stages[3]?.type).toBe('ContingencyCommand');
      expect(result.ast?.stages[4]?.type).toBe('XyseriesCommand');
      expect(result.ast?.stages[5]?.type).toBe('TimewrapCommand');
    });

    it('maps metadata to GenericCommand with commandName for lineage routing', () => {
      const result = parseSPL('| metadata type=hosts');
      expect(result.success).toBe(true);
      expect(result.ast?.stages[0]?.type).toBe('GenericCommand');
      expect((result.ast?.stages[0] as any)?.commandName).toBe('metadata');
    });
  });

  describe('regression: parser edge syntax', () => {
    it('parses dotted wildcard field references', () => {
      const result = parseSPL('index=main | dedup All_Traffic.*');
      expect(result.success).toBe(true);
      const stage = result.ast?.stages[1] as any;
      expect(stage?.type).toBe('DedupCommand');
      expect(stage?.fields?.[0]?.fieldName).toBe('All_Traffic.*');
      expect(stage?.fields?.[0]?.isWildcard).toBe(true);
    });

    it('parses bucketdir positional source field with AS target', () => {
      const result = parseSPL('index=main | bucketdir _bkt AS path');
      expect(result.success).toBe(true);
      expect(result.parseErrors).toHaveLength(0);
    });

    it('parses makecontinuous span with time modifier', () => {
      const result = parseSPL('index=main | makecontinuous _time span=1h');
      expect(result.success).toBe(true);
      expect(result.parseErrors).toHaveLength(0);
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
