/**
 * stats Command Pattern
 */

import type { CommandSyntax } from '../types';

export const statsCommand: CommandSyntax = {
  "command": "stats",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "stats"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "consumes"
      }
    ]
  }
};
