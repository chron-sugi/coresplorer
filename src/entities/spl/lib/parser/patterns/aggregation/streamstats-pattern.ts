/**
 * streamstats Command Pattern (Manual)
 */

import type { CommandSyntax } from '../types';

export const streamstatsCommand: CommandSyntax = {
  command: 'streamstats',
  syntax: {
    kind: 'sequence',
    patterns: [
      // Optional parameters (can appear in any order, multiple times)
      {
        kind: 'group',
        quantifier: '*',
        pattern: {
          kind: 'alternation',
          options: [
            // time_window parameter
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'time_window' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'time_window' },
              ],
            },

            // window parameter (number of events)
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'window' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'window' },
              ],
            },

            // current parameter
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'current' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'current' },
              ],
            },

            // global parameter
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'global' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'global' },
              ],
            },

            // allnum parameter
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'allnum' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'allnum' },
              ],
            },

            // reset_on_change parameter
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'reset_on_change' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'reset_on_change' },
              ],
            },

            // reset_before parameter (has quoted expression)
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'reset_before' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'reset_before' },
              ],
            },

            // reset_after parameter (has quoted expression)
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'reset_after' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'reset_after' },
              ],
            },
          ],
        },
      },

      // Statistical aggregations (required, one or more)
      {
        kind: 'group',
        quantifier: '+',
        pattern: {
          kind: 'param',
          type: 'stats-func',
          name: 'aggregation',
          effect: 'creates',
        },
      },

      // Optional: BY clause for grouping
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
              name: 'groupby_fields',
              effect: 'groups-by',
            },
          ],
        },
      },
    ],
  },
};
