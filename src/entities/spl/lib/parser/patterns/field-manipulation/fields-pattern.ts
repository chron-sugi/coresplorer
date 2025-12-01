/**
 * fields Command Pattern
 */

import type { CommandSyntax } from '../types';

export const fieldsCommand: CommandSyntax = {
  "command": "fields",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "fields"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "alternation",
          "options": [
            {
              "kind": "literal",
              "value": "+"
            },
            {
              "kind": "literal",
              "value": "-"
            }
          ]
        },
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "consumes"
      }
    ]
  }
};
