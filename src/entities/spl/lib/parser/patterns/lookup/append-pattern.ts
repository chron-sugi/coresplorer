/**
 * append Command Pattern
 */

import type { CommandSyntax } from '../types';

export const appendCommand: CommandSyntax = {
  "command": "append",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "append"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field"
      }
    ]
  }
};
