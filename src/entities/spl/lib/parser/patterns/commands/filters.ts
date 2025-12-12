/**
 * Filter Command Patterns
 *
 * Commands that filter or limit results.
 * Includes: where, search, dedup, regex, table, fields, head, tail
 *
 * @module entities/spl/lib/parser/patterns/commands/filters
 */

import type { CommandSyntax } from '../types';

// =============================================================================
// WHERE COMMAND
// =============================================================================

/**
 * where command
 *
 * Description: Filters results using eval expressions.
 */
export const whereCommand: CommandSyntax = {
  command: 'where',
  category: '',
  description: 'Filters results using eval expressions',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'param',
    type: 'evaled-field',
    name: 'condition',
  },
  semantics: {
    preservesAll: true,
  },
  related: ['search', 'eval'],
  tags: ['filter', 'condition', 'boolean'],
};

// =============================================================================
// SEARCH COMMAND
// =============================================================================

/**
 * search command
 *
 * Description: Filters results to match search expression.
 */
export const searchCommand: CommandSyntax = {
  command: 'search',
  category: '',
  description: 'Filters results to match search expression',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'param',
    type: 'string',
    name: 'searchExpression',
  },
  semantics: {
    preservesAll: true,
  },
  related: ['where'],
  tags: ['filter', 'match', 'query'],
};

// =============================================================================
// DEDUP COMMAND
// =============================================================================

/**
 * dedup command
 *
 * Description: Removes events with identical field value combinations.
 */
export const dedupCommand: CommandSyntax = {
  command: 'dedup',
  category: 'results::filter',
  description: 'Removes events with identical field value combinations',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      {
        kind: 'param',
        type: 'int',
        name: 'count',
        quantifier: '?',
      },
      {
        kind: 'param',
        type: 'field-list',
        name: 'fields',
        effect: 'consumes',
      },
      {
        kind: 'group',
        quantifier: '*',
        pattern: {
          kind: 'alternation',
          options: [
            { kind: 'literal', value: 'keepevents' },
            { kind: 'literal', value: 'keepempty' },
            { kind: 'literal', value: 'consecutive' },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'sortby' },
                {
                  kind: 'group',
                  quantifier: '?',
                  pattern: {
                    kind: 'alternation',
                    options: [
                      { kind: 'literal', value: '+' },
                      { kind: 'literal', value: '-' },
                    ],
                  },
                },
                { kind: 'param', type: 'field', effect: 'consumes', name: 'sortField' },
              ],
            },
          ],
        },
      },
    ],
  },
  semantics: {
    preservesAll: true,
  },
  related: ['uniq'],
  tags: ['duplicate', 'unique', 'distinct'],
};

// =============================================================================
// REGEX COMMAND
// =============================================================================

/**
 * regex command
 *
 * Description: Filters events using regular expressions.
 */
export const regexCommand: CommandSyntax = {
  command: 'regex',
  category: 'results',
  description: 'Filters events using regular expressions',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'param', type: 'field', effect: 'consumes', name: 'field' },
            {
              kind: 'alternation',
              options: [
                { kind: 'literal', value: '=' },
                { kind: 'literal', value: '!=' },
              ],
            },
          ],
        },
      },
      { kind: 'param', type: 'string', name: 'pattern' },
    ],
  },
  semantics: { preservesAll: true },
  related: ['rex', 'search'],
  tags: ['regex', 'filter', 'pattern'],
};

// =============================================================================
// TABLE COMMAND
// =============================================================================

/**
 * table command
 *
 * Description: Returns a table of specified fields.
 */
export const tableCommand: CommandSyntax = {
  command: 'table',
  category: '',
  description: 'Returns a table of specified fields',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'param',
    type: 'field-list',
    name: 'fields',
    effect: 'consumes',
  },
  related: ['fields', 'rename'],
  tags: ['display', 'select', 'columns'],
};

// =============================================================================
// FIELDS COMMAND
// =============================================================================

/**
 * fields command
 *
 * Description: Keeps or removes fields from search results.
 */
export const fieldsCommand: CommandSyntax = {
  command: 'fields',
  category: '',
  description: 'Keeps or removes fields from search results',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'alternation',
          options: [
            { kind: 'literal', value: '+' },
            { kind: 'literal', value: '-' },
          ],
        },
      },
      { kind: 'param', type: 'field-list', name: 'fieldList', effect: 'consumes' },
    ],
  },
  related: ['table', 'rename'],
  tags: ['filter', 'select', 'remove', 'keep'],
};

// =============================================================================
// HEAD COMMAND
// =============================================================================

/**
 * head command
 *
 * Description: Returns the first N results.
 */
export const headCommand: CommandSyntax = {
  command: 'head',
  category: '',
  description: 'Returns the first N results',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'int', name: 'limit', quantifier: '?' },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'keeplast' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'keeplast' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'null' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'null' },
          ],
        },
      },
    ],
  },
  semantics: {
    preservesAll: true,
  },
  related: ['tail', 'sort'],
  tags: ['limit', 'first', 'top'],
};

// =============================================================================
// TAIL COMMAND
// =============================================================================

/**
 * tail command
 *
 * Description: Returns the last N results.
 */
export const tailCommand: CommandSyntax = {
  command: 'tail',
  category: '',
  description: 'Returns the last N results',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'param',
    type: 'int',
    name: 'limit',
    quantifier: '?',
  },
  semantics: {
    preservesAll: true,
  },
  related: ['head', 'sort'],
  tags: ['limit', 'last', 'bottom'],
};

// =============================================================================
// AGGREGATE EXPORTS
// =============================================================================

/**
 * All filter command patterns
 */
export const filterCommands = {
  where: whereCommand,
  search: searchCommand,
  dedup: dedupCommand,
  regex: regexCommand,
  table: tableCommand,
  fields: fieldsCommand,
  head: headCommand,
  tail: tailCommand,
} as const;
