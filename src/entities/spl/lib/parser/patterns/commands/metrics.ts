/**
 * Metrics Command Patterns
 *
 * Commands for metrics data operations.
 * Includes: mstats, mcatalog, mpreview, mcollect, meventcollect, geostats
 *
 * @module entities/spl/lib/parser/patterns/commands/metrics
 */

import type { CommandSyntax } from '../types';

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
// MCATALOG COMMAND
// =============================================================================

/**
 * mcatalog command
 *
 * Description: Returns metrics catalog information.
 */
export const mcatalogCommand: CommandSyntax = {
  command: 'mcatalog',
  category: 'metrics',
  description: 'Returns metrics catalog information',
  grammarSupport: 'dedicated',
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
            { kind: 'param', type: 'field', effect: 'consumes', name: 'field', quantifier: '?' },
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
    ],
  },
  semantics: { dropsAllExcept: ['byFields', 'creates'] },
  related: ['mstats', 'mpreview'],
  tags: ['metrics', 'catalog'],
};

// =============================================================================
// MPREVIEW COMMAND
// =============================================================================

/**
 * mpreview command
 *
 * Description: Previews metrics data before indexing.
 */
export const mpreviewCommand: CommandSyntax = {
  command: 'mpreview',
  category: 'metrics',
  description: 'Previews metrics data before indexing',
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
            { kind: 'literal', value: 'index' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'index' },
          ],
        },
      },
    ],
  },
  semantics: { dropsAllExcept: ['creates'] },
  related: ['mcollect', 'mstats'],
  tags: ['metrics', 'preview'],
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
          ],
        },
      },
    ],
  },
  related: ['mstats', 'meventcollect'],
  tags: ['metrics', 'collect', 'output'],
};

// =============================================================================
// MEVENTCOLLECT COMMAND
// =============================================================================

/**
 * meventcollect command
 *
 * Description: Collects events to metrics.
 */
export const meventcollectCommand: CommandSyntax = {
  command: 'meventcollect',
  category: 'output',
  description: 'Collects events to metrics',
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
                { kind: 'literal', value: 'index' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'index' },
              ],
            },
          ],
        },
      },
    ],
  },
  related: ['mcollect'],
  tags: ['metrics', 'events', 'collect'],
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
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'maxzoomlevel' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'maxzoomlevel' },
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
  related: ['stats', 'geom'],
  tags: ['geographic', 'statistics', 'map'],
};

// =============================================================================
// AGGREGATE EXPORTS
// =============================================================================

/**
 * All metrics command patterns
 */
export const metricsCommands = {
  mstats: mstatsCommand,
  mcatalog: mcatalogCommand,
  mpreview: mpreviewCommand,
  mcollect: mcollectCommand,
  meventcollect: meventcollectCommand,
  geostats: geostatsCommand,
} as const;
