/**
 * SPL Command Pattern Registry
 *
 * **Single Source of Truth for Command Patterns**
 *
 * This file is the authoritative source for all SPL command syntax patterns.
 * Each pattern defines the syntax, field positions, and semantic effects
 * for an SPL command.
 *
 * ## Architecture Decision: Consolidation (2025-12-02)
 *
 * Previously, this module shared pattern definitions with `generated-patterns.ts`,
 * creating ~14k lines of duplicated content and maintenance burden.
 *
 * **Decision**: Keep `registry.ts` as the single source of truth.
 * - `generated-patterns.ts` has been deleted
 * - All imports now use `registry.ts`
 * - If additional commands are needed beyond what's manually curated here,
 *   use code generation to create supplementary files (don't create new duplicates)
 *
 * ## Adding New Patterns
 *
 * When adding a new command:
 * 1. Define the pattern object following existing conventions
 * 2. Add to COMMAND_PATTERNS registry at end of file
 * 3. Update patterns/index.ts to export the new command
 * 4. Add corresponding visitor method to AST transformer (if needed)
 *
 * @module entities/spl/lib/parser/patterns/registry
 */

import type { CommandSyntax, PatternRegistry } from './types';

// =============================================================================
// BIN COMMAND
// =============================================================================

/**
 * bin command
 *
 * Description: Puts continuous numerical values into discrete sets (bins).
 * Syntax: bin [span=<span>] [minspan=<span>] [bins=<int>] [start=<num>] [end=<num>] [aligntime=<time>] <field> [AS <newfield>]
 */
export const binCommand: CommandSyntax = {
  command: 'bin',
  category: 'reporting',
  description: 'Puts continuous numerical values into discrete sets',
  syntax: {
    kind: 'sequence',
    patterns: [
      // Optional parameters: span, minspan, bins, start, end, aligntime
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
      // <field> - the field to bin
      {
        kind: 'param',
        type: 'field',
        name: 'field',
        effect: 'modifies',
      },
      // (AS <field>)? - optional alias
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
 * Syntax: rename <wc-field> AS <wc-field> [, <wc-field> AS <wc-field>]...
 * Description: Renames fields (supports wildcards).
 */
export const renameCommand: CommandSyntax = {
  command: 'rename',
  category: 'fields::modify',
  description: 'Renames a specified field (wildcards supported)',
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
 * Syntax: fillnull [value=<string>] [<field-list>]
 * Description: Replaces null values with a specified value (default "0").
 */
export const fillnullCommand: CommandSyntax = {
  command: 'fillnull',
  category: 'fields::modify',
  description: 'Replaces null values with a specified value',
  syntax: {
    kind: 'sequence',
    patterns: [
      // (value=<string>)? - optional value parameter
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
      // (<field-list>)? - optional list of fields to fill
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
// DEDUP COMMAND
// =============================================================================

/**
 * dedup command
 *
 * Syntax: dedup [<N>] <field-list> [keepevents=<bool>] [keepempty=<bool>] [consecutive=<bool>] [sortby <field>]
 * Description: Removes duplicate events based on field values.
 */
export const dedupCommand: CommandSyntax = {
  command: 'dedup',
  category: 'results::filter',
  description: 'Removes events with identical field value combinations',
  syntax: {
    kind: 'sequence',
    patterns: [
      // (<int>)? - optional count
      {
        kind: 'param',
        type: 'int',
        name: 'count',
        quantifier: '?',
      },
      // <field-list> - fields to dedup by
      {
        kind: 'param',
        type: 'field-list',
        name: 'fields',
        effect: 'consumes',
      },
      // Optional flags and sortby
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
  syntax: {
    kind: 'sequence',
    patterns: [
      // (<int>)? - optional limit
      {
        kind: 'param',
        type: 'int',
        name: 'limit',
        quantifier: '?',
      },
      // <sort-by-clause> - fields to sort by
      // Note: Simplified as field-list; actual implementation would handle +/- prefixes
      {
        kind: 'param',
        type: 'field-list',
        name: 'sortFields',
        effect: 'consumes', // Reads fields for sorting
      },
    ],
  },
  related: ['reverse'],
  tags: ['order', 'arrange', 'rank'],
};

// =============================================================================
// EVAL COMMAND
// =============================================================================

/**
 * eval command
 *
 * Syntax: eval <field>=<expression> [, <field>=<expression>]...
 * Description: Calculates an expression and assigns the result to a field.
 */
export const evalCommand: CommandSyntax = {
  command: 'eval',
  category: 'fields::modify',
  description: 'Calculates expressions and assigns results to fields',
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
// STATS COMMAND
// =============================================================================

/**
 * stats command
 *
 * Note: Also handles eventstats, streamstats, chart, timechart variants.
 * Syntax: stats [allnum=<bool>] <stats-func>(<field>) [AS <field>] [, ...] [BY <field-list>]
 *
 * Description: Calculates aggregate statistics over result sets.
 */
export const statsCommand: CommandSyntax = {
  command: 'stats',
  category: 'reporting',
  description: 'Calculates aggregate statistics over result sets',
  syntax: {
    kind: 'sequence',
    patterns: [
      // Optional allnum parameter
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'allnum' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'allnum' },
          ],
        },
      },
      // <stats-agg-clause>+ - one or more aggregations: func(field) [AS alias]
      {
        kind: 'group',
        quantifier: '+',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'param', type: 'stats-func', name: 'function' },
            { kind: 'literal', value: '(' },
            {
              kind: 'param',
              type: 'field',
              name: 'inputField',
              effect: 'consumes',
              quantifier: '?',
            },
            { kind: 'literal', value: ')' },
            // Optional AS alias
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
                    name: 'outputField',
                    effect: 'creates',
                    dependsOn: ['inputField'],
                  },
                ],
              },
            },
          ],
        },
      },
      // (BY <field-list>)? - optional grouping fields
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'by' },
            {
              kind: 'param',
              type: 'field-list',
              name: 'byFields',
              effect: 'groups-by',
            },
          ],
        },
      },
    ],
  },
  // Command-level semantics with variant-specific rules
  semantics: {
    dropsAllExcept: ['byFields', 'creates'],
    variantRules: {
      'stats': { dropsAllExcept: ['byFields', 'creates'] },
      'chart': { dropsAllExcept: ['byFields', 'creates'] },
      'timechart': { dropsAllExcept: ['byFields', 'creates'] },
      'eventstats': { preservesAll: true },
      'streamstats': { preservesAll: true },
    },
  },
  related: ['eventstats', 'streamstats', 'chart', 'timechart'],
  tags: ['aggregate', 'summarize', 'group', 'count', 'sum', 'avg'],
};

// =============================================================================
// SPATH COMMAND
// =============================================================================

/**
 * spath command
 *
 * Description: Extracts fields from structured data (JSON, XML) using paths.
 */
export const spathCommand: CommandSyntax = {
  command: 'spath',
  category: 'fields::create',
  description: 'Extracts fields from structured data (JSON/XML)',
  syntax: {
    kind: 'sequence',
    patterns: [
      // inputField - Maps to AST node 'inputField' property
      {
        kind: 'param',
        type: 'field',
        name: 'inputField',
        effect: 'consumes', // Reads from this field
      },
      // outputField - Maps to AST node 'outputField' property (optional)
      {
        kind: 'param',
        type: 'field',
        name: 'outputField',
        effect: 'creates', // Creates this output field
      },
    ],
  },
  related: ['rex', 'extract'],
  tags: ['json', 'xml', 'extract', 'structured-data'],
};

// =============================================================================
// MVEXPAND COMMAND
// =============================================================================

/**
 * mvexpand command
 *
 * Description: Expands a multivalue field into separate events, one per value.
 * Creates multiple events from a single event, preserving all other fields.
 */
export const mvexpandCommand: CommandSyntax = {
  command: 'mvexpand',
  category: 'fields::modify',
  description: 'Expands multivalue field into separate events',
  syntax: {
    kind: 'sequence',
    patterns: [
      // field - The multivalue field to expand
      {
        kind: 'param',
        type: 'field',
        name: 'field',
        effect: 'modifies', // Converts multivalue → single value per event
      },
    ],
  },
  semantics: {
    // mvexpand preserves all fields (creates multiple events with same fields)
    preservesAll: true,
  },
  related: ['makemv', 'mvcombine'],
  tags: ['multivalue', 'expand', 'events'],
};

// =============================================================================
// ADDTOTALS COMMAND
// =============================================================================

/**
 * addtotals command
 *
 * Description: Adds row/column totals to tabular data.
 * Creates a new field with totals (default name: "Total" or specified via fieldname).
 */
export const addtotalsCommand: CommandSyntax = {
  command: 'addtotals',
  category: 'fields::create',
  description: 'Adds row/column totals to tabular data',
  syntax: {
    kind: 'sequence',
    patterns: [
      // fields - Fields to total (consumes)
      {
        kind: 'param',
        type: 'field-list',
        name: 'fields',
        effect: 'consumes',
      },
    ],
  },
  semantics: {
    // addtotals preserves all fields and adds total fields
    preservesAll: true,
  },
  related: ['stats', 'eventstats'],
  tags: ['totals', 'aggregation', 'sum'],
};

// =============================================================================
// OUTPUTLOOKUP COMMAND
// =============================================================================

/**
 * outputlookup command
 *
 * Description: Saves search results to a lookup table (CSV file or named lookup).
 */
export const outputlookupCommand: CommandSyntax = {
  command: 'outputlookup',
  category: 'results::write',
  description: 'Saves search results to a lookup table',
  syntax: {
    kind: 'sequence',
    patterns: [
      // Optional parameters (simplified - actual implementation would handle all options)
      {
        kind: 'group',
        quantifier: '*',
        pattern: {
          kind: 'alternation',
          options: [
            {
              kind: 'param',
              type: 'bool',
              name: 'append',
            },
            {
              kind: 'param',
              type: 'bool',
              name: 'create_empty',
            },
            {
              kind: 'param',
              type: 'bool',
              name: 'override_if_empty',
            },
            {
              kind: 'param',
              type: 'int',
              name: 'max',
            },
            {
              kind: 'param',
              type: 'field',
              name: 'key_field',
            },
            {
              kind: 'param',
              type: 'bool',
              name: 'createinapp',
            },
            {
              kind: 'param',
              type: 'string',
              name: 'output_format',
            },
          ],
        },
      },
      // Filename or table name (required)
      {
        kind: 'param',
        type: 'string',
        name: 'destination',
      },
    ],
  },
  related: ['inputlookup', 'lookup', 'outputcsv'],
  tags: ['output', 'csv', 'save', 'write', 'lookup', 'table'],
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
  syntax: {
    kind: 'param',
    type: 'field-list',
    name: 'fields',
    effect: 'consumes',
  },
  // Note: table drops all fields except those listed.
  // This is handled specially in the lineage interpreter.
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
// EXTRACT COMMAND
// =============================================================================

/**
 * extract command
 *
 * Description: Extracts field-value pairs from raw text.
 */
export const extractCommand: CommandSyntax = {
  command: 'extract',
  category: '',
  description: 'Extracts field-value pairs from raw text using automatic key=value extraction',
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
// KV COMMAND
// =============================================================================

/**
 * kv command (alias for extract)
 *
 * Description: Extracts key-value pairs from raw text.
 */
export const kvCommand: CommandSyntax = {
  command: 'kv',
  category: '',
  description: 'Extracts key-value pairs from raw text (alias for extract)',
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
      ],
    },
  },
  semantics: {
    preservesAll: true,
  },
  related: ['extract', 'rex'],
  tags: ['extract', 'parse', 'key-value'],
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
  tags: ['fill', 'null', 'propagate'],
};

// =============================================================================
// ACCUM COMMAND
// =============================================================================

/**
 * accum command
 *
 * Description: Computes a running total of a numeric field.
 */
export const accumCommand: CommandSyntax = {
  command: 'accum',
  category: '',
  description: 'Computes a running total of a numeric field',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'field', name: 'field', effect: 'consumes' },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'as' },
            { kind: 'param', type: 'field', name: 'alias', effect: 'creates', dependsOn: ['field'] },
          ],
        },
      },
    ],
  },
  semantics: {
    preservesAll: true,
  },
  related: ['autoregress', 'delta', 'streamstats'],
  tags: ['running', 'total', 'cumulative', 'sum'],
};

// =============================================================================
// AUTOREGRESS COMMAND
// =============================================================================

/**
 * autoregress command
 *
 * Description: Copies field values from previous events into current event.
 */
export const autoregressCommand: CommandSyntax = {
  command: 'autoregress',
  category: '',
  description: 'Copies field values from previous events into current event',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'field', name: 'field', effect: 'consumes' },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'as' },
            { kind: 'param', type: 'field', name: 'alias', effect: 'creates', dependsOn: ['field'] },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'p' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'lag' },
          ],
        },
      },
    ],
  },
  semantics: {
    preservesAll: true,
  },
  related: ['accum', 'delta', 'streamstats'],
  tags: ['lag', 'previous', 'time-series'],
};

// =============================================================================
// DELTA COMMAND
// =============================================================================

/**
 * delta command
 *
 * Description: Computes the difference between current and previous values.
 */
export const deltaCommand: CommandSyntax = {
  command: 'delta',
  category: '',
  description: 'Computes the difference between current and previous values',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'field', name: 'field', effect: 'consumes' },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'as' },
            { kind: 'param', type: 'field', name: 'alias', effect: 'creates', dependsOn: ['field'] },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'p' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'lag' },
          ],
        },
      },
    ],
  },
  semantics: {
    preservesAll: true,
  },
  related: ['accum', 'autoregress', 'streamstats'],
  tags: ['difference', 'change', 'time-series'],
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
  syntax: {
    kind: 'sequence',
    patterns: [
      {
        kind: 'sequence',
        patterns: [
          { kind: 'literal', value: 'field' },
          { kind: 'literal', value: '=' },
          { kind: 'param', type: 'field', name: 'field', effect: 'consumes' },
        ],
      },
      {
        kind: 'group',
        quantifier: '+',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'param', type: 'string', name: 'rangeName' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'rangeSpec' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'default' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'default' },
          ],
        },
      },
    ],
  },
  semantics: {
    preservesAll: true,
  },
  related: ['eval'],
  tags: ['range', 'map', 'label', 'categorize'],
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
  syntax: {
    kind: 'sequence',
    patterns: [
      {
        kind: 'group',
        quantifier: '+',
        pattern: {
          kind: 'alternation',
          options: [
            { kind: 'param', type: 'field', name: 'sourceField', effect: 'consumes' },
            { kind: 'param', type: 'string', name: 'literal' },
          ],
        },
      },
      { kind: 'param', type: 'field', name: 'destField', effect: 'creates', dependsOn: ['sourceField'] },
    ],
  },
  semantics: {
    preservesAll: true,
  },
  related: ['eval'],
  tags: ['concatenate', 'string', 'combine'],
};

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
// GAUGE COMMAND
// =============================================================================

/**
 * gauge command
 *
 * Description: Displays a gauge visualization.
 */
export const gaugeCommand: CommandSyntax = {
  command: 'gauge',
  category: 'reporting',
  description: 'Displays a gauge visualization',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'field', effect: 'consumes', name: 'field' },
      {
        kind: 'group',
        quantifier: '*',
        pattern: { kind: 'param', type: 'num', name: 'rangeValue' },
      },
    ],
  },
  related: ['chart'],
  tags: ['gauge', 'visualization'],
};

// =============================================================================
// GENTIMES COMMAND
// =============================================================================

/**
 * gentimes command
 *
 * Description: Generates time range results.
 */
export const gentimesCommand: CommandSyntax = {
  command: 'gentimes',
  category: 'generating',
  description: 'Generates time range results',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'literal', value: 'start' },
      { kind: 'literal', value: '=' },
      { kind: 'param', type: 'string', name: 'start' },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'end' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'end' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'increment' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'increment' },
          ],
        },
      },
    ],
  },
  related: ['makeresults'],
  tags: ['generate', 'time', 'range'],
};

// =============================================================================
// GEOM COMMAND
// =============================================================================

/**
 * geom command
 *
 * Description: Adds geographic fields from a feature collection.
 */
export const geomCommand: CommandSyntax = {
  command: 'geom',
  category: 'fields::add',
  description: 'Adds geographic fields from a feature collection',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'string', name: 'featureCollection' },
      {
        kind: 'group',
        quantifier: '*',
        pattern: {
          kind: 'alternation',
          options: [
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'featureIdField' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'field', effect: 'consumes', name: 'featureIdField' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'gen' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'num', name: 'gen' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'min_x' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'num', name: 'min_x' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'min_y' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'num', name: 'min_y' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'max_x' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'num', name: 'max_x' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'max_y' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'num', name: 'max_y' },
              ],
            },
          ],
        },
      },
    ],
  },
  semantics: { preservesAll: true },
  related: ['geostats', 'iplocation'],
  tags: ['geographic', 'map', 'choropleth'],
};

// =============================================================================
// GEOMFILTER COMMAND
// =============================================================================

/**
 * geomfilter command
 *
 * Description: Filters geographic data by bounding box.
 */
export const geomfilterCommand: CommandSyntax = {
  command: 'geomfilter',
  category: 'results',
  description: 'Filters geographic data by bounding box',
  syntax: {
    kind: 'group',
    quantifier: '*',
    pattern: {
      kind: 'alternation',
      options: [
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'min_x' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'num', name: 'min_x' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'min_y' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'num', name: 'min_y' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'max_x' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'num', name: 'max_x' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'max_y' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'num', name: 'max_y' },
          ],
        },
      ],
    },
  },
  related: ['geom', 'geostats'],
  tags: ['geographic', 'filter', 'bounding-box'],
};

// =============================================================================
// GEOSTATS COMMAND
// =============================================================================

/**
 * geostats command
 *
 * Description: Generates statistics for geographic data.
 */
export const geostatsCommand: CommandSyntax = {
  command: 'geostats',
  category: 'reporting',
  description: 'Generates statistics for geographic data',
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
                { kind: 'literal', value: 'latfield' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'field', effect: 'consumes', name: 'latfield' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'longfield' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'field', effect: 'consumes', name: 'longfield' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'maxzoomlevel' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'maxzoomlevel' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'globallimit' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'globallimit' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'locallimit' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'locallimit' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'binspanlat' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'num', name: 'binspanlat' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'binspanlong' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'num', name: 'binspanlong' },
              ],
            },
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
            { kind: 'param', type: 'field', effect: 'consumes', quantifier: '?' },
            { kind: 'literal', value: ')' },
            {
              kind: 'group',
              quantifier: '?',
              pattern: {
                kind: 'sequence',
                patterns: [
                  { kind: 'literal', value: 'as' },
                  { kind: 'param', type: 'field', effect: 'creates', name: 'alias' },
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
            { kind: 'literal', value: 'by' },
            { kind: 'param', type: 'field-list', effect: 'groups-by', name: 'byFields' },
          ],
        },
      },
    ],
  },
  semantics: { dropsAllExcept: ['byFields', 'creates'] },
  related: ['stats', 'geom', 'iplocation'],
  tags: ['geographic', 'statistics', 'cluster'],
};

// =============================================================================
// HIGHLIGHT COMMAND
// =============================================================================

/**
 * highlight command
 *
 * Description: Highlights search terms in results.
 */
export const highlightCommand: CommandSyntax = {
  command: 'highlight',
  category: 'misc',
  description: 'Highlights search terms in results',
  syntax: {
    kind: 'param',
    type: 'string',
    name: 'terms',
    quantifier: '+',
  },
  related: ['search'],
  tags: ['highlight', 'display', 'terms'],
};

// =============================================================================
// HISTORY COMMAND
// =============================================================================

/**
 * history command
 *
 * Description: Returns search history.
 */
export const historyCommand: CommandSyntax = {
  command: 'history',
  category: 'misc',
  description: 'Returns search history',
  syntax: {
    kind: 'group',
    quantifier: '?',
    pattern: {
      kind: 'sequence',
      patterns: [
        { kind: 'literal', value: 'events' },
        { kind: 'literal', value: '=' },
        { kind: 'param', type: 'bool', name: 'events' },
      ],
    },
  },
  related: ['audit'],
  tags: ['history', 'audit', 'search'],
};

// =============================================================================
// ICONIFY COMMAND
// =============================================================================

/**
 * iconify command
 *
 * Description: Displays field values as icons.
 */
export const iconifyCommand: CommandSyntax = {
  command: 'iconify',
  category: 'misc',
  description: 'Displays field values as icons',
  syntax: {
    kind: 'param',
    type: 'field-list',
    effect: 'consumes',
    name: 'fields',
  },
  related: ['eval'],
  tags: ['icon', 'display', 'visualization'],
};

// =============================================================================
// INPUTCSV COMMAND
// =============================================================================

/**
 * inputcsv command
 *
 * Description: Loads results from a CSV file.
 */
export const inputcsvCommand: CommandSyntax = {
  command: 'inputcsv',
  category: 'input',
  description: 'Loads results from a CSV file',
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
                { kind: 'literal', value: 'dispatch' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'dispatch' },
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
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'events' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'events' },
              ],
            },
          ],
        },
      },
      { kind: 'param', type: 'string', name: 'filename' },
    ],
  },
  related: ['outputcsv', 'inputlookup'],
  tags: ['input', 'csv', 'file'],
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
// KMEANS COMMAND
// =============================================================================

/**
 * kmeans command
 *
 * Description: Performs k-means clustering on data.
 */
export const kmeansCommand: CommandSyntax = {
  command: 'kmeans',
  category: 'reporting',
  description: 'Performs k-means clustering on data',
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
                { kind: 'literal', value: 'k' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'k' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'maxiters' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'maxiters' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'reps' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'reps' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'dt' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'dt' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'cfield' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'field', effect: 'creates', name: 'cfield' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'dfield' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'field', effect: 'creates', name: 'dfield' },
              ],
            },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: { kind: 'param', type: 'field-list', effect: 'consumes', name: 'fields' },
      },
    ],
  },
  semantics: { preservesAll: true },
  related: ['cluster', 'anomalydetection'],
  tags: ['kmeans', 'clustering', 'machine-learning'],
};

// =============================================================================
// KVFORM COMMAND
// =============================================================================

/**
 * kvform command
 *
 * Description: Extracts key-value pairs using form templates.
 */
export const kvformCommand: CommandSyntax = {
  command: 'kvform',
  category: 'fields::add',
  description: 'Extracts key-value pairs using form templates',
  syntax: {
    kind: 'sequence',
    patterns: [
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'form' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'form' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'field' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'field', effect: 'consumes', name: 'field' },
          ],
        },
      },
    ],
  },
  semantics: { preservesAll: true },
  related: ['rex', 'extract', 'kv'],
  tags: ['extract', 'form', 'key-value'],
};

// =============================================================================
// LOADJOB COMMAND
// =============================================================================

/**
 * loadjob command
 *
 * Description: Loads results from a previously run search job.
 */
export const loadjobCommand: CommandSyntax = {
  command: 'loadjob',
  category: 'input',
  description: 'Loads results from a previously run search job',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'string', name: 'sid' },
      {
        kind: 'group',
        quantifier: '*',
        pattern: {
          kind: 'alternation',
          options: [
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'events' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'events' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'job_delegate' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'job_delegate' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'artifact_offset' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'artifact_offset' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'ignore_running' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'ignore_running' },
              ],
            },
          ],
        },
      },
    ],
  },
  related: ['savedsearch'],
  tags: ['load', 'job', 'results'],
};

// =============================================================================
// LOCALIZE COMMAND
// =============================================================================

/**
 * localize command
 *
 * Description: Returns time ranges of events.
 */
export const localizeCommand: CommandSyntax = {
  command: 'localize',
  category: 'results',
  description: 'Returns time ranges of events',
  syntax: {
    kind: 'group',
    quantifier: '*',
    pattern: {
      kind: 'alternation',
      options: [
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
            { kind: 'literal', value: 'timeafter' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'timeafter' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'timebefore' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'timebefore' },
          ],
        },
      ],
    },
  },
  related: ['transaction'],
  tags: ['localize', 'time', 'range'],
};

// =============================================================================
// LOCALOP COMMAND
// =============================================================================

/**
 * localop command
 *
 * Description: Runs subsequent commands on the search head only.
 */
export const localopCommand: CommandSyntax = {
  command: 'localop',
  category: 'misc',
  description: 'Runs subsequent commands on the search head only',
  syntax: { kind: 'literal', value: 'localop' },
  related: [],
  tags: ['local', 'search-head'],
};

// =============================================================================
// MAKECONTINUOUS COMMAND
// =============================================================================

/**
 * makecontinuous command
 *
 * Description: Makes a field continuous by filling gaps.
 */
export const makecontinuousCommand: CommandSyntax = {
  command: 'makecontinuous',
  category: 'fields::modify',
  description: 'Makes a field continuous by filling gaps',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'field', effect: 'modifies', name: 'field' },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'span' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'span' },
          ],
        },
      },
    ],
  },
  related: ['bin', 'timechart'],
  tags: ['continuous', 'fill', 'gaps'],
};

// =============================================================================
// MAKERESULTS COMMAND
// =============================================================================

/**
 * makeresults command
 *
 * Description: Generates result rows from nothing.
 */
export const makeresultsCommand: CommandSyntax = {
  command: 'makeresults',
  category: 'generating',
  description: 'Generates result rows from nothing',
  syntax: {
    kind: 'group',
    quantifier: '*',
    pattern: {
      kind: 'alternation',
      options: [
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'count' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'count' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'annotate' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'annotate' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'splunk_server' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'splunk_server' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'splunk_server_group' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'splunk_server_group' },
          ],
        },
      ],
    },
  },
  related: ['gentimes'],
  tags: ['generate', 'results', 'create'],
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
// MCOLLECT COMMAND
// =============================================================================

/**
 * mcollect command
 *
 * Description: Writes results to a metrics index.
 */
export const mcollectCommand: CommandSyntax = {
  command: 'mcollect',
  category: 'output',
  description: 'Writes results to a metrics index',
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
                { kind: 'literal', value: 'index' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'index' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'file' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'file' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'spool' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'spool' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'prefix_field' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'prefix_field' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'host' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'host' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'source' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'source' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'sourcetype' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'sourcetype' },
              ],
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
            { kind: 'literal', value: 'split' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'split' },
          ],
        },
      },
    ],
  },
  related: ['collect', 'mstats'],
  tags: ['metrics', 'collect', 'output'],
};

// =============================================================================
// METADATA COMMAND
// =============================================================================

/**
 * metadata command
 *
 * Description: Returns metadata about sources, sourcetypes, or hosts.
 */
export const metadataCommand: CommandSyntax = {
  command: 'metadata',
  category: 'misc',
  description: 'Returns metadata about sources, sourcetypes, or hosts',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'literal', value: 'type' },
      { kind: 'literal', value: '=' },
      {
        kind: 'alternation',
        options: [
          { kind: 'literal', value: 'hosts' },
          { kind: 'literal', value: 'sources' },
          { kind: 'literal', value: 'sourcetypes' },
        ],
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'index' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'index' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'splunk_server' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'splunk_server' },
          ],
        },
      },
    ],
  },
  related: ['metasearch'],
  tags: ['metadata', 'hosts', 'sources', 'sourcetypes'],
};

// =============================================================================
// METASEARCH COMMAND
// =============================================================================

/**
 * metasearch command
 *
 * Description: Retrieves event metadata from indexes.
 */
export const metasearchCommand: CommandSyntax = {
  command: 'metasearch',
  category: 'misc',
  description: 'Retrieves event metadata from indexes',
  syntax: {
    kind: 'param',
    type: 'string',
    name: 'searchExpression',
  },
  related: ['metadata'],
  tags: ['metadata', 'search'],
};

// =============================================================================
// MEVENTCOLLECT COMMAND
// =============================================================================

/**
 * meventcollect command
 *
 * Description: Writes results to a metrics index as events.
 */
export const meventcollectCommand: CommandSyntax = {
  command: 'meventcollect',
  category: 'output',
  description: 'Writes results to a metrics index as events',
  syntax: {
    kind: 'group',
    quantifier: '*',
    pattern: {
      kind: 'alternation',
      options: [
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'index' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'index' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'source' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'source' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'sourcetype' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'sourcetype' },
          ],
        },
      ],
    },
  },
  related: ['mcollect', 'collect'],
  tags: ['metrics', 'events', 'collect'],
};

// =============================================================================
// MPREVIEW COMMAND
// =============================================================================

/**
 * mpreview command
 *
 * Description: Previews metrics data.
 */
export const mpreviewCommand: CommandSyntax = {
  command: 'mpreview',
  category: 'input',
  description: 'Previews metrics data',
  syntax: {
    kind: 'group',
    quantifier: '*',
    pattern: {
      kind: 'alternation',
      options: [
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'index' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'index' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'filter' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'filter' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'splunk_server' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'splunk_server' },
          ],
        },
      ],
    },
  },
  related: ['mstats'],
  tags: ['metrics', 'preview'],
};

// =============================================================================
// MSTATS COMMAND
// =============================================================================

/**
 * mstats command
 *
 * Description: Performs statistical analysis on metrics data.
 */
export const mstatsCommand: CommandSyntax = {
  command: 'mstats',
  category: 'reporting',
  description: 'Performs statistical analysis on metrics data',
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
                { kind: 'literal', value: 'prestats' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'prestats' },
              ],
            },
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
                { kind: 'literal', value: 'backfill' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'backfill' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'fillnull_value' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'fillnull_value' },
              ],
            },
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
            { kind: 'param', type: 'field', effect: 'consumes', quantifier: '?' },
            { kind: 'literal', value: ')' },
            {
              kind: 'group',
              quantifier: '?',
              pattern: {
                kind: 'sequence',
                patterns: [
                  { kind: 'literal', value: 'as' },
                  { kind: 'param', type: 'field', effect: 'creates', name: 'alias' },
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
            { kind: 'literal', value: 'where' },
            { kind: 'param', type: 'evaled-field', name: 'whereClause' },
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
            { kind: 'param', type: 'field-list', effect: 'groups-by', name: 'byFields' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'span' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'span' },
          ],
        },
      },
    ],
  },
  semantics: { dropsAllExcept: ['byFields', 'creates'] },
  related: ['stats', 'mcollect'],
  tags: ['metrics', 'statistics', 'aggregation'],
};

// =============================================================================
// MULTIKV COMMAND
// =============================================================================

/**
 * multikv command
 *
 * Description: Extracts field values from table-formatted events.
 */
export const multikvCommand: CommandSyntax = {
  command: 'multikv',
  category: 'fields::add',
  description: 'Extracts field values from table-formatted events',
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
                { kind: 'literal', value: 'conf' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'conf' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'copyattrs' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'copyattrs' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'filter' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'filter' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'forceheader' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'forceheader' },
              ],
            },
            { kind: 'literal', value: 'noheader' },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'rmorig' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'rmorig' },
              ],
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
            { kind: 'literal', value: 'fields' },
            { kind: 'param', type: 'field-list', effect: 'creates', name: 'fields' },
          ],
        },
      },
    ],
  },
  related: ['kv', 'extract'],
  tags: ['extract', 'table', 'key-value'],
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
// NOMV COMMAND
// =============================================================================

/**
 * nomv command
 *
 * Description: Converts a multivalue field to a single value.
 */
export const nomvCommand: CommandSyntax = {
  command: 'nomv',
  category: 'fields::modify',
  description: 'Converts a multivalue field to a single value',
  syntax: {
    kind: 'param',
    type: 'field',
    effect: 'modifies',
    name: 'field',
  },
  related: ['makemv', 'mvexpand'],
  tags: ['multivalue', 'single', 'convert'],
};

// =============================================================================
// OUTLIER COMMAND
// =============================================================================

/**
 * outlier command
 *
 * Description: Removes or transforms outliers from results.
 */
export const outlierCommand: CommandSyntax = {
  command: 'outlier',
  category: 'reporting',
  description: 'Removes or transforms outliers from results',
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
                { kind: 'literal', value: 'action' },
                { kind: 'literal', value: '=' },
                {
                  kind: 'alternation',
                  options: [
                    { kind: 'literal', value: 'remove' },
                    { kind: 'literal', value: 'transform' },
                  ],
                },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'param' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'num', name: 'param' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'uselower' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'uselower' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'mark' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'mark' },
              ],
            },
          ],
        },
      },
      { kind: 'param', type: 'field', effect: 'modifies', name: 'field' },
    ],
  },
  related: ['anomalydetection'],
  tags: ['outlier', 'anomaly', 'statistics'],
};

// =============================================================================
// OUTPUTCSV COMMAND
// =============================================================================

/**
 * outputcsv command
 *
 * Description: Outputs results to a CSV file.
 */
export const outputcsvCommand: CommandSyntax = {
  command: 'outputcsv',
  category: 'output',
  description: 'Outputs results to a CSV file',
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
                { kind: 'literal', value: 'create_empty' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'create_empty' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'dispatch' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'dispatch' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'usexml' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'usexml' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'singlefile' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'singlefile' },
              ],
            },
          ],
        },
      },
      { kind: 'param', type: 'string', name: 'filename' },
    ],
  },
  related: ['inputcsv', 'outputlookup'],
  tags: ['output', 'csv', 'file'],
};

// =============================================================================
// PIVOT COMMAND
// =============================================================================

/**
 * pivot command
 *
 * Description: Creates pivot reports from data models.
 */
export const pivotCommand: CommandSyntax = {
  command: 'pivot',
  category: 'reporting',
  description: 'Creates pivot reports from data models',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'string', name: 'datamodelName' },
      { kind: 'param', type: 'string', name: 'objectName' },
      { kind: 'param', type: 'string', name: 'pivotDescription' },
    ],
  },
  related: ['datamodel', 'tstats'],
  tags: ['pivot', 'datamodel', 'reporting'],
};

// =============================================================================
// PREDICT COMMAND
// =============================================================================

/**
 * predict command
 *
 * Description: Predicts future values based on historical data.
 */
export const predictCommand: CommandSyntax = {
  command: 'predict',
  category: 'reporting',
  description: 'Predicts future values based on historical data',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'field', effect: 'consumes', name: 'field' },
      {
        kind: 'group',
        quantifier: '*',
        pattern: {
          kind: 'alternation',
          options: [
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'as' },
                { kind: 'param', type: 'field', effect: 'creates', name: 'newField' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'algorithm' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'algorithm' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'future_timespan' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'future_timespan' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'holdback' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'holdback' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'period' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'period' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'upper' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'field', effect: 'creates', name: 'upper' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'lower' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'field', effect: 'creates', name: 'lower' },
              ],
            },
          ],
        },
      },
    ],
  },
  semantics: { preservesAll: true },
  related: ['trendline', 'timechart'],
  tags: ['predict', 'forecast', 'machine-learning'],
};

// =============================================================================
// RARE COMMAND
// =============================================================================

/**
 * rare command
 *
 * Description: Finds least common values of fields.
 */
export const rareCommand: CommandSyntax = {
  command: 'rare',
  category: 'reporting',
  description: 'Finds least common values of fields',
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
                { kind: 'literal', value: 'limit' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'limit' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'countfield' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'field', effect: 'creates', name: 'countfield' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'percentfield' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'field', effect: 'creates', name: 'percentfield' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'showcount' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'showcount' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'showperc' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'showperc' },
              ],
            },
            { kind: 'literal', value: 'useother' },
            { kind: 'literal', value: 'usenull' },
          ],
        },
      },
      { kind: 'param', type: 'field-list', effect: 'groups-by', name: 'fields' },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'by' },
            { kind: 'param', type: 'field-list', effect: 'groups-by', name: 'byFields' },
          ],
        },
      },
    ],
  },
  semantics: { dropsAllExcept: ['byFields', 'creates'] },
  related: ['top', 'stats'],
  tags: ['rare', 'bottom', 'least-common'],
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
// RELTIME COMMAND
// =============================================================================

/**
 * reltime command
 *
 * Description: Converts _time to relative time.
 */
export const reltimeCommand: CommandSyntax = {
  command: 'reltime',
  category: 'fields::add',
  description: 'Converts _time to relative time',
  syntax: { kind: 'literal', value: 'reltime' },
  semantics: { preservesAll: true },
  related: ['convert'],
  tags: ['time', 'relative'],
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
// REST COMMAND
// =============================================================================

/**
 * rest command
 *
 * Description: Accesses Splunk REST API endpoints.
 */
export const restCommand: CommandSyntax = {
  command: 'rest',
  category: 'generating',
  description: 'Accesses Splunk REST API endpoints',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'string', name: 'endpoint' },
      {
        kind: 'group',
        quantifier: '*',
        pattern: {
          kind: 'alternation',
          options: [
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'splunk_server' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'splunk_server' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'splunk_server_group' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'splunk_server_group' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'timeout' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'timeout' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'count' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'count' },
              ],
            },
          ],
        },
      },
    ],
  },
  related: ['metadata'],
  tags: ['rest', 'api', 'endpoint'],
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
  syntax: { kind: 'literal', value: 'reverse' },
  semantics: { preservesAll: true },
  related: ['sort'],
  tags: ['reverse', 'order'],
};

// =============================================================================
// RTORDER COMMAND
// =============================================================================

/**
 * rtorder command
 *
 * Description: Buffers events for real-time ordering.
 */
export const rtorderCommand: CommandSyntax = {
  command: 'rtorder',
  category: 'results',
  description: 'Buffers events for real-time ordering',
  syntax: {
    kind: 'group',
    quantifier: '*',
    pattern: {
      kind: 'alternation',
      options: [
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'discard' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'discard' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'buffer_span' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'buffer_span' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'max_buffer_size' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'max_buffer_size' },
          ],
        },
      ],
    },
  },
  semantics: { preservesAll: true },
  related: ['sort'],
  tags: ['realtime', 'order', 'buffer'],
};

// =============================================================================
// SAVEDSEARCH COMMAND
// =============================================================================

/**
 * savedsearch command
 *
 * Description: Runs a saved search.
 */
export const savedsearchCommand: CommandSyntax = {
  command: 'savedsearch',
  category: 'misc',
  description: 'Runs a saved search',
  syntax: {
    kind: 'param',
    type: 'string',
    name: 'searchName',
  },
  related: ['loadjob'],
  tags: ['saved', 'search', 'report'],
};

// =============================================================================
// SCRIPT COMMAND
// =============================================================================

/**
 * script command
 *
 * Description: Runs an external script.
 */
export const scriptCommand: CommandSyntax = {
  command: 'script',
  category: 'misc',
  description: 'Runs an external script',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'string', name: 'scriptName' },
      {
        kind: 'group',
        quantifier: '?',
        pattern: { kind: 'param', type: 'string', name: 'args' },
      },
    ],
  },
  related: ['run'],
  tags: ['script', 'external', 'command'],
};

// =============================================================================
// SCRUB COMMAND
// =============================================================================

/**
 * scrub command
 *
 * Description: Anonymizes data in search results.
 */
export const scrubCommand: CommandSyntax = {
  command: 'scrub',
  category: 'misc',
  description: 'Anonymizes data in search results',
  syntax: {
    kind: 'group',
    quantifier: '*',
    pattern: {
      kind: 'alternation',
      options: [
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'public-terms' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'publicTerms' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'private-terms' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'privateTerms' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'name-terms' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'nameTerms' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'dictionary' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'dictionary' },
          ],
        },
      ],
    },
  },
  related: ['anonymize'],
  tags: ['scrub', 'anonymize', 'privacy'],
};

// =============================================================================
// SEARCHTXN COMMAND
// =============================================================================

/**
 * searchtxn command
 *
 * Description: Finds transactions based on events.
 */
export const searchtxnCommand: CommandSyntax = {
  command: 'searchtxn',
  category: 'results',
  description: 'Finds transactions based on events',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'string', name: 'transactionName' },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'max_terms' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'max_terms' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'use_disjunct' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'use_disjunct' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'eventsonly' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'eventsonly' },
          ],
        },
      },
    ],
  },
  related: ['transaction'],
  tags: ['transaction', 'search'],
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
// SENDEMAIL COMMAND
// =============================================================================

/**
 * sendemail command
 *
 * Description: Sends email with search results.
 */
export const sendemailCommand: CommandSyntax = {
  command: 'sendemail',
  category: 'output',
  description: 'Sends email with search results',
  syntax: {
    kind: 'group',
    quantifier: '*',
    pattern: {
      kind: 'alternation',
      options: [
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'to' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'to' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'cc' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'cc' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'bcc' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'bcc' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'from' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'from' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'subject' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'subject' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'message' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'message' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'sendresults' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'sendresults' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'inline' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'inline' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'sendpdf' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'sendpdf' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'sendcsv' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'sendcsv' },
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
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'server' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'server' },
          ],
        },
      ],
    },
  },
  related: ['outputlookup'],
  tags: ['email', 'send', 'alert'],
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
// SETFIELDS COMMAND
// =============================================================================

/**
 * setfields command
 *
 * Description: Sets field values explicitly.
 */
export const setfieldsCommand: CommandSyntax = {
  command: 'setfields',
  category: 'fields::add',
  description: 'Sets field values explicitly',
  syntax: {
    kind: 'group',
    quantifier: '+',
    pattern: {
      kind: 'sequence',
      patterns: [
        { kind: 'param', type: 'field', effect: 'creates', name: 'field' },
        { kind: 'literal', value: '=' },
        { kind: 'param', type: 'string', name: 'value' },
      ],
    },
  },
  semantics: { preservesAll: true },
  related: ['eval'],
  tags: ['setfields', 'assign'],
};

// =============================================================================
// SICHART COMMAND
// =============================================================================

/**
 * sichart command
 *
 * Description: Summary indexing version of chart.
 */
export const sichartCommand: CommandSyntax = {
  command: 'sichart',
  category: 'reporting',
  description: 'Summary indexing version of chart',
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
                { kind: 'literal', value: 'sep' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'sep' },
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
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'cont' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'cont' },
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
            { kind: 'param', type: 'field', effect: 'consumes', quantifier: '?' },
            { kind: 'literal', value: ')' },
            {
              kind: 'group',
              quantifier: '?',
              pattern: {
                kind: 'sequence',
                patterns: [
                  { kind: 'literal', value: 'as' },
                  { kind: 'param', type: 'field', effect: 'creates', name: 'alias' },
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
            { kind: 'literal', value: 'over' },
            { kind: 'param', type: 'field', effect: 'groups-by', name: 'overField' },
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
            { kind: 'param', type: 'field-list', effect: 'groups-by', name: 'byFields' },
          ],
        },
      },
    ],
  },
  semantics: { dropsAllExcept: ['byFields', 'creates'] },
  related: ['chart', 'collect'],
  tags: ['sichart', 'summary-index', 'chart'],
};

// =============================================================================
// SIRARE COMMAND
// =============================================================================

/**
 * sirare command
 *
 * Description: Summary indexing version of rare.
 */
export const sirareCommand: CommandSyntax = {
  command: 'sirare',
  category: 'reporting',
  description: 'Summary indexing version of rare',
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
                { kind: 'literal', value: 'limit' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'limit' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'showcount' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'showcount' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'showperc' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'showperc' },
              ],
            },
            { kind: 'literal', value: 'useother' },
            { kind: 'literal', value: 'usenull' },
          ],
        },
      },
      { kind: 'param', type: 'field-list', effect: 'groups-by', name: 'fields' },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'by' },
            { kind: 'param', type: 'field-list', effect: 'groups-by', name: 'byFields' },
          ],
        },
      },
    ],
  },
  semantics: { dropsAllExcept: ['byFields', 'creates'] },
  related: ['rare', 'collect'],
  tags: ['sirare', 'summary-index', 'rare'],
};

// =============================================================================
// SISTATS COMMAND
// =============================================================================

/**
 * sistats command
 *
 * Description: Summary indexing version of stats.
 */
export const sistatsCommand: CommandSyntax = {
  command: 'sistats',
  category: 'reporting',
  description: 'Summary indexing version of stats',
  syntax: {
    kind: 'sequence',
    patterns: [
      {
        kind: 'group',
        quantifier: '+',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'param', type: 'stats-func', name: 'function' },
            { kind: 'literal', value: '(' },
            { kind: 'param', type: 'field', effect: 'consumes', quantifier: '?' },
            { kind: 'literal', value: ')' },
            {
              kind: 'group',
              quantifier: '?',
              pattern: {
                kind: 'sequence',
                patterns: [
                  { kind: 'literal', value: 'as' },
                  { kind: 'param', type: 'field', effect: 'creates', name: 'alias' },
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
            { kind: 'literal', value: 'by' },
            { kind: 'param', type: 'field-list', effect: 'groups-by', name: 'byFields' },
          ],
        },
      },
    ],
  },
  semantics: { dropsAllExcept: ['byFields', 'creates'] },
  related: ['stats', 'collect'],
  tags: ['sistats', 'summary-index', 'stats'],
};

// =============================================================================
// SITIMECHART COMMAND
// =============================================================================

/**
 * sitimechart command
 *
 * Description: Summary indexing version of timechart.
 */
export const sitimechartCommand: CommandSyntax = {
  command: 'sitimechart',
  category: 'reporting',
  description: 'Summary indexing version of timechart',
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
                { kind: 'literal', value: 'limit' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'limit' },
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
            { kind: 'param', type: 'field', effect: 'consumes', quantifier: '?' },
            { kind: 'literal', value: ')' },
            {
              kind: 'group',
              quantifier: '?',
              pattern: {
                kind: 'sequence',
                patterns: [
                  { kind: 'literal', value: 'as' },
                  { kind: 'param', type: 'field', effect: 'creates', name: 'alias' },
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
            { kind: 'literal', value: 'by' },
            { kind: 'param', type: 'field-list', effect: 'groups-by', name: 'byFields' },
          ],
        },
      },
    ],
  },
  semantics: { dropsAllExcept: ['byFields', 'creates'] },
  related: ['timechart', 'collect'],
  tags: ['sitimechart', 'summary-index', 'timechart'],
};

// =============================================================================
// SITOP COMMAND
// =============================================================================

/**
 * sitop command
 *
 * Description: Summary indexing version of top.
 */
export const sitopCommand: CommandSyntax = {
  command: 'sitop',
  category: 'reporting',
  description: 'Summary indexing version of top',
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
                { kind: 'literal', value: 'limit' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'limit' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'showcount' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'showcount' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'showperc' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'showperc' },
              ],
            },
            { kind: 'literal', value: 'useother' },
            { kind: 'literal', value: 'usenull' },
          ],
        },
      },
      { kind: 'param', type: 'field-list', effect: 'groups-by', name: 'fields' },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'by' },
            { kind: 'param', type: 'field-list', effect: 'groups-by', name: 'byFields' },
          ],
        },
      },
    ],
  },
  semantics: { dropsAllExcept: ['byFields', 'creates'] },
  related: ['top', 'collect'],
  tags: ['sitop', 'summary-index', 'top'],
};

// =============================================================================
// TAGS COMMAND
// =============================================================================

/**
 * tags command
 *
 * Description: Annotates specified fields with tags.
 */
export const tagsCommand: CommandSyntax = {
  command: 'tags',
  category: 'fields::add',
  description: 'Annotates specified fields with tags',
  syntax: {
    kind: 'sequence',
    patterns: [
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'outputfield' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'field', effect: 'creates', name: 'outputfield' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'inclname' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'inclname' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'inclvalue' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'inclvalue' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: { kind: 'param', type: 'field-list', effect: 'consumes', name: 'fields' },
      },
    ],
  },
  semantics: { preservesAll: true },
  related: ['eval'],
  tags: ['tags', 'annotate'],
};

// =============================================================================
// TOP COMMAND
// =============================================================================

/**
 * top command
 *
 * Description: Finds most common values of fields.
 */
export const topCommand: CommandSyntax = {
  command: 'top',
  category: 'reporting',
  description: 'Finds most common values of fields',
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
                { kind: 'literal', value: 'limit' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'limit' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'countfield' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'field', effect: 'creates', name: 'countfield' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'percentfield' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'field', effect: 'creates', name: 'percentfield' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'showcount' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'showcount' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'showperc' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'showperc' },
              ],
            },
            { kind: 'literal', value: 'useother' },
            { kind: 'literal', value: 'usenull' },
          ],
        },
      },
      { kind: 'param', type: 'field-list', effect: 'groups-by', name: 'fields' },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'by' },
            { kind: 'param', type: 'field-list', effect: 'groups-by', name: 'byFields' },
          ],
        },
      },
    ],
  },
  semantics: { dropsAllExcept: ['byFields', 'creates'] },
  related: ['rare', 'stats'],
  tags: ['top', 'most-common'],
};

// =============================================================================
// TRENDLINE COMMAND
// =============================================================================

/**
 * trendline command
 *
 * Description: Computes moving averages of fields.
 */
export const trendlineCommand: CommandSyntax = {
  command: 'trendline',
  category: 'reporting',
  description: 'Computes moving averages of fields',
  syntax: {
    kind: 'group',
    quantifier: '+',
    pattern: {
      kind: 'sequence',
      patterns: [
        {
          kind: 'alternation',
          options: [
            { kind: 'literal', value: 'sma' },
            { kind: 'literal', value: 'ema' },
            { kind: 'literal', value: 'wma' },
          ],
        },
        { kind: 'param', type: 'int', name: 'period' },
        { kind: 'literal', value: '(' },
        { kind: 'param', type: 'field', effect: 'consumes', name: 'field' },
        { kind: 'literal', value: ')' },
        {
          kind: 'group',
          quantifier: '?',
          pattern: {
            kind: 'sequence',
            patterns: [
              { kind: 'literal', value: 'as' },
              { kind: 'param', type: 'field', effect: 'creates', name: 'alias' },
            ],
          },
        },
      ],
    },
  },
  semantics: { preservesAll: true },
  related: ['predict', 'timechart'],
  tags: ['trendline', 'moving-average', 'sma', 'ema'],
};

// =============================================================================
// TYPEAHEAD COMMAND
// =============================================================================

/**
 * typeahead command
 *
 * Description: Returns typeahead information for a prefix.
 */
export const typeaheadCommand: CommandSyntax = {
  command: 'typeahead',
  category: 'generating',
  description: 'Returns typeahead information for a prefix',
  syntax: {
    kind: 'sequence',
    patterns: [
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'prefix' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'prefix' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'count' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'count' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'max_time' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'max_time' },
          ],
        },
      },
    ],
  },
  related: ['search'],
  tags: ['typeahead', 'autocomplete'],
};

// =============================================================================
// UNIQ COMMAND
// =============================================================================

/**
 * uniq command
 *
 * Description: Removes duplicate events.
 */
export const uniqCommand: CommandSyntax = {
  command: 'uniq',
  category: 'results',
  description: 'Removes duplicate events',
  syntax: { kind: 'literal', value: 'uniq' },
  semantics: { preservesAll: true },
  related: ['dedup'],
  tags: ['uniq', 'unique', 'duplicate'],
};

// =============================================================================
// UNTABLE COMMAND
// =============================================================================

/**
 * untable command
 *
 * Description: Converts table-formatted results to a key-value format.
 */
export const untableCommand: CommandSyntax = {
  command: 'untable',
  category: 'results',
  description: 'Converts table-formatted results to key-value format',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'field', effect: 'consumes', name: 'rowLabel' },
      { kind: 'param', type: 'field', effect: 'creates', name: 'columnLabel' },
      { kind: 'param', type: 'field', effect: 'creates', name: 'valueField' },
    ],
  },
  related: ['xyseries'],
  tags: ['untable', 'unpivot', 'reshape'],
};

// =============================================================================
// WHERE COMMAND (UPDATED)
// =============================================================================

// Note: where command already exists in registry

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
  related: ['untable'],
  tags: ['xyseries', 'pivot', 'table'],
};

// =============================================================================
// PATTERN REGISTRY
// =============================================================================

/**
 * Registry of all command syntax patterns
 *
 * Maps command names to their syntax definitions.
 * This serves as the single source of truth for command syntax.
 */
export const COMMAND_PATTERNS: PatternRegistry = {
  // Core field creators/modifiers
  bin: binCommand,
  rename: renameCommand,
  fillnull: fillnullCommand,
  dedup: dedupCommand,
  sort: sortCommand,
  eval: evalCommand,
  spath: spathCommand,
  mvexpand: mvexpandCommand,
  addtotals: addtotalsCommand,
  outputlookup: outputlookupCommand,

  // New commands
  rex: rexCommand,
  lookup: lookupCommand,
  inputlookup: inputlookupCommand,
  table: tableCommand,
  fields: fieldsCommand,
  head: headCommand,
  tail: tailCommand,
  where: whereCommand,
  search: searchCommand,
  extract: extractCommand,
  kv: kvCommand,
  makemv: makemvCommand,
  mvcombine: mvcombineCommand,
  filldown: filldownCommand,
  accum: accumCommand,
  autoregress: autoregressCommand,
  delta: deltaCommand,
  rangemap: rangemapCommand,
  strcat: strcatCommand,
  join: joinCommand,
  append: appendCommand,
  union: unionCommand,
  transaction: transactionCommand,
  tstats: tstatsCommand,
  foreach: foreachCommand,
  return: returnCommand,

  // Batch 2: Geographic, metrics, and misc commands
  gauge: gaugeCommand,
  gentimes: gentimesCommand,
  geom: geomCommand,
  geomfilter: geomfilterCommand,
  geostats: geostatsCommand,
  highlight: highlightCommand,
  history: historyCommand,
  iconify: iconifyCommand,
  inputcsv: inputcsvCommand,
  iplocation: iplocationCommand,
  kmeans: kmeansCommand,
  kvform: kvformCommand,
  loadjob: loadjobCommand,
  localize: localizeCommand,
  localop: localopCommand,
  makecontinuous: makecontinuousCommand,
  makeresults: makeresultsCommand,
  map: mapCommand,
  mcollect: mcollectCommand,
  metadata: metadataCommand,
  metasearch: metasearchCommand,
  meventcollect: meventcollectCommand,
  mpreview: mpreviewCommand,
  mstats: mstatsCommand,
  multikv: multikvCommand,
  multisearch: multisearchCommand,
  nomv: nomvCommand,
  outlier: outlierCommand,
  outputcsv: outputcsvCommand,

  // Batch 3: Analysis, reporting, and misc commands
  pivot: pivotCommand,
  predict: predictCommand,
  rare: rareCommand,
  regex: regexCommand,
  reltime: reltimeCommand,
  replace: replaceCommand,
  rest: restCommand,
  reverse: reverseCommand,
  rtorder: rtorderCommand,
  savedsearch: savedsearchCommand,
  script: scriptCommand,
  scrub: scrubCommand,
  searchtxn: searchtxnCommand,
  selfjoin: selfjoinCommand,
  sendemail: sendemailCommand,
  set: setCommand,
  setfields: setfieldsCommand,
  sichart: sichartCommand,
  sirare: sirareCommand,
  sistats: sistatsCommand,
  sitimechart: sitimechartCommand,
  sitop: sitopCommand,
  tags: tagsCommand,
  top: topCommand,
  trendline: trendlineCommand,
  typeahead: typeaheadCommand,
  uniq: uniqCommand,
  untable: untableCommand,
  xmlkv: xmlkvCommand,
  xyseries: xyseriesCommand,

  // Bucket is an alias for bin
  bucket: binCommand,

  // Stats family - all variants share the same pattern
  // Variant-specific semantics are applied at runtime based on AST node's variant field
  stats: statsCommand,
  eventstats: statsCommand,
  streamstats: statsCommand,
  chart: statsCommand,
  timechart: statsCommand,
};

/**
 * Get pattern for a command
 *
 * @param commandName - Name of the command (e.g., 'bin', 'rename')
 * @returns CommandSyntax if found, undefined otherwise
 */
export function getCommandPattern(commandName: string): CommandSyntax | undefined {
  return COMMAND_PATTERNS[commandName.toLowerCase()];
}

/**
 * Check if a command has a pattern defined
 *
 * @param commandName - Name of the command
 * @returns true if pattern exists, false otherwise
 */
export function hasPattern(commandName: string): boolean {
  return commandName.toLowerCase() in COMMAND_PATTERNS;
}

/**
 * Get all registered command names
 *
 * @returns Array of command names
 */
export function getAllCommandNames(): string[] {
  return Object.keys(COMMAND_PATTERNS);
}
