/**
 * Field Modifier Command Patterns
 *
 * Commands that modify existing fields.
 * Includes: bin, rename, fillnull, filldown, replace, makemv, mvcombine,
 * mvexpand, rangemap, convert
 *
 * @module entities/spl/lib/parser/patterns/commands/field-modifiers
 */

import type { CommandSyntax } from '../types';

// =============================================================================
// BIN COMMAND
// =============================================================================

/**
 * bin command
 *
 * Description: Puts continuous numerical values into discrete sets.
 */
export const binCommand: CommandSyntax = {
  command: 'bin',
  category: 'reporting',
  description: 'Puts continuous numerical values into discrete sets',
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
                { kind: 'literal', value: 'span' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'span' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'minspan' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'minspan' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'bins' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'bins' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'start' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'num', name: 'start' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'end' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'num', name: 'end' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'aligntime' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'aligntime' },
              ],
            },
          ],
        },
      },
      {
        kind: 'param',
        type: 'field',
        name: 'field',
        effect: 'modifies',
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'as' },
            {
              kind: 'param',
              type: 'field',
              name: 'alias',
              effect: 'creates',
            },
          ],
        },
      },
    ],
  },
  semantics: {
    preservesAll: true,
  },
  related: ['chart', 'timechart', 'bucket'],
  tags: ['bucket', 'discretize', 'span', 'time'],
};

// =============================================================================
// RENAME COMMAND
// =============================================================================

/**
 * rename command
 *
 * Description: Renames a specified field (wildcards supported).
 */
export const renameCommand: CommandSyntax = {
  command: 'rename',
  category: 'fields::modify',
  description: 'Renames a specified field (wildcards supported)',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'group',
    quantifier: '+',
    pattern: {
      kind: 'sequence',
      patterns: [
        {
          kind: 'param',
          type: 'wc-field',
          name: 'oldField',
          effect: 'drops',
        },
        { kind: 'literal', value: 'as' },
        {
          kind: 'param',
          type: 'wc-field',
          name: 'newField',
          effect: 'creates',
          dependsOn: ['oldField'],
        },
      ],
    },
  },
  semantics: {
    preservesAll: true,
  },
  related: ['fields'],
  tags: ['alias', 'name'],
};

// =============================================================================
// FILLNULL COMMAND
// =============================================================================

/**
 * fillnull command
 *
 * Description: Replaces null values with a specified value.
 */
export const fillnullCommand: CommandSyntax = {
  command: 'fillnull',
  category: 'fields::modify',
  description: 'Replaces null values with a specified value',
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
            { kind: 'literal', value: 'value' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'fillValue' },
          ],
        },
      },
      {
        kind: 'param',
        type: 'field-list',
        name: 'fields',
        quantifier: '?',
        effect: 'modifies',
      },
    ],
  },
  semantics: {
    preservesAll: true,
  },
  related: ['eval'],
  tags: ['empty', 'default', 'null'],
};

// =============================================================================
// FILLDOWN COMMAND
// =============================================================================

/**
 * filldown command
 *
 * Description: Replaces null values with the last non-null value.
 */
export const filldownCommand: CommandSyntax = {
  command: 'filldown',
  category: '',
  description: 'Replaces null values with the last non-null value',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'param',
    type: 'field-list',
    name: 'fields',
    quantifier: '?',
    effect: 'modifies',
  },
  semantics: {
    preservesAll: true,
  },
  related: ['fillnull'],
  tags: ['filldown', 'propagate', 'null'],
};

// =============================================================================
// REPLACE COMMAND
// =============================================================================

/**
 * replace command
 *
 * Description: Replaces values in fields.
 */
export const replaceCommand: CommandSyntax = {
  command: 'replace',
  category: 'fields::modify',
  description: 'Replaces values in fields',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'string', name: 'searchValue' },
      { kind: 'literal', value: 'with' },
      { kind: 'param', type: 'string', name: 'replaceValue' },
      { kind: 'literal', value: 'in' },
      { kind: 'param', type: 'field-list', effect: 'modifies', name: 'fields' },
    ],
  },
  related: ['eval', 'rex'],
  tags: ['replace', 'substitute', 'modify'],
};

// =============================================================================
// MAKEMV COMMAND
// =============================================================================

/**
 * makemv command
 *
 * Description: Converts a single-value field to a multivalue field.
 */
export const makemvCommand: CommandSyntax = {
  command: 'makemv',
  category: '',
  description: 'Converts a single-value field to a multivalue field',
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
            { kind: 'literal', value: 'delim' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'delim' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'tokenizer' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'tokenizer' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'allowempty' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'allowempty' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'setsv' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'setsv' },
          ],
        },
      },
      { kind: 'param', type: 'field', name: 'field', effect: 'modifies' },
    ],
  },
  semantics: {
    preservesAll: true,
  },
  related: ['mvexpand', 'mvcombine'],
  tags: ['multivalue', 'split', 'delimiter'],
};

// =============================================================================
// MVCOMBINE COMMAND
// =============================================================================

/**
 * mvcombine command
 *
 * Description: Combines values of a field into a multivalue field.
 */
export const mvcombineCommand: CommandSyntax = {
  command: 'mvcombine',
  category: '',
  description: 'Combines values of a field into a multivalue field',
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
            { kind: 'literal', value: 'delim' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'delim' },
          ],
        },
      },
      { kind: 'param', type: 'field', name: 'field', effect: 'modifies' },
    ],
  },
  semantics: {
    preservesAll: true,
  },
  related: ['makemv', 'mvexpand'],
  tags: ['multivalue', 'combine', 'merge'],
};

// =============================================================================
// MVEXPAND COMMAND
// =============================================================================

/**
 * mvexpand command
 *
 * Description: Expands multivalue field into separate events.
 */
export const mvexpandCommand: CommandSyntax = {
  command: 'mvexpand',
  category: 'fields::modify',
  description: 'Expands multivalue field into separate events',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      {
        kind: 'param',
        type: 'field',
        name: 'field',
        effect: 'modifies',
      },
    ],
  },
  semantics: {
    preservesAll: true,
  },
  related: ['makemv', 'mvcombine'],
  tags: ['multivalue', 'expand', 'events'],
};

// =============================================================================
// RANGEMAP COMMAND
// =============================================================================

/**
 * rangemap command
 *
 * Description: Maps numeric field values to ranges with labels.
 */
export const rangemapCommand: CommandSyntax = {
  command: 'rangemap',
  category: '',
  description: 'Maps numeric field values to ranges with labels',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'field', name: 'field', effect: 'consumes' },
    ],
  },
  semantics: {
    staticCreates: [{ fieldName: 'range', dependsOn: ['field'] }],
    preservesAll: true,
  },
  related: ['eval'],
  tags: ['range', 'map', 'label', 'categorize'],
};

// =============================================================================
// CONVERT COMMAND
// =============================================================================

/**
 * convert command
 *
 * Description: Converts field values.
 */
export const convertCommand: CommandSyntax = {
  command: 'convert',
  category: 'fields::modify',
  description: 'Converts field values',
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
            { kind: 'literal', value: 'timeformat' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'timeformat' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '+',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'param', type: 'string', name: 'function' },
            { kind: 'literal', value: '(' },
            { kind: 'param', type: 'wc-field', name: 'field', effect: 'modifies' },
            { kind: 'literal', value: ')' },
            {
              kind: 'group',
              quantifier: '?',
              pattern: {
                kind: 'sequence',
                patterns: [
                  { kind: 'literal', value: 'as' },
                  { kind: 'param', type: 'field', name: 'alias', effect: 'creates' },
                ],
              },
            },
          ],
        },
      },
    ],
  },
  semantics: { preservesAll: true },
  tags: ['convert', 'transform'],
};

// =============================================================================
// AGGREGATE EXPORTS
// =============================================================================

/**
 * All field modifier command patterns
 */
export const fieldModifierCommands = {
  bin: binCommand,
  bucket: binCommand, // alias
  rename: renameCommand,
  fillnull: fillnullCommand,
  filldown: filldownCommand,
  replace: replaceCommand,
  makemv: makemvCommand,
  mvcombine: mvcombineCommand,
  mvexpand: mvexpandCommand,
  rangemap: rangemapCommand,
  convert: convertCommand,
} as const;
