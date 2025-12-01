/**
 * join Command Pattern
 */

import type { CommandSyntax } from '../types';

export const joinCommand: CommandSyntax = {
  "command": "join",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "join"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "*"
      },
      {
        "kind": "param",
        "type": "field"
      },
      {
        "kind": "param",
        "type": "field"
      }
    ]
  }
};
