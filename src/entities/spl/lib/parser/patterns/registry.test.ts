/**
 * Tests for SPL command pattern registry
 *
 * @module entities/spl/lib/parser/patterns/registry.test
 */

import { describe, it, expect } from 'vitest';
import {
  binCommand,
  renameCommand,
  fillnullCommand,
  dedupCommand,
  sortCommand,
  evalCommand,
  statsCommand,
  spathCommand,
  mvexpandCommand,
  addtotalsCommand,
  COMMAND_PATTERNS,
  getCommandPattern,
  hasPattern,
  getAllCommandNames,
} from './registry';
import { validateCommandSyntax, validateRegistry } from './validator';

describe('Command Pattern Registry', () => {
  describe('binCommand', () => {
    it('has correct command name', () => {
      expect(binCommand.command).toBe('bin');
    });

    it('has category and description', () => {
      expect(binCommand.category).toBeDefined();
      expect(binCommand.description).toBeDefined();
    });

    it('has valid syntax pattern', () => {
      const result = validateCommandSyntax(binCommand);
      expect(result.valid).toBe(true);
    });

    it('defines field modification semantics', () => {
      expect(binCommand.syntax.kind).toBe('sequence');
      if (binCommand.syntax.kind === 'sequence') {
        // patterns[0] is optional parameters group, patterns[1] is the target field
        const targetField = binCommand.syntax.patterns[1];
        expect(targetField.kind).toBe('param');
        if (targetField.kind === 'param') {
          expect(targetField.type).toBe('field');
          expect(targetField.effect).toBe('modifies');
        }
      }
    });

    it('supports optional alias', () => {
      expect(binCommand.syntax.kind).toBe('sequence');
      if (binCommand.syntax.kind === 'sequence') {
        // patterns[2] is the optional alias group (AS <field>)?
        const aliasGroup = binCommand.syntax.patterns[2];
        expect(aliasGroup.kind).toBe('group');
        if (aliasGroup.kind === 'group') {
          expect(aliasGroup.quantifier).toBe('?');
        }
      }
    });
  });

  describe('renameCommand', () => {
    it('has correct command name', () => {
      expect(renameCommand.command).toBe('rename');
    });

    it('has valid syntax pattern', () => {
      const result = validateCommandSyntax(renameCommand);
      expect(result.valid).toBe(true);
    });

    it('requires one or more rename clauses', () => {
      expect(renameCommand.syntax.kind).toBe('group');
      if (renameCommand.syntax.kind === 'group') {
        expect(renameCommand.syntax.quantifier).toBe('+');
      }
    });

    it('defines rename semantics (drops old, creates new)', () => {
      expect(renameCommand.syntax.kind).toBe('group');
      if (renameCommand.syntax.kind === 'group') {
        const pattern = renameCommand.syntax.pattern;
        expect(pattern.kind).toBe('sequence');
        if (pattern.kind === 'sequence') {
          const oldField = pattern.patterns[0];
          const newField = pattern.patterns[2];

          expect(oldField.kind).toBe('param');
          if (oldField.kind === 'param') {
            expect(oldField.type).toBe('wc-field');
            // rename drops the old field (removes it from pipeline)
            expect(oldField.effect).toBe('drops');
          }

          expect(newField.kind).toBe('param');
          if (newField.kind === 'param') {
            expect(newField.type).toBe('wc-field');
            expect(newField.effect).toBe('creates');
          }
        }
      }
    });

    it('supports wildcard fields', () => {
      expect(renameCommand.syntax.kind).toBe('group');
      if (renameCommand.syntax.kind === 'group') {
        const pattern = renameCommand.syntax.pattern;
        if (pattern.kind === 'sequence') {
          const oldField = pattern.patterns[0];
          expect(oldField.kind).toBe('param');
          if (oldField.kind === 'param') {
            expect(oldField.type).toBe('wc-field');
          }
        }
      }
    });
  });

  describe('fillnullCommand', () => {
    it('has correct command name', () => {
      expect(fillnullCommand.command).toBe('fillnull');
    });

    it('has valid syntax pattern', () => {
      const result = validateCommandSyntax(fillnullCommand);
      expect(result.valid).toBe(true);
    });

    it('has optional value parameter', () => {
      expect(fillnullCommand.syntax.kind).toBe('sequence');
      if (fillnullCommand.syntax.kind === 'sequence') {
        const valueGroup = fillnullCommand.syntax.patterns[0];
        expect(valueGroup.kind).toBe('group');
        if (valueGroup.kind === 'group') {
          expect(valueGroup.quantifier).toBe('?');
        }
      }
    });

    it('has optional field list', () => {
      expect(fillnullCommand.syntax.kind).toBe('sequence');
      if (fillnullCommand.syntax.kind === 'sequence') {
        const fieldList = fillnullCommand.syntax.patterns[1];
        expect(fieldList.kind).toBe('param');
        if (fieldList.kind === 'param') {
          expect(fieldList.type).toBe('field-list');
          expect(fieldList.quantifier).toBe('?');
          expect(fieldList.effect).toBe('modifies');
        }
      }
    });
  });

  describe('dedupCommand', () => {
    it('has correct command name', () => {
      expect(dedupCommand.command).toBe('dedup');
    });

    it('has valid syntax pattern', () => {
      const result = validateCommandSyntax(dedupCommand);
      expect(result.valid).toBe(true);
    });

    it('has optional count parameter', () => {
      expect(dedupCommand.syntax.kind).toBe('sequence');
      if (dedupCommand.syntax.kind === 'sequence') {
        const count = dedupCommand.syntax.patterns[0];
        expect(count.kind).toBe('param');
        if (count.kind === 'param') {
          expect(count.type).toBe('int');
          expect(count.quantifier).toBe('?');
        }
      }
    });

    it('requires field list', () => {
      expect(dedupCommand.syntax.kind).toBe('sequence');
      if (dedupCommand.syntax.kind === 'sequence') {
        const fieldList = dedupCommand.syntax.patterns[1];
        expect(fieldList.kind).toBe('param');
        if (fieldList.kind === 'param') {
          expect(fieldList.type).toBe('field-list');
          expect(fieldList.effect).toBe('consumes');
        }
      }
    });
  });

  describe('sortCommand', () => {
    it('has correct command name', () => {
      expect(sortCommand.command).toBe('sort');
    });

    it('has valid syntax pattern', () => {
      const result = validateCommandSyntax(sortCommand);
      expect(result.valid).toBe(true);
    });

    it('has optional limit parameter', () => {
      expect(sortCommand.syntax.kind).toBe('sequence');
      if (sortCommand.syntax.kind === 'sequence') {
        const limit = sortCommand.syntax.patterns[0];
        expect(limit.kind).toBe('param');
        if (limit.kind === 'param') {
          expect(limit.type).toBe('int');
          expect(limit.quantifier).toBe('?');
        }
      }
    });

    it('requires sort fields', () => {
      expect(sortCommand.syntax.kind).toBe('sequence');
      if (sortCommand.syntax.kind === 'sequence') {
        const sortFields = sortCommand.syntax.patterns[1];
        expect(sortFields.kind).toBe('param');
        if (sortFields.kind === 'param') {
          expect(sortFields.type).toBe('field-list');
          expect(sortFields.effect).toBe('consumes');
        }
      }
    });
  });

  describe('COMMAND_PATTERNS', () => {
    it('contains expected core commands and aliases', () => {
      expect(COMMAND_PATTERNS.bin).toBe(binCommand);
      expect(COMMAND_PATTERNS.bucket).toBe(binCommand);
      expect(COMMAND_PATTERNS.rename).toBe(renameCommand);
      expect(COMMAND_PATTERNS.fillnull).toBe(fillnullCommand);
      expect(COMMAND_PATTERNS.dedup).toBe(dedupCommand);
      expect(COMMAND_PATTERNS.sort).toBe(sortCommand);
      expect(COMMAND_PATTERNS.eval).toBe(evalCommand);
      expect(COMMAND_PATTERNS.stats).toBe(statsCommand);
      expect(COMMAND_PATTERNS.spath).toBe(spathCommand);
      expect(COMMAND_PATTERNS.mvexpand).toBe(mvexpandCommand);
      expect(COMMAND_PATTERNS.addtotals).toBe(addtotalsCommand);
    });

    it('tracks commands with lowercase keys', () => {
      const keys = Object.keys(COMMAND_PATTERNS);
      keys.forEach(key => {
        expect(key).toBe(key.toLowerCase());
      });
    });

    it('includes more than the minimal core set (future-proof)', () => {
      expect(Object.keys(COMMAND_PATTERNS).length).toBeGreaterThanOrEqual(10);
    });

    it('all commands are valid', () => {
      const results = validateRegistry(COMMAND_PATTERNS);
      const invalid = Object.entries(results).filter(([, result]) => !result.valid);

      if (invalid.length) {
        const message = invalid
          .map(([name, result]) => `${name}: ${result.errors.map(e => e.message).join('; ')}`)
          .join(' | ');
        // eslint-disable-next-line no-console
        console.warn('Invalid command patterns:', message);
      }

      expect(invalid.length).toBe(0);
    });
  });

  describe('getCommandPattern', () => {
    it('retrieves existing command', () => {
      const pattern = getCommandPattern('rename');
      expect(pattern).toBe(renameCommand);
    });

    it('handles case-insensitive lookup', () => {
      expect(getCommandPattern('RENAME')).toBe(renameCommand);
      expect(getCommandPattern('Rename')).toBe(renameCommand);
      expect(getCommandPattern('rename')).toBe(renameCommand);
    });

    it('returns undefined for non-existent command', () => {
      const pattern = getCommandPattern('nonexistent');
      expect(pattern).toBeUndefined();
    });

    it('retrieves registered commands across categories', () => {
      expect(getCommandPattern('bin')).toBe(binCommand);
      expect(getCommandPattern('eval')).toBe(evalCommand);
      expect(getCommandPattern('stats')).toBe(statsCommand);
      expect(getCommandPattern('spath')).toBe(spathCommand);
      expect(getCommandPattern('mvexpand')).toBe(mvexpandCommand);
      expect(getCommandPattern('addtotals')).toBe(addtotalsCommand);
    });
  });

  describe('hasPattern', () => {
    it('returns true for existing commands', () => {
      expect(hasPattern('bin')).toBe(true);
      expect(hasPattern('rename')).toBe(true);
      expect(hasPattern('fillnull')).toBe(true);
      expect(hasPattern('dedup')).toBe(true);
      expect(hasPattern('sort')).toBe(true);
    });

    it('returns false for non-existent commands', () => {
      expect(hasPattern('nonexistent')).toBe(false);
      expect(hasPattern('madeup')).toBe(false);
      expect(hasPattern('foobar')).toBe(false);
    });

    it('handles case-insensitive lookup', () => {
      expect(hasPattern('RENAME')).toBe(true);
      expect(hasPattern('Rename')).toBe(true);
      expect(hasPattern('rename')).toBe(true);
    });
  });

  describe('getAllCommandNames', () => {
    it('returns all registered command names', () => {
      const names = getAllCommandNames();
      expect(names).toContain('bin');
      expect(names).toContain('bucket');
      expect(names).toContain('rename');
      expect(names).toContain('fillnull');
      expect(names).toContain('dedup');
      expect(names).toContain('sort');
      expect(names).toContain('eval');
      expect(names).toContain('stats');
      expect(names).toContain('spath');
      expect(names).toContain('mvexpand');
      expect(names).toContain('addtotals');
    });

    it('returns lowercase command names', () => {
      const names = getAllCommandNames();
      names.forEach(name => {
        expect(name).toBe(name.toLowerCase());
      });
    });
  });

  describe('Pattern Coverage', () => {
    it('covers field creation semantics', () => {
      const commands = [renameCommand, binCommand];
      const hasCreates = commands.some(cmd => {
        const hasEffect = (pattern: any): boolean => {
          if (pattern.kind === 'param' && pattern.effect === 'creates') {
            return true;
          }
          if (pattern.kind === 'sequence') {
            return pattern.patterns.some(hasEffect);
          }
          if (pattern.kind === 'group') {
            return hasEffect(pattern.pattern);
          }
          return false;
        };
        return hasEffect(cmd.syntax);
      });
      expect(hasCreates).toBe(true);
    });

    it('covers field consumption semantics', () => {
      const commands = [renameCommand, dedupCommand, sortCommand];
      const hasConsumes = commands.some(cmd => {
        const hasEffect = (pattern: any): boolean => {
          if (pattern.kind === 'param' && pattern.effect === 'consumes') {
            return true;
          }
          if (pattern.kind === 'sequence') {
            return pattern.patterns.some(hasEffect);
          }
          if (pattern.kind === 'group') {
            return hasEffect(pattern.pattern);
          }
          return false;
        };
        return hasEffect(cmd.syntax);
      });
      expect(hasConsumes).toBe(true);
    });

    it('covers field modification semantics', () => {
      const commands = [binCommand, fillnullCommand];
      const hasModifies = commands.some(cmd => {
        const hasEffect = (pattern: any): boolean => {
          if (pattern.kind === 'param' && pattern.effect === 'modifies') {
            return true;
          }
          if (pattern.kind === 'sequence') {
            return pattern.patterns.some(hasEffect);
          }
          if (pattern.kind === 'group') {
            return hasEffect(pattern.pattern);
          }
          return false;
        };
        return hasEffect(cmd.syntax);
      });
      expect(hasModifies).toBe(true);
    });

    it('covers all quantifiers', () => {
      const allQuantifiers = new Set<string>();

      const extractQuantifiers = (pattern: any): void => {
        if (pattern.quantifier) {
          allQuantifiers.add(pattern.quantifier);
        }
        if (pattern.kind === 'sequence') {
          pattern.patterns.forEach(extractQuantifiers);
        }
        if (pattern.kind === 'group') {
          extractQuantifiers(pattern.pattern);
        }
        if (pattern.kind === 'alternation') {
          pattern.options.forEach(extractQuantifiers);
        }
      };

      Object.values(COMMAND_PATTERNS).forEach(cmd =>
        extractQuantifiers(cmd.syntax)
      );

      expect(allQuantifiers.has('?')).toBe(true); // optional
      expect(allQuantifiers.has('+')).toBe(true); // one or more
    });

    it('covers multiple param types', () => {
      const allTypes = new Set<string>();

      const extractTypes = (pattern: any): void => {
        if (pattern.kind === 'param') {
          allTypes.add(pattern.type);
        }
        if (pattern.kind === 'sequence') {
          pattern.patterns.forEach(extractTypes);
        }
        if (pattern.kind === 'group') {
          extractTypes(pattern.pattern);
        }
        if (pattern.kind === 'alternation') {
          pattern.options.forEach(extractTypes);
        }
      };

      Object.values(COMMAND_PATTERNS).forEach(cmd => extractTypes(cmd.syntax));

      expect(allTypes.has('field')).toBe(true);
      expect(allTypes.has('wc-field')).toBe(true);
      expect(allTypes.has('field-list')).toBe(true);
      expect(allTypes.has('int')).toBe(true);
      expect(allTypes.has('string')).toBe(true);
    });
  });
});
