/**
 * tail Command Pattern
 */

import type { CommandSyntax } from '../types';

export const tailCommand: CommandSyntax = {
  "command": "tail",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "tail"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int"
        },
        "quantifier": "?"
      }
    ]
  }
};
