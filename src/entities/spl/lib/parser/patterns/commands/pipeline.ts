/**
 * Pipeline Command Patterns
 *
 * Commands that combine or iterate over results.
 * Includes: append, appendcols, appendpipe, join, union, foreach, map,
 * multisearch, set, selfjoin
 *
 * @module entities/spl/lib/parser/patterns/commands/pipeline
 */

import type { CommandSyntax } from '../types';

// =============================================================================
// JOIN COMMAND
// =============================================================================

/**
 * join command
 *
 * Description: Joins results from a subsearch with current results.
 */
export const joinCommand: CommandSyntax = {
  command: 'join',
  category: '',
  description: 'Joins results from a subsearch with current results',
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
            { kind: 'literal', value: 'left' },
            { kind: 'literal', value: 'inner' },
            { kind: 'literal', value: 'outer' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'type' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'joinType' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'usetime' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'usetime' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'max' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'max' },
          ],
        },
      },
      { kind: 'param', type: 'field-list', name: 'joinFields', quantifier: '?', effect: 'consumes' },
      { kind: 'param', type: 'string', name: 'subsearch' },
    ],
  },
  semantics: {
    preservesAll: true,
  },
  related: ['append', 'union', 'lookup'],
  tags: ['join', 'merge', 'combine', 'subsearch'],
};

// =============================================================================
// APPEND COMMAND
// =============================================================================

/**
 * append command
 *
 * Description: Appends the results of a subsearch to current results.
 */
export const appendCommand: CommandSyntax = {
  command: 'append',
  category: '',
  description: 'Appends the results of a subsearch to current results',
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
            { kind: 'literal', value: 'extendtimerange' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'extendtimerange' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'maxtime' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'maxtime' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'maxout' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'maxout' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'timeout' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'timeout' },
          ],
        },
      },
      { kind: 'param', type: 'string', name: 'subsearch' },
    ],
  },
  semantics: {
    preservesAll: true,
  },
  related: ['appendpipe', 'union', 'join'],
  tags: ['append', 'combine', 'subsearch'],
};

// =============================================================================
// APPENDCOLS COMMAND
// =============================================================================

/**
 * appendcols command
 *
 * Description: Appends fields from a subsearch.
 */
export const appendcolsCommand: CommandSyntax = {
  command: 'appendcols',
  category: 'dataset',
  description: 'Appends fields from a subsearch',
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
            { kind: 'literal', value: 'override' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'override' },
          ],
        },
      },
      { kind: 'param', type: 'string', name: 'subsearch' },
    ],
  },
  semantics: { preservesAll: true },
  related: ['append', 'join'],
  tags: ['append', 'columns', 'subsearch'],
};

// =============================================================================
// APPENDPIPE COMMAND
// =============================================================================

/**
 * appendpipe command
 *
 * Description: Appends subsearch results to main results.
 */
export const appendpipeCommand: CommandSyntax = {
  command: 'appendpipe',
  category: 'dataset',
  description: 'Appends subsearch results to main results',
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
            { kind: 'literal', value: 'run_in_preview' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'runInPreview' },
          ],
        },
      },
      { kind: 'param', type: 'string', name: 'subsearch' },
    ],
  },
  semantics: { preservesAll: true },
  related: ['append'],
  tags: ['append', 'pipe', 'subsearch'],
};

// =============================================================================
// UNION COMMAND
// =============================================================================

/**
 * union command
 *
 * Description: Merges results from multiple datasets.
 */
export const unionCommand: CommandSyntax = {
  command: 'union',
  category: '',
  description: 'Merges results from multiple datasets',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      {
        kind: 'group',
        quantifier: '*',
        pattern: {
          kind: 'alternation',
          options: [
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'maxtime' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'maxtime' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'maxout' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'maxout' },
              ],
            },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '+',
        pattern: {
          kind: 'param',
          type: 'string',
          name: 'dataset',
        },
      },
    ],
  },
  semantics: {
    preservesAll: true,
  },
  related: ['append', 'join'],
  tags: ['union', 'merge', 'combine', 'datasets'],
};

// =============================================================================
// FOREACH COMMAND
// =============================================================================

/**
 * foreach command
 *
 * Description: Runs a templated subsearch for each field in a list.
 */
export const foreachCommand: CommandSyntax = {
  command: 'foreach',
  category: '',
  description: 'Runs a templated subsearch for each field in a list',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'field-list', name: 'fields', effect: 'consumes' },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'fieldstr' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'fieldstr' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'matchstr' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'matchstr' },
          ],
        },
      },
      { kind: 'param', type: 'string', name: 'subsearch' },
    ],
  },
  semantics: {
    preservesAll: true,
  },
  related: ['eval', 'stats'],
  tags: ['foreach', 'loop', 'iterate', 'template'],
};

// =============================================================================
// MAP COMMAND
// =============================================================================

/**
 * map command
 *
 * Description: Runs a search for each result of a preceding search.
 */
export const mapCommand: CommandSyntax = {
  command: 'map',
  category: 'results',
  description: 'Runs a search for each result of a preceding search',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'literal', value: 'search' },
      { kind: 'literal', value: '=' },
      { kind: 'param', type: 'string', name: 'searchString' },
      {
        kind: 'group',
        quantifier: '*',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'maxsearches' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'maxsearches' },
          ],
        },
      },
    ],
  },
  related: ['foreach'],
  tags: ['map', 'iterate', 'subsearch'],
};

// =============================================================================
// MULTISEARCH COMMAND
// =============================================================================

/**
 * multisearch command
 *
 * Description: Runs multiple streaming searches simultaneously.
 */
export const multisearchCommand: CommandSyntax = {
  command: 'multisearch',
  category: 'results',
  description: 'Runs multiple streaming searches simultaneously',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'group',
    quantifier: '+',
    pattern: {
      kind: 'sequence',
      patterns: [
        { kind: 'literal', value: '[' },
        { kind: 'param', type: 'string', name: 'subsearch' },
        { kind: 'literal', value: ']' },
      ],
    },
  },
  related: ['append', 'union'],
  tags: ['multisearch', 'parallel', 'subsearch'],
};

// =============================================================================
// SET COMMAND
// =============================================================================

/**
 * set command
 *
 * Description: Performs set operations on subsearches.
 */
export const setCommand: CommandSyntax = {
  command: 'set',
  category: 'results',
  description: 'Performs set operations on subsearches',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      {
        kind: 'alternation',
        options: [
          { kind: 'literal', value: 'union' },
          { kind: 'literal', value: 'diff' },
          { kind: 'literal', value: 'intersect' },
        ],
      },
      { kind: 'literal', value: '[' },
      { kind: 'param', type: 'string', name: 'subsearch1' },
      { kind: 'literal', value: ']' },
      { kind: 'literal', value: '[' },
      { kind: 'param', type: 'string', name: 'subsearch2' },
      { kind: 'literal', value: ']' },
    ],
  },
  related: ['append', 'union'],
  tags: ['set', 'union', 'diff', 'intersect'],
};

// =============================================================================
// SELFJOIN COMMAND
// =============================================================================

/**
 * selfjoin command
 *
 * Description: Joins results with itself.
 */
export const selfjoinCommand: CommandSyntax = {
  command: 'selfjoin',
  category: 'results',
  description: 'Joins results with itself',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      {
        kind: 'group',
        quantifier: '*',
        pattern: {
          kind: 'alternation',
          options: [
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'overwrite' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'overwrite' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'max' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'max' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'keepsingle' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'keepsingle' },
              ],
            },
          ],
        },
      },
      { kind: 'param', type: 'field-list', effect: 'consumes', name: 'fields' },
    ],
  },
  semantics: { preservesAll: true },
  related: ['join'],
  tags: ['selfjoin', 'join'],
};

// =============================================================================
// AGGREGATE EXPORTS
// =============================================================================

/**
 * All pipeline command patterns
 */
export const pipelineCommands = {
  join: joinCommand,
  append: appendCommand,
  appendcols: appendcolsCommand,
  appendpipe: appendpipeCommand,
  union: unionCommand,
  foreach: foreachCommand,
  map: mapCommand,
  multisearch: multisearchCommand,
  set: setCommand,
  selfjoin: selfjoinCommand,
} as const;
