/**
 * top Command Pattern
 */

import type { CommandSyntax } from '../types';

export const topCommand: CommandSyntax = {
  "command": "top",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "top"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "consumes"
      }
    ]
  }
};
