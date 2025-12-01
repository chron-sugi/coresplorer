/**
 * rex Command Pattern (Manual)
 */

import type { CommandSyntax } from '../types';

export const rexCommand: CommandSyntax = {
  command: 'rex',
  syntax: {
    kind: 'sequence',
    patterns: [
      // Optional: field to extract from (default is _raw)
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'field' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'field', name: 'field' },
          ],
        },
      },

      // Optional: mode (sed mode)
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'mode' },
            { kind: 'literal', value: '=' },
            { kind: 'literal', value: 'sed' },
          ],
        },
      },

      // Regex pattern (required)
      // This can be either a bare regex or specified with pattern= or sed expression
      {
        kind: 'alternation',
        options: [
          // Named regex: pattern=<regex>
          {
            kind: 'sequence',
            patterns: [
              { kind: 'literal', value: 'pattern' },
              { kind: 'literal', value: '=' },
              { kind: 'param', type: 'string', name: 'pattern' },
            ],
          },
          // Sed expression: sed "s/pattern/replacement/flags"
          {
            kind: 'param',
            type: 'string',
            name: 'sed_expression',
          },
          // Bare regex pattern (most common)
          {
            kind: 'param',
            type: 'string',
            name: 'regex',
          },
        ],
      },

      // Optional: max_match parameter
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'max_match' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'max_match' },
          ],
        },
      },

      // Optional: offset_field parameter
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'offset_field' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'field', name: 'offset_field' },
          ],
        },
      },
    ],
  },
};
