/**
 * eventstats Command Pattern
 */

import type { CommandSyntax } from '../types';

export const eventstatsCommand: CommandSyntax = {
  "command": "eventstats",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "eventstats"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "allnum"
        },
        "quantifier": "?"
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
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "effect": "consumes"
        },
        "quantifier": "?"
      }
    ]
  }
};
