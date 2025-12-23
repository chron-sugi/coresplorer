/**
 * Results Command Patterns
 *
 * Commands that manipulate result ordering or format.
 * Includes: sort, transaction, reverse, return, format, transpose, untable, xyseries
 *
 * @module entities/spl/lib/parser/patterns/commands/results
 */

import type { CommandSyntax } from '../types';

// =============================================================================
// SORT COMMAND
// =============================================================================

/**
 * sort command
 *
 * Description: Sorts results by specified fields.
 */
export const sortCommand: CommandSyntax = {
  command: 'sort',
  category: 'results::order',
  description: 'Sorts results by specified fields',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      {
        kind: 'param',
        type: 'int',
        name: 'limit',
        quantifier: '?',
      },
      {
        kind: 'param',
        type: 'field-list',
        name: 'sortFields',
        effect: 'consumes',
      },
    ],
  },
  related: ['reverse'],
  tags: ['order', 'arrange', 'rank'],
};

// =============================================================================
// TRANSACTION COMMAND
// =============================================================================

/**
 * transaction command
 *
 * Description: Groups events into transactions based on field values.
 */
export const transactionCommand: CommandSyntax = {
  command: 'transaction',
  category: '',
  description: 'Groups events into transactions based on field values',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'field-list', name: 'fields', quantifier: '?', effect: 'consumes' },
      {
        kind: 'group',
        quantifier: '*',
        pattern: {
          kind: 'alternation',
          options: [
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'maxspan' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'maxspan' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'maxpause' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'maxpause' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'maxevents' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'maxevents' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'startswith' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'startswith' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'endswith' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'endswith' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'keepevicted' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'keepevicted' },
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
  related: ['stats'],
  tags: ['transaction', 'group', 'session', 'sequence'],
};

// =============================================================================
// REVERSE COMMAND
// =============================================================================

/**
 * reverse command
 *
 * Description: Reverses the order of results.
 */
export const reverseCommand: CommandSyntax = {
  command: 'reverse',
  category: 'results',
  description: 'Reverses the order of results',
  grammarSupport: 'dedicated',
  syntax: { kind: 'literal', value: 'reverse' },
  semantics: { preservesAll: true },
  related: ['sort'],
  tags: ['reverse', 'order'],
};

// =============================================================================
// RETURN COMMAND
// =============================================================================

/**
 * return command
 *
 * Description: Returns values from a subsearch to the outer search.
 */
export const returnCommand: CommandSyntax = {
  command: 'return',
  category: '',
  description: 'Returns values from a subsearch to the outer search',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'int', name: 'count', quantifier: '?' },
      {
        kind: 'group',
        quantifier: '*',
        pattern: {
          kind: 'alternation',
          options: [
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: '$' },
                { kind: 'param', type: 'field', name: 'field', effect: 'consumes' },
              ],
            },
            { kind: 'param', type: 'field', name: 'fieldOrAlias', effect: 'consumes' },
          ],
        },
      },
    ],
  },
  related: ['format', 'append'],
  tags: ['return', 'subsearch', 'output'],
};

// =============================================================================
// FORMAT COMMAND
// =============================================================================

/**
 * format command
 *
 * Description: Formats results as a single result.
 */
export const formatCommand: CommandSyntax = {
  command: 'format',
  category: 'results',
  description: 'Formats results as a single result',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'group',
    quantifier: '*',
    pattern: {
      kind: 'alternation',
      options: [
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'mvsep' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'mvsep' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'maxresults' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'maxresults' },
          ],
        },
        { kind: 'param', type: 'string', name: 'emptyStr', quantifier: '?' },
      ],
    },
  },
  semantics: {
    dropsAllExcept: ['creates'],
  },
  tags: ['format', 'subsearch'],
};

// =============================================================================
// TRANSPOSE COMMAND
// =============================================================================

/**
 * transpose command
 *
 * Description: Transposes rows and columns.
 */
export const transposeCommand: CommandSyntax = {
  command: 'transpose',
  category: 'results',
  description: 'Transposes rows and columns',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'int', name: 'limit', quantifier: '?' },
      {
        kind: 'group',
        quantifier: '*',
        pattern: {
          kind: 'alternation',
          options: [
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'column_name' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'columnName' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'header_field' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'field', name: 'headerField', effect: 'consumes' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'include_empty' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'includeEmpty' },
              ],
            },
          ],
        },
      },
    ],
  },
  semantics: {
    dropsAllExcept: ['creates'],
  },
  related: ['xyseries', 'untable'],
  tags: ['transpose', 'pivot', 'reshape'],
};

// =============================================================================
// UNTABLE COMMAND
// =============================================================================

/**
 * untable command
 *
 * Description: Converts table-formatted results to key-value format.
 */
export const untableCommand: CommandSyntax = {
  command: 'untable',
  category: 'results',
  description: 'Converts table-formatted results to key-value format',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'field', effect: 'consumes', name: 'rowLabel' },
      { kind: 'param', type: 'field', effect: 'creates', name: 'columnLabel' },
      { kind: 'param', type: 'field', effect: 'creates', name: 'valueField' },
    ],
  },
  semantics: {
    dropsAllExcept: ['creates'],
  },
  related: ['xyseries'],
  tags: ['untable', 'unpivot', 'reshape'],
};

// =============================================================================
// XYSERIES COMMAND
// =============================================================================

/**
 * xyseries command
 *
 * Description: Converts results into a tabular format.
 */
export const xyseriesCommand: CommandSyntax = {
  command: 'xyseries',
  category: 'results',
  description: 'Converts results into a tabular format',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'field', effect: 'consumes', name: 'xField' },
      { kind: 'param', type: 'field', effect: 'consumes', name: 'yField' },
      { kind: 'param', type: 'field', effect: 'consumes', name: 'yDataField' },
      {
        kind: 'group',
        quantifier: '*',
        pattern: {
          kind: 'alternation',
          options: [
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'grouped' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'grouped' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'format' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'format' },
              ],
            },
          ],
        },
      },
    ],
  },
  semantics: {
    dropsAllExcept: ['creates'],
  },
  related: ['untable'],
  tags: ['xyseries', 'pivot', 'table'],
};

// =============================================================================
// AGGREGATE EXPORTS
// =============================================================================

/**
 * All results command patterns
 */
export const resultsCommands = {
  sort: sortCommand,
  transaction: transactionCommand,
  reverse: reverseCommand,
  return: returnCommand,
  format: formatCommand,
  transpose: transposeCommand,
  untable: untableCommand,
  xyseries: xyseriesCommand,
} as const;
