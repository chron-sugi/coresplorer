/**
 * Tests for SPL pattern validation
 *
 * @module entities/spl/lib/parser/patterns/validator.test
 */

import { describe, it, expect } from 'vitest';
import {
  validateCommandSyntax,
  validatePattern,
  validateRegistry,
  isRegistryValid,
  getValidationSummary,
} from './validator.test-utils';
import type {
  TypedParam,
  Literal,
  Sequence,
  Alternation,
  Group,
  CommandSyntax,
} from './types';

describe('Pattern Validation', () => {
  describe('validatePattern - TypedParam', () => {
    it('validates valid TypedParam', () => {
      const param: TypedParam = {
        kind: 'param',
        type: 'field',
        name: 'testField',
        effect: 'creates',
      };

      const result = validatePattern(param);

      expect(result.valid).toBe(true);
    });

    it('validates all param types', () => {
      const validTypes = [
        'field',
        'wc-field',
        'evaled-field',
        'field-list',
        'int',
        'num',
        'string',
        'stats-func',
        'bool',
        'time-modifier',
      ];

      validTypes.forEach(type => {
        const param: TypedParam = { kind: 'param', type: type as any };
        const result = validatePattern(param);
        expect(result.valid).toBe(true);
      });
    });

    it('rejects invalid param type', () => {
      const param = {
        kind: 'param',
        type: 'invalid-type',
      } as any;

      const result = validatePattern(param);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('Invalid parameter type');
    });

    it('rejects missing type', () => {
      const param = { kind: 'param' } as any;

      const result = validatePattern(param);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('must have a "type" property');
    });

    it('validates all quantifiers', () => {
      const validQuantifiers = ['?', '+', '*', '1'];

      validQuantifiers.forEach(quantifier => {
        const param: TypedParam = {
          kind: 'param',
          type: 'field',
          quantifier: quantifier as any,
        };
        const result = validatePattern(param);
        expect(result.valid).toBe(true);
      });
    });

    it('rejects invalid quantifier', () => {
      const param = {
        kind: 'param',
        type: 'field',
        quantifier: '^',
      } as any;

      const result = validatePattern(param);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('Invalid quantifier');
    });

    it('validates all field effects', () => {
      const validEffects = ['creates', 'consumes', 'modifies', 'groups-by'];

      validEffects.forEach(effect => {
        const param: TypedParam = {
          kind: 'param',
          type: 'field',
          effect: effect as any,
        };
        const result = validatePattern(param);
        expect(result.valid).toBe(true);
      });
    });

    it('rejects invalid field effect', () => {
      const param = {
        kind: 'param',
        type: 'field',
        effect: 'invalid-effect',
      } as any;

      const result = validatePattern(param);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('Invalid field effect');
    });

    it('warns when field param has no effect', () => {
      const param: TypedParam = {
        kind: 'param',
        type: 'field',
        name: 'testField',
      };

      const result = validatePattern(param);

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].message).toContain('has no effect specified');
    });

    it('does not warn when non-field param has no effect', () => {
      const param: TypedParam = {
        kind: 'param',
        type: 'int',
        name: 'count',
      };

      const result = validatePattern(param);

      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('validatePattern - Literal', () => {
    it('validates valid Literal', () => {
      const literal: Literal = { kind: 'literal', value: 'as' };

      const result = validatePattern(literal);

      expect(result.valid).toBe(true);
    });

    it('rejects empty value', () => {
      const literal: Literal = { kind: 'literal', value: '' };

      const result = validatePattern(literal);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('non-empty "value" property');
    });

    it('rejects whitespace-only value', () => {
      const literal: Literal = { kind: 'literal', value: '   ' };

      const result = validatePattern(literal);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('warns about unusual quantifiers', () => {
      const literal: Literal = {
        kind: 'literal',
        value: 'test',
        quantifier: '+',
      };

      const result = validatePattern(literal);

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].message).toContain('repetition quantifier');
    });

    it('does not warn about optional quantifier', () => {
      const literal: Literal = {
        kind: 'literal',
        value: 'test',
        quantifier: '?',
      };

      const result = validatePattern(literal);

      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('validatePattern - Sequence', () => {
    it('validates valid Sequence', () => {
      const sequence: Sequence = {
        kind: 'sequence',
        patterns: [
          { kind: 'param', type: 'field', effect: 'consumes' },
          { kind: 'literal', value: 'as' },
          { kind: 'param', type: 'field', effect: 'creates' },
        ],
      };

      const result = validatePattern(sequence);

      expect(result.valid).toBe(true);
    });

    it('rejects missing patterns array', () => {
      const sequence = { kind: 'sequence' } as any;

      const result = validatePattern(sequence);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('must have a "patterns" array');
    });

    it('rejects non-array patterns', () => {
      const sequence = { kind: 'sequence', patterns: 'not-array' } as any;

      const result = validatePattern(sequence);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('must be an array');
    });

    it('rejects empty patterns array', () => {
      const sequence: Sequence = { kind: 'sequence', patterns: [] };

      const result = validatePattern(sequence);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('at least one pattern');
    });

    it('warns about single pattern sequences', () => {
      const sequence: Sequence = {
        kind: 'sequence',
        patterns: [{ kind: 'literal', value: 'test' }],
      };

      const result = validatePattern(sequence);

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].message).toContain('only one pattern');
    });

    it('recursively validates child patterns', () => {
      const sequence: Sequence = {
        kind: 'sequence',
        patterns: [
          { kind: 'param', type: 'invalid' as any },
          { kind: 'literal', value: 'as' },
        ],
      };

      const result = validatePattern(sequence);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].path).toContain('patterns[0]');
    });
  });

  describe('validatePattern - Alternation', () => {
    it('validates valid Alternation', () => {
      const alternation: Alternation = {
        kind: 'alternation',
        options: [
          { kind: 'literal', value: 'output' },
          { kind: 'literal', value: 'outputnew' },
        ],
      };

      const result = validatePattern(alternation);

      expect(result.valid).toBe(true);
    });

    it('rejects missing options array', () => {
      const alternation = { kind: 'alternation' } as any;

      const result = validatePattern(alternation);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('must have an "options" array');
    });

    it('rejects non-array options', () => {
      const alternation = {
        kind: 'alternation',
        options: 'not-array',
      } as any;

      const result = validatePattern(alternation);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('must be an array');
    });

    it('rejects alternation with fewer than 2 options', () => {
      const alternation: Alternation = {
        kind: 'alternation',
        options: [{ kind: 'literal', value: 'single' }],
      };

      const result = validatePattern(alternation);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].message).toContain('Alternation typically has 2+ options');
    });

    it('recursively validates child options', () => {
      const alternation: Alternation = {
        kind: 'alternation',
        options: [
          { kind: 'param', type: 'field', effect: 'creates' },
          { kind: 'param', type: 'invalid' as any },
        ],
      };

      const result = validatePattern(alternation);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].path).toContain('options[1]');
    });
  });

  describe('validatePattern - Group', () => {
    it('validates valid Group', () => {
      const group: Group = {
        kind: 'group',
        quantifier: '+',
        pattern: { kind: 'literal', value: 'test' },
      };

      const result = validatePattern(group);

      expect(result.valid).toBe(true);
    });

    it('rejects missing pattern', () => {
      const group = { kind: 'group', quantifier: '+' } as any;

      const result = validatePattern(group);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('must have a "pattern" property');
    });

    it('warns when group has no quantifier', () => {
      const group: Group = {
        kind: 'group',
        pattern: { kind: 'literal', value: 'test' },
      };

      const result = validatePattern(group);

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].message).toContain('no quantifier');
    });

    it('recursively validates child pattern', () => {
      const group: Group = {
        kind: 'group',
        quantifier: '+',
        pattern: { kind: 'param', type: 'invalid' as any },
      };

      const result = validatePattern(group);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].path).toContain('.pattern');
    });
  });

  describe('validatePattern - General', () => {
    it('rejects pattern without kind', () => {
      const pattern = { type: 'field' } as any;

      const result = validatePattern(pattern);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('must have a "kind" property');
    });

    it('rejects pattern with unknown kind', () => {
      const pattern = { kind: 'unknown' } as any;

      const result = validatePattern(pattern);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('Unknown pattern kind');
    });
  });

  describe('validateCommandSyntax', () => {
    it('validates valid command', () => {
      const command: CommandSyntax = {
        command: 'rename',
        syntax: {
          kind: 'sequence',
          patterns: [
            { kind: 'param', type: 'field', effect: 'consumes' },
            { kind: 'literal', value: 'as' },
            { kind: 'param', type: 'field', effect: 'creates' },
          ],
        },
        examples: ['rename foo as bar'],
      };

      const result = validateCommandSyntax(command);

      expect(result.valid).toBe(true);
    });

    it('rejects missing command name', () => {
      const command = {
        syntax: { kind: 'literal', value: 'test' },
      } as any;

      const result = validateCommandSyntax(command);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('Command name is required');
    });

    it('rejects empty command name', () => {
      const command: CommandSyntax = {
        command: '   ',
        syntax: { kind: 'literal', value: 'test' },
      };

      const result = validateCommandSyntax(command);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('cannot be empty');
    });

    it('validates syntax pattern', () => {
      const command: CommandSyntax = {
        command: 'test',
        syntax: { kind: 'param', type: 'invalid' as any },
      };

      const result = validateCommandSyntax(command);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('rejects non-array examples', () => {
      const command = {
        command: 'test',
        syntax: { kind: 'literal', value: 'test' },
        examples: 'not-array',
      } as any;

      const result = validateCommandSyntax(command);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('must be an array');
    });

    it('warns about empty examples array', () => {
      const command: CommandSyntax = {
        command: 'test',
        syntax: { kind: 'literal', value: 'test' },
        examples: [],
      };

      const result = validateCommandSyntax(command);

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].message).toContain('Examples array is empty');
    });
  });

  describe('validateRegistry', () => {
    it('validates all commands in registry', () => {
      const registry = {
        rename: {
          command: 'rename',
          syntax: {
            kind: 'sequence',
            patterns: [
              { kind: 'param', type: 'field', effect: 'consumes' },
              { kind: 'literal', value: 'as' },
              { kind: 'param', type: 'field', effect: 'creates' },
            ],
          },
        },
        bin: {
          command: 'bin',
          syntax: {
            kind: 'param',
            type: 'field',
            effect: 'modifies',
          },
        },
      } as Record<string, CommandSyntax>;

      const results = validateRegistry(registry);

      expect(Object.keys(results)).toHaveLength(2);
      expect(results.rename.valid).toBe(true);
      expect(results.bin.valid).toBe(true);
    });

    it('detects invalid commands', () => {
      const registry = {
        valid: {
          command: 'valid',
          syntax: { kind: 'literal', value: 'test' },
        },
        invalid: {
          command: '',
          syntax: { kind: 'literal', value: 'test' },
        },
      } as Record<string, CommandSyntax>;

      const results = validateRegistry(registry);

      expect(results.valid.valid).toBe(true);
      expect(results.invalid.valid).toBe(false);
    });
  });

  describe('isRegistryValid', () => {
    it('returns true for valid registry', () => {
      const registry = {
        test: {
          command: 'test',
          syntax: { kind: 'literal', value: 'test' },
        },
      } as Record<string, CommandSyntax>;

      expect(isRegistryValid(registry)).toBe(true);
    });

    it('returns false for invalid registry', () => {
      const registry = {
        invalid: {
          command: '',
          syntax: { kind: 'literal', value: 'test' },
        },
      } as Record<string, CommandSyntax>;

      expect(isRegistryValid(registry)).toBe(false);
    });

    it('returns false if any command is invalid', () => {
      const registry = {
        valid: {
          command: 'valid',
          syntax: { kind: 'literal', value: 'test' },
        },
        invalid: {
          command: '',
          syntax: { kind: 'literal', value: 'test' },
        },
      } as Record<string, CommandSyntax>;

      expect(isRegistryValid(registry)).toBe(false);
    });
  });

  describe('getValidationSummary', () => {
    it('summarizes validation results', () => {
      const results = {
        valid1: {
          valid: true,
          errors: [],
          warnings: [],
        },
        valid2: {
          valid: true,
          errors: [],
          warnings: [{ message: 'warning' }],
        },
        invalid: {
          valid: false,
          errors: [{ message: 'error1' }, { message: 'error2' }],
          warnings: [],
        },
      };

      const summary = getValidationSummary(results);

      expect(summary).toContain('3 commands');
      expect(summary).toContain('2 valid');
      expect(summary).toContain('1 invalid');
      expect(summary).toContain('2 errors');
      expect(summary).toContain('1 warnings');
    });

    it('handles empty registry', () => {
      const results = {};

      const summary = getValidationSummary(results);

      expect(summary).toContain('0 commands');
      expect(summary).toContain('0 valid');
      expect(summary).toContain('0 invalid');
    });
  });
});
