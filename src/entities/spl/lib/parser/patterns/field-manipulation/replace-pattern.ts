/**
 * replace Command Pattern
 */

import type { CommandSyntax } from '../types';

export const replaceCommand: CommandSyntax = {
  "command": "replace",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "replace"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "sequence",
          "patterns": [
            {
              "kind": "param",
              "type": "field",
              "effect": "modifies"
            },
            {
              "kind": "literal",
              "value": "with"
            },
            {
              "kind": "param",
              "type": "field",
              "effect": "modifies"
            }
          ]
        },
        "quantifier": "+"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "sequence",
          "patterns": [
            {
              "kind": "literal",
              "value": "in"
            },
            {
              "kind": "param",
              "type": "field-list",
              "effect": "modifies"
            }
          ]
        },
        "quantifier": "?"
      }
    ]
  }
};
