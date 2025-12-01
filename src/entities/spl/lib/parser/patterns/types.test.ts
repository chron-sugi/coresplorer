/**
 * Tests for SPL pattern type guards
 *
 * @module entities/spl/lib/parser/patterns/types.test
 */

import { describe, it, expect } from 'vitest';
import {
  isTypedParam,
  isLiteral,
  isSequence,
  isAlternation,
  isGroup,
} from './types';
import type {
  TypedParam,
  Literal,
  Sequence,
  Alternation,
  Group,
} from './types';

describe('Pattern Type Guards', () => {
  describe('isTypedParam', () => {
    it('identifies TypedParam correctly', () => {
      const param: TypedParam = {
        kind: 'param',
        type: 'field',
        name: 'testField',
      };

      expect(isTypedParam(param)).toBe(true);
    });

    it('rejects non-TypedParam patterns', () => {
      const literal: Literal = { kind: 'literal', value: 'as' };
      const sequence: Sequence = { kind: 'sequence', patterns: [] };
      const alternation: Alternation = { kind: 'alternation', options: [] };
      const group: Group = {
        kind: 'group',
        pattern: { kind: 'literal', value: 'test' },
      };

      expect(isTypedParam(literal)).toBe(false);
      expect(isTypedParam(sequence)).toBe(false);
      expect(isTypedParam(alternation)).toBe(false);
      expect(isTypedParam(group)).toBe(false);
    });

    it('handles different param types', () => {
      const fieldParam: TypedParam = { kind: 'param', type: 'field' };
      const wcFieldParam: TypedParam = { kind: 'param', type: 'wc-field' };
      const intParam: TypedParam = { kind: 'param', type: 'int' };
      const stringParam: TypedParam = { kind: 'param', type: 'string' };
      const statsFuncParam: TypedParam = { kind: 'param', type: 'stats-func' };

      expect(isTypedParam(fieldParam)).toBe(true);
      expect(isTypedParam(wcFieldParam)).toBe(true);
      expect(isTypedParam(intParam)).toBe(true);
      expect(isTypedParam(stringParam)).toBe(true);
      expect(isTypedParam(statsFuncParam)).toBe(true);
    });

    it('handles quantifiers', () => {
      const optional: TypedParam = {
        kind: 'param',
        type: 'field',
        quantifier: '?',
      };
      const oneOrMore: TypedParam = {
        kind: 'param',
        type: 'field',
        quantifier: '+',
      };
      const zeroOrMore: TypedParam = {
        kind: 'param',
        type: 'field',
        quantifier: '*',
      };

      expect(isTypedParam(optional)).toBe(true);
      expect(isTypedParam(oneOrMore)).toBe(true);
      expect(isTypedParam(zeroOrMore)).toBe(true);
    });

    it('handles field effects', () => {
      const creates: TypedParam = {
        kind: 'param',
        type: 'field',
        effect: 'creates',
      };
      const consumes: TypedParam = {
        kind: 'param',
        type: 'field',
        effect: 'consumes',
      };
      const modifies: TypedParam = {
        kind: 'param',
        type: 'field',
        effect: 'modifies',
      };
      const groupsBy: TypedParam = {
        kind: 'param',
        type: 'field',
        effect: 'groups-by',
      };

      expect(isTypedParam(creates)).toBe(true);
      expect(isTypedParam(consumes)).toBe(true);
      expect(isTypedParam(modifies)).toBe(true);
      expect(isTypedParam(groupsBy)).toBe(true);
    });
  });

  describe('isLiteral', () => {
    it('identifies Literal correctly', () => {
      const literal: Literal = { kind: 'literal', value: 'as' };

      expect(isLiteral(literal)).toBe(true);
    });

    it('rejects non-Literal patterns', () => {
      const param: TypedParam = { kind: 'param', type: 'field' };
      const sequence: Sequence = { kind: 'sequence', patterns: [] };
      const alternation: Alternation = { kind: 'alternation', options: [] };
      const group: Group = {
        kind: 'group',
        pattern: { kind: 'literal', value: 'test' },
      };

      expect(isLiteral(param)).toBe(false);
      expect(isLiteral(sequence)).toBe(false);
      expect(isLiteral(alternation)).toBe(false);
      expect(isLiteral(group)).toBe(false);
    });

    it('handles different literal values', () => {
      const keyword: Literal = { kind: 'literal', value: 'as' };
      const operator: Literal = { kind: 'literal', value: '=' };
      const delimiter: Literal = { kind: 'literal', value: '(' };

      expect(isLiteral(keyword)).toBe(true);
      expect(isLiteral(operator)).toBe(true);
      expect(isLiteral(delimiter)).toBe(true);
    });

    it('handles case insensitivity flag', () => {
      const caseInsensitive: Literal = {
        kind: 'literal',
        value: 'BY',
        caseInsensitive: true,
      };
      const caseSensitive: Literal = {
        kind: 'literal',
        value: '(',
        caseInsensitive: false,
      };

      expect(isLiteral(caseInsensitive)).toBe(true);
      expect(isLiteral(caseSensitive)).toBe(true);
    });
  });

  describe('isSequence', () => {
    it('identifies Sequence correctly', () => {
      const sequence: Sequence = {
        kind: 'sequence',
        patterns: [
          { kind: 'param', type: 'field' },
          { kind: 'literal', value: 'as' },
        ],
      };

      expect(isSequence(sequence)).toBe(true);
    });

    it('rejects non-Sequence patterns', () => {
      const param: TypedParam = { kind: 'param', type: 'field' };
      const literal: Literal = { kind: 'literal', value: 'as' };
      const alternation: Alternation = { kind: 'alternation', options: [] };
      const group: Group = {
        kind: 'group',
        pattern: { kind: 'literal', value: 'test' },
      };

      expect(isSequence(param)).toBe(false);
      expect(isSequence(literal)).toBe(false);
      expect(isSequence(alternation)).toBe(false);
      expect(isSequence(group)).toBe(false);
    });

    it('handles empty sequence', () => {
      const empty: Sequence = { kind: 'sequence', patterns: [] };

      expect(isSequence(empty)).toBe(true);
    });

    it('handles nested sequences', () => {
      const nested: Sequence = {
        kind: 'sequence',
        patterns: [
          {
            kind: 'sequence',
            patterns: [
              { kind: 'literal', value: 'value' },
              { kind: 'literal', value: '=' },
            ],
          },
          { kind: 'param', type: 'string' },
        ],
      };

      expect(isSequence(nested)).toBe(true);
    });
  });

  describe('isAlternation', () => {
    it('identifies Alternation correctly', () => {
      const alternation: Alternation = {
        kind: 'alternation',
        options: [
          { kind: 'literal', value: 'output' },
          { kind: 'literal', value: 'outputnew' },
        ],
      };

      expect(isAlternation(alternation)).toBe(true);
    });

    it('rejects non-Alternation patterns', () => {
      const param: TypedParam = { kind: 'param', type: 'field' };
      const literal: Literal = { kind: 'literal', value: 'as' };
      const sequence: Sequence = { kind: 'sequence', patterns: [] };
      const group: Group = {
        kind: 'group',
        pattern: { kind: 'literal', value: 'test' },
      };

      expect(isAlternation(param)).toBe(false);
      expect(isAlternation(literal)).toBe(false);
      expect(isAlternation(sequence)).toBe(false);
      expect(isAlternation(group)).toBe(false);
    });

    it('handles empty options', () => {
      const empty: Alternation = { kind: 'alternation', options: [] };

      expect(isAlternation(empty)).toBe(true);
    });

    it('handles complex alternations', () => {
      const complex: Alternation = {
        kind: 'alternation',
        options: [
          {
            kind: 'sequence',
            patterns: [
              { kind: 'literal', value: 'foo' },
              { kind: 'param', type: 'field' },
            ],
          },
          {
            kind: 'sequence',
            patterns: [
              { kind: 'literal', value: 'bar' },
              { kind: 'param', type: 'int' },
            ],
          },
        ],
      };

      expect(isAlternation(complex)).toBe(true);
    });
  });

  describe('isGroup', () => {
    it('identifies Group correctly', () => {
      const group: Group = {
        kind: 'group',
        pattern: { kind: 'literal', value: 'test' },
        quantifier: '+',
      };

      expect(isGroup(group)).toBe(true);
    });

    it('rejects non-Group patterns', () => {
      const param: TypedParam = { kind: 'param', type: 'field' };
      const literal: Literal = { kind: 'literal', value: 'as' };
      const sequence: Sequence = { kind: 'sequence', patterns: [] };
      const alternation: Alternation = { kind: 'alternation', options: [] };

      expect(isGroup(param)).toBe(false);
      expect(isGroup(literal)).toBe(false);
      expect(isGroup(sequence)).toBe(false);
      expect(isGroup(alternation)).toBe(false);
    });

    it('handles different quantifiers', () => {
      const optional: Group = {
        kind: 'group',
        pattern: { kind: 'literal', value: 'test' },
        quantifier: '?',
      };
      const oneOrMore: Group = {
        kind: 'group',
        pattern: { kind: 'literal', value: 'test' },
        quantifier: '+',
      };
      const zeroOrMore: Group = {
        kind: 'group',
        pattern: { kind: 'literal', value: 'test' },
        quantifier: '*',
      };

      expect(isGroup(optional)).toBe(true);
      expect(isGroup(oneOrMore)).toBe(true);
      expect(isGroup(zeroOrMore)).toBe(true);
    });

    it('handles nested groups', () => {
      const nested: Group = {
        kind: 'group',
        quantifier: '+',
        pattern: {
          kind: 'group',
          quantifier: '?',
          pattern: { kind: 'literal', value: 'test' },
        },
      };

      expect(isGroup(nested)).toBe(true);
    });

    it('handles group with complex pattern', () => {
      const complex: Group = {
        kind: 'group',
        quantifier: '+',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'param', type: 'wc-field', effect: 'consumes' },
            { kind: 'literal', value: 'as' },
            { kind: 'param', type: 'wc-field', effect: 'creates' },
          ],
        },
      };

      expect(isGroup(complex)).toBe(true);
    });
  });
});
