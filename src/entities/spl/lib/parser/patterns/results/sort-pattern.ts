/**
 * sort Command Pattern
 */

import type { CommandSyntax } from '../types';

export const sortCommand: CommandSyntax = {
  "command": "sort",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "sort"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int"
        },
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "+"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "alternation",
          "options": [
            {
              "kind": "literal",
              "value": "d"
            },
            {
              "kind": "literal",
              "value": "desc"
            }
          ]
        },
        "quantifier": "?"
      }
    ]
  }
};
