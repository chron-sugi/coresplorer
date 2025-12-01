/**
 * gentimes Command Pattern
 */

import type { CommandSyntax } from '../types';

export const gentimesCommand: CommandSyntax = {
  "command": "gentimes",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "gentimes"
      },
      {
        "kind": "param",
        "type": "field",
        "name": "start"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "end"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "increment"
        },
        "quantifier": "?"
      }
    ]
  }
};
