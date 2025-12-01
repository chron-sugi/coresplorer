/**
 * return Command Pattern
 *
 * Description: Returns values from a subsearch to the outer search.
 * Syntax: return [<count>] [$<field> | <field> | <alias>=<field>]...
 */

import type { CommandSyntax } from '../types';

export const returnCommand: CommandSyntax = {
  command: 'return',
  category: 'subsearch',
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
