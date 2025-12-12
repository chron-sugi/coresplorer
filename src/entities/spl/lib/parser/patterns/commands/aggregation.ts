/**
 * Aggregation Command Patterns
 *
 * Statistical aggregation and charting commands.
 * Includes: stats, eventstats, streamstats, chart, timechart, top, rare,
 * sitop, sirare, sistats, sichart, sitimechart, contingency, timewrap
 *
 * @module entities/spl/lib/parser/patterns/commands/aggregation
 */

import type { CommandSyntax } from '../types';

// =============================================================================
// STATS COMMAND (shared by stats, chart, timechart, eventstats, streamstats)
// =============================================================================

/**
 * stats command
 *
 * Description: Calculates aggregate statistics over result sets.
 * This pattern is shared by stats, eventstats, streamstats, chart, timechart.
 */
export const statsCommand: CommandSyntax = {
  command: 'stats',
  category: 'reporting',
  description: 'Calculates aggregate statistics over result sets',
  grammarSupport: 'dedicated',
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
// AGGREGATE EXPORTS
// =============================================================================

/**
 * All aggregation command patterns
 */
export const aggregationCommands = {
  stats: statsCommand,
  eventstats: statsCommand,
  streamstats: statsCommand,
  chart: statsCommand,
  timechart: statsCommand,
  top: topCommand,
  rare: rareCommand,
} as const;
