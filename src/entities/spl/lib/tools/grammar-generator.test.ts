/**
 * Grammar Generator Tests
 *
 * Validates Chevrotain grammar rule generation
 */

import { describe, it, expect } from 'vitest';
import { generateGrammarRule, generateGrammarRules, generateCommandTokens } from './grammar-generator';
import { getCommandPattern } from '../parser/patterns/registry';

describe('grammar-generator', () => {
  // ==========================================================================
  // SINGLE RULE GENERATION
  // ==========================================================================

  describe('generateGrammarRule', () => {
    it('generates rule for simple command (head)', () => {
      const pattern = getCommandPattern('rename')!;
      const rule = generateGrammarRule(pattern);

      console.log('\n=== RENAME GRAMMAR RULE ===');
      console.log(rule);
      console.log('==========================\n');

      expect(rule).toContain('parser.renameCommand = parser.RULE');
      expect(rule).toContain('parser.CONSUME(t.Rename)');
    });

    it('generates rule for eval command', () => {
      const pattern = getCommandPattern('eval')!;
      const rule = generateGrammarRule(pattern);

      console.log('\n=== EVAL GRAMMAR RULE ===');
      console.log(rule);
      console.log('=========================\n');

      expect(rule).toContain('parser.evalCommand = parser.RULE');
      expect(rule).toContain('parser.CONSUME(t.Eval)');
    });

    it('generates rule for stats command', () => {
      const pattern = getCommandPattern('stats')!;
      const rule = generateGrammarRule(pattern);

      console.log('\n=== STATS GRAMMAR RULE ===');
      console.log(rule);
      console.log('==========================\n');

      expect(rule).toContain('parser.statsCommand = parser.RULE');
      expect(rule).toContain('parser.CONSUME(t.Stats)');
    });

    it('generates rule for outputlookup command', () => {
      const pattern = getCommandPattern('outputlookup')!;
      const rule = generateGrammarRule(pattern);

      console.log('\n=== OUTPUTLOOKUP GRAMMAR RULE ===');
      console.log(rule);
      console.log('=================================\n');

      expect(rule).toContain('parser.outputlookupCommand = parser.RULE');
      expect(rule).toContain('parser.CONSUME(t.Outputlookup)');
    });
  });

  // ==========================================================================
  // BATCH GENERATION
  // ==========================================================================

  describe('generateGrammarRules', () => {
    it('generates rules for multiple commands', () => {
      const patterns = [
        getCommandPattern('rename')!,
        getCommandPattern('eval')!,
      ].filter(Boolean);

      const code = generateGrammarRules(patterns);

      console.log('\n=== GENERATED GRAMMAR CODE (SAMPLE) ===');
      console.log(code.substring(0, 500) + '...');
      console.log('=======================================\n');

      expect(code).toContain('export function applyGeneratedCommands');
      expect(code).toContain('parser.renameCommand');
      expect(code).toContain('parser.evalCommand');
    });
  });

  // ==========================================================================
  // TOKEN GENERATION
  // ==========================================================================

  describe('generateCommandTokens', () => {
    it('generates token definitions for commands', () => {
      const patterns = [
        getCommandPattern('rename')!,
        getCommandPattern('eval')!,
      ].filter(Boolean);

      const code = generateCommandTokens(patterns);

      console.log('\n=== GENERATED TOKENS (SAMPLE) ===');
      console.log(code.substring(0, 400) + '...');
      console.log('=================================\n');

      expect(code).toContain('export const Rename = createToken');
      expect(code).toContain('export const Eval = createToken');
      expect(code).toContain('export const generatedCommandTokens');
    });
  });

  // ==========================================================================
  // PATTERN COVERAGE
  // ==========================================================================

  describe('Pattern Coverage', () => {
    it('handles sequence patterns', () => {
      const pattern = getCommandPattern('rename')!;
      const rule = generateGrammarRule(pattern);

      expect(rule).toBeDefined();
    });

    it('handles group patterns with quantifiers', () => {
      const pattern = getCommandPattern('eval')!;
      const rule = generateGrammarRule(pattern);

      expect(rule).toContain('AT_LEAST_ONE');
    });

    it('handles alternation patterns', () => {
      const pattern = getCommandPattern('outputlookup')!;
      const rule = generateGrammarRule(pattern);

      expect(rule).toContain('OR');
    });

    it('handles optional patterns', () => {
      const pattern = getCommandPattern('outputlookup')!;
      const rule = generateGrammarRule(pattern);

      expect(rule).toContain('MANY');
    });
  });
});
