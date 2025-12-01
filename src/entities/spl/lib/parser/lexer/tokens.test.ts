/**
 * SPL Lexer Token Tests
 * 
 * Tests token patterns and ordering.
 */

import { describe, it, expect } from 'vitest';
import { SPLLexer } from './tokens';
import { lexNames } from '../testing';

describe('SPL Lexer', () => {
  describe('basic tokenization', () => {
    it('tokenizes simple search', () => {
      const tokens = lexNames('index=main');
      expect(tokens).toEqual(['Identifier', 'Equals', 'Identifier']);
    });

    it('tokenizes pipe operator', () => {
      const tokens = lexNames('search | stats count');
      expect(tokens).toEqual(['Search', 'Pipe', 'Stats', 'Identifier']);
    });

    it('skips whitespace', () => {
      const tokens = lexNames('a   b\n\tc');
      expect(tokens).toEqual(['Identifier', 'Identifier', 'Identifier']);
    });
  });

  describe('keyword recognition', () => {
    it('recognizes command keywords', () => {
      expect(lexNames('eval')[0]).toBe('Eval');
      expect(lexNames('stats')[0]).toBe('Stats');
      expect(lexNames('table')[0]).toBe('Table');
      expect(lexNames('where')[0]).toBe('Where');
      expect(lexNames('rename')[0]).toBe('Rename');
    });

    it('is case-insensitive for keywords', () => {
      expect(lexNames('EVAL')[0]).toBe('Eval');
      expect(lexNames('Stats')[0]).toBe('Stats');
      expect(lexNames('TABLE')[0]).toBe('Table');
    });

    it('does not match keywords inside identifiers', () => {
      expect(lexNames('evaluate')[0]).toBe('Identifier');
      expect(lexNames('statistics')[0]).toBe('Identifier');
      expect(lexNames('mytable')[0]).toBe('Identifier');
    });

    it('recognizes boolean keywords', () => {
      expect(lexNames('true')[0]).toBe('True');
      expect(lexNames('false')[0]).toBe('False');
      expect(lexNames('null')[0]).toBe('Null');
    });

    it('recognizes logical operators', () => {
      expect(lexNames('AND')[0]).toBe('And');
      expect(lexNames('OR')[0]).toBe('Or');
      expect(lexNames('NOT')[0]).toBe('Not');
    });
  });

  describe('operator tokenization', () => {
    it('tokenizes comparison operators', () => {
      expect(lexNames('=')[0]).toBe('Equals');
      expect(lexNames('!=')[0]).toBe('NotEquals');
      expect(lexNames('<')[0]).toBe('LessThan');
      expect(lexNames('<=')[0]).toBe('LessThanOrEqual');
      expect(lexNames('>')[0]).toBe('GreaterThan');
      expect(lexNames('>=')[0]).toBe('GreaterThanOrEqual');
    });

    it('tokenizes multi-char operators before single-char', () => {
      // != should not be tokenized as ! and =
      const tokens = lexNames('a!=b');
      expect(tokens).toEqual(['Identifier', 'NotEquals', 'Identifier']);
    });

    it('tokenizes arithmetic operators', () => {
      expect(lexNames('+')[0]).toBe('Plus');
      expect(lexNames('-')[0]).toBe('Minus');
      expect(lexNames('*')[0]).toBe('Multiply');
      expect(lexNames('/')[0]).toBe('Divide');
      expect(lexNames('%')[0]).toBe('Modulo');
    });
  });

  describe('literal tokenization', () => {
    it('tokenizes number literals', () => {
      expect(lexNames('123')[0]).toBe('NumberLiteral');
      // Negative numbers are Minus + NumberLiteral (handled by parser)
      expect(lexNames('-456')[0]).toBe('Minus');
      expect(lexNames('-456')[1]).toBe('NumberLiteral');
      expect(lexNames('3.14')[0]).toBe('NumberLiteral');
      expect(lexNames('1e10')[0]).toBe('NumberLiteral');
      expect(lexNames('2.5e-3')[0]).toBe('NumberLiteral');
    });

    it('tokenizes string literals', () => {
      expect(lexNames('"hello"')[0]).toBe('StringLiteral');
      expect(lexNames("'world'")[0]).toBe('StringLiteral');
      expect(lexNames('"with \\"escaped\\""')[0]).toBe('StringLiteral');
    });

    it('tokenizes time modifiers', () => {
      expect(lexNames('5m')[0]).toBe('TimeModifier');
      expect(lexNames('1h')[0]).toBe('TimeModifier');
      expect(lexNames('7d')[0]).toBe('TimeModifier');
      // Negative timespan now includes the sign
      expect(lexNames('-30s')[0]).toBe('TimeModifier');
      // Time with snap modifier
      expect(lexNames('-24h@h')[0]).toBe('TimeModifier');
      expect(lexNames('@d')[0]).toBe('TimeModifier');
      expect(lexNames('now')[0]).toBe('TimeModifier');
    });
  });

  describe('special patterns', () => {
    it('tokenizes macro calls', () => {
      expect(lexNames('`my_macro`')[0]).toBe('MacroCall');
      expect(lexNames('`macro(arg)`')[0]).toBe('MacroCall');
    });

    it('tokenizes wildcard fields', () => {
      // WildcardField is part of Field token pattern
      const tokens = lexNames('field*');
      expect(tokens[0]).toBe('Field');
      // *suffix is handled as Multiply + Identifier
      const suffixTokens = lexNames('*suffix');
      expect(suffixTokens[0]).toBe('Multiply');
    });

    it('tokenizes standalone wildcard as Multiply', () => {
      expect(lexNames('*')[0]).toBe('Multiply');
    });
  });

  describe('delimiter tokenization', () => {
    it('tokenizes parentheses', () => {
      const tokens = lexNames('func(a, b)');
      expect(tokens).toContain('LParen');
      expect(tokens).toContain('RParen');
      expect(tokens).toContain('Comma');
    });

    it('tokenizes brackets for subsearch', () => {
      const tokens = lexNames('[search]');
      expect(tokens).toContain('LBracket');
      expect(tokens).toContain('RBracket');
    });
  });

  describe('complex expressions', () => {
    it('tokenizes eval expression', () => {
      const tokens = lexNames('eval x = a + b * 2');
      expect(tokens).toEqual([
        'Eval', 'Identifier', 'Equals', 'Identifier', 'Plus', 'Identifier', 'Multiply', 'NumberLiteral'
      ]);
    });

    it('tokenizes stats with by clause', () => {
      const tokens = lexNames('stats count by host');
      expect(tokens).toEqual(['Stats', 'Identifier', 'By', 'Identifier']);
    });

    it('tokenizes full pipeline', () => {
      const tokens = lexNames('index=main | stats count | table _time, count');
      expect(tokens).toContain('Pipe');
      expect(tokens.filter(t => t === 'Pipe')).toHaveLength(2);
    });
  });

  describe('error handling', () => {
    it('reports lexer errors for invalid characters', () => {
      const result = SPLLexer.tokenize('field@value');
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
