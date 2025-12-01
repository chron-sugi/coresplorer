/**
 * fieldformat Command Pattern
 *
 * Description: Applies display formatting to a field using an eval expression.
 * Syntax: fieldformat <field> = <eval-expression>
 */

import type { CommandSyntax } from '../types';

export const fieldformatCommand: CommandSyntax = {
  command: 'fieldformat',
  category: 'fields::modify',
  description: 'Applies display formatting to a field using an eval expression',
  syntax: {
    kind: 'sequence',
    patterns: [
      {
        kind: 'param',
        type: 'field',
        name: 'field',
        effect: 'modifies',
      },
      { kind: 'literal', value: '=' },
      {
        kind: 'param',
        type: 'evaled-field',
        name: 'expression',
      },
    ],
  },
  semantics: {
    preservesAll: true,
  },
  related: ['eval', 'convert'],
  tags: ['format', 'display', 'expression'],
};
