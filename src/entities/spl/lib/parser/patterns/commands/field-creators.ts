/**
 * Field Creator Command Patterns
 *
 * Commands that create new fields or extract data.
 * Includes: eval, rex, spath, lookup, inputlookup, iplocation, strcat,
 * addtotals, tstats, xpath, xmlkv, erex, extract
 *
 * @module entities/spl/lib/parser/patterns/commands/field-creators
 */

import type { CommandSyntax } from '../types';

// =============================================================================
// EVAL COMMAND
// =============================================================================

/**
 * eval command
 *
 * Description: Calculates expressions and assigns results to fields.
 */
export const evalCommand: CommandSyntax = {
  command: 'eval',
  category: 'fields::modify',
  description: 'Calculates expressions and assigns results to fields',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'group',
    quantifier: '+',
    pattern: {
      kind: 'sequence',
      patterns: [
        {
          kind: 'param',
          type: 'field',
          name: 'targetField',
          effect: 'creates',
          dependsOnExpression: 'expression',
        },
        { kind: 'literal', value: '=' },
        {
          kind: 'param',
          type: 'evaled-field',
          name: 'expression',
        },
      ],
    },
  },
  semantics: {
    preservesAll: true,
  },
  related: ['where', 'stats'],
  tags: ['calculate', 'expression', 'function'],
};

// =============================================================================
// REX COMMAND
// =============================================================================

/**
 * rex command
 *
 * Description: Extracts fields using regular expression named capture groups.
 */
export const rexCommand: CommandSyntax = {
  command: 'rex',
  category: '',
  description: 'Extracts fields using regular expression named capture groups',
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
            { kind: 'literal', value: 'field' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'field', name: 'sourceField', effect: 'consumes' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'max_match' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'maxMatch' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'mode' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'mode' },
          ],
        },
      },
      { kind: 'param', type: 'string', name: 'pattern' },
    ],
  },
  semantics: {
    preservesAll: true,
  },
  related: ['extract', 'erex', 'kvform'],
  tags: ['regex', 'extract', 'parse', 'capture'],
};

// =============================================================================
// SPATH COMMAND
// =============================================================================

/**
 * spath command
 *
 * Description: Extracts fields from structured data (JSON/XML).
 */
export const spathCommand: CommandSyntax = {
  command: 'spath',
  category: 'fields::create',
  description: 'Extracts fields from structured data (JSON/XML)',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      {
        kind: 'param',
        type: 'field',
        name: 'inputField',
        effect: 'consumes',
      },
      {
        kind: 'param',
        type: 'field',
        name: 'outputField',
        effect: 'creates',
      },
    ],
  },
  related: ['rex', 'extract'],
  tags: ['json', 'xml', 'extract', 'structured-data'],
};

// =============================================================================
// LOOKUP COMMAND
// =============================================================================

/**
 * lookup command
 *
 * Description: Enriches events with fields from a lookup table.
 */
export const lookupCommand: CommandSyntax = {
  command: 'lookup',
  category: '',
  description: 'Enriches events with fields from a lookup table',
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
            { kind: 'literal', value: 'local' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'local' },
          ],
        },
      },
      { kind: 'param', type: 'string', name: 'lookupName' },
      {
        kind: 'group',
        quantifier: '+',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'param', type: 'field', name: 'inputField', effect: 'consumes' },
            {
              kind: 'group',
              quantifier: '?',
              pattern: {
                kind: 'sequence',
                patterns: [
                  { kind: 'literal', value: 'as' },
                  { kind: 'param', type: 'field', name: 'lookupField' },
                ],
              },
            },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            {
              kind: 'alternation',
              options: [
                { kind: 'literal', value: 'OUTPUT' },
                { kind: 'literal', value: 'OUTPUTNEW' },
              ],
            },
            {
              kind: 'group',
              quantifier: '+',
              pattern: {
                kind: 'sequence',
                patterns: [
                  { kind: 'param', type: 'field', name: 'outputField', effect: 'creates' },
                  {
                    kind: 'group',
                    quantifier: '?',
                    pattern: {
                      kind: 'sequence',
                      patterns: [
                        { kind: 'literal', value: 'as' },
                        { kind: 'param', type: 'field', name: 'outputAlias', effect: 'creates' },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  },
  semantics: {
    preservesAll: true,
  },
  related: ['inputlookup', 'outputlookup'],
  tags: ['lookup', 'enrich', 'join', 'table'],
};

// =============================================================================
// INPUTLOOKUP COMMAND
// =============================================================================

/**
 * inputlookup command
 *
 * Description: Loads results from a lookup table.
 */
export const inputlookupCommand: CommandSyntax = {
  command: 'inputlookup',
  category: '',
  description: 'Loads results from a lookup table',
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
                { kind: 'literal', value: 'append' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'append' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'start' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'start' },
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
          ],
        },
      },
      { kind: 'param', type: 'string', name: 'lookupName' },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'where' },
            { kind: 'param', type: 'evaled-field', name: 'whereClause' },
          ],
        },
      },
    ],
  },
  related: ['lookup', 'outputlookup'],
  tags: ['lookup', 'load', 'table', 'csv'],
};

// =============================================================================
// IPLOCATION COMMAND
// =============================================================================

/**
 * iplocation command
 *
 * Description: Adds geographic information based on IP addresses.
 */
export const iplocationCommand: CommandSyntax = {
  command: 'iplocation',
  category: 'fields::add',
  description: 'Adds geographic information based on IP addresses',
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
                { kind: 'literal', value: 'prefix' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'prefix' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'allfields' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'allfields' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'lang' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'lang' },
              ],
            },
          ],
        },
      },
      { kind: 'param', type: 'field', effect: 'consumes', name: 'ipField' },
    ],
  },
  semantics: { preservesAll: true },
  related: ['geostats', 'geom'],
  tags: ['ip', 'geographic', 'location'],
};

// =============================================================================
// STRCAT COMMAND
// =============================================================================

/**
 * strcat command
 *
 * Description: Concatenates string values from fields and literals.
 */
export const strcatCommand: CommandSyntax = {
  command: 'strcat',
  category: '',
  description: 'Concatenates string values from fields and literals',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'field-list', name: 'sourceFields', effect: 'consumes' },
      { kind: 'param', type: 'field', name: 'targetField', effect: 'creates', dependsOn: ['sourceFields'] },
    ],
  },
  semantics: {
    preservesAll: true,
  },
  related: ['eval'],
  tags: ['concatenate', 'string', 'combine'],
};

// =============================================================================
// ADDTOTALS COMMAND
// =============================================================================

/**
 * addtotals command
 *
 * Description: Adds row/column totals to tabular data.
 */
export const addtotalsCommand: CommandSyntax = {
  command: 'addtotals',
  category: 'fields::create',
  description: 'Adds row/column totals to tabular data',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      {
        kind: 'param',
        type: 'field-list',
        name: 'fields',
        effect: 'consumes',
      },
    ],
  },
  semantics: {
    preservesAll: true,
  },
  related: ['stats', 'eventstats'],
  tags: ['totals', 'aggregation', 'sum'],
};

// =============================================================================
// TSTATS COMMAND
// =============================================================================

/**
 * tstats command
 *
 * Description: Performs statistical queries on indexed fields from tsidx files.
 */
export const tstatsCommand: CommandSyntax = {
  command: 'tstats',
  category: '',
  description: 'Performs statistical queries on indexed fields from tsidx files',
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
            { kind: 'literal', value: 'prestats' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'prestats' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'local' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'local' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '+',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'param', type: 'stats-func', name: 'function' },
            { kind: 'literal', value: '(' },
            { kind: 'param', type: 'field', name: 'inputField', effect: 'consumes', quantifier: '?' },
            { kind: 'literal', value: ')' },
            {
              kind: 'group',
              quantifier: '?',
              pattern: {
                kind: 'sequence',
                patterns: [
                  { kind: 'literal', value: 'as' },
                  { kind: 'param', type: 'field', name: 'outputField', effect: 'creates', dependsOn: ['inputField'] },
                ],
              },
            },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'from' },
            { kind: 'literal', value: 'datamodel' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'datamodel' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'where' },
            { kind: 'param', type: 'string', name: 'whereClause' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'by' },
            { kind: 'param', type: 'field-list', name: 'byFields', effect: 'groups-by' },
          ],
        },
      },
    ],
  },
  semantics: {
    dropsAllExcept: ['byFields', 'creates'],
  },
  related: ['stats', 'datamodel'],
  tags: ['tstats', 'acceleration', 'datamodel', 'summary'],
};

// =============================================================================
// XPATH COMMAND
// =============================================================================

/**
 * xpath command
 *
 * Description: Extracts values using xpath expressions.
 */
export const xpathCommand: CommandSyntax = {
  command: 'xpath',
  category: 'fields::add',
  description: 'Extracts values using xpath expressions',
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
            { kind: 'literal', value: 'field' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'field', name: 'field', effect: 'consumes' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'outfield' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'field', name: 'outfield', effect: 'creates' },
          ],
        },
      },
      { kind: 'param', type: 'string', name: 'xpath' },
    ],
  },
  semantics: { preservesAll: true },
  related: ['xmlkv', 'spath'],
  tags: ['xpath', 'xml', 'extract'],
};

// =============================================================================
// XMLKV COMMAND
// =============================================================================

/**
 * xmlkv command
 *
 * Description: Extracts fields from XML data.
 */
export const xmlkvCommand: CommandSyntax = {
  command: 'xmlkv',
  category: 'fields::add',
  description: 'Extracts fields from XML data',
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
            { kind: 'literal', value: 'maxinputs' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'maxinputs' },
          ],
        },
      ],
    },
  },
  semantics: { preservesAll: true },
  related: ['spath', 'kv'],
  tags: ['xml', 'extract', 'key-value'],
};

// =============================================================================
// EREX COMMAND
// =============================================================================

/**
 * erex command
 *
 * Description: Generates regex from examples.
 */
export const erexCommand: CommandSyntax = {
  command: 'erex',
  category: 'fields::add',
  description: 'Generates regex from examples',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'field', name: 'outputField', effect: 'creates' },
      {
        kind: 'sequence',
        patterns: [
          { kind: 'literal', value: 'examples' },
          { kind: 'literal', value: '=' },
          { kind: 'param', type: 'string', name: 'examples' },
        ],
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'counterexamples' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'counterexamples' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'fromfield' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'field', name: 'fromfield', effect: 'consumes' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'maxtrainers' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'maxtrainers' },
          ],
        },
      },
    ],
  },
  semantics: { preservesAll: true },
  related: ['rex'],
  tags: ['erex', 'regex', 'extract'],
};

// =============================================================================
// EXTRACT COMMAND
// =============================================================================

/**
 * extract command
 *
 * Description: Extracts field-value pairs from raw text using automatic key=value extraction.
 */
export const extractCommand: CommandSyntax = {
  command: 'extract',
  category: '',
  description: 'Extracts field-value pairs from raw text using automatic key=value extraction',
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
            { kind: 'literal', value: 'kvdelim' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'kvdelim' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'pairdelim' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'pairdelim' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'limit' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'limit' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'maxchars' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'maxchars' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'reload' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'reload' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'clean_keys' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'cleanKeys' },
          ],
        },
      ],
    },
  },
  semantics: {
    preservesAll: true,
  },
  related: ['rex', 'kv'],
  tags: ['extract', 'parse', 'key-value'],
};

// =============================================================================
// AGGREGATE EXPORTS
// =============================================================================

/**
 * All field creator command patterns
 */
export const fieldCreatorCommands = {
  eval: evalCommand,
  rex: rexCommand,
  spath: spathCommand,
  lookup: lookupCommand,
  inputlookup: inputlookupCommand,
  iplocation: iplocationCommand,
  strcat: strcatCommand,
  addtotals: addtotalsCommand,
  tstats: tstatsCommand,
  xpath: xpathCommand,
  xmlkv: xmlkvCommand,
  erex: erexCommand,
  extract: extractCommand,
} as const;
