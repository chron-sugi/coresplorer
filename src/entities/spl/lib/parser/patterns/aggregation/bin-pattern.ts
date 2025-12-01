/**
 * bin Command Pattern
 */

import type { CommandSyntax } from '../types';

export const binCommand: CommandSyntax = {
  "command": "bin",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "bin"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "effect": "consumes"
        },
        "quantifier": "*"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "consumes"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "sequence",
          "patterns": [
            {
              "kind": "literal",
              "value": "as"
            },
            {
              "kind": "param",
              "type": "field",
              "effect": "consumes"
            }
          ]
        },
        "quantifier": "?"
      }
    ]
  }
};
