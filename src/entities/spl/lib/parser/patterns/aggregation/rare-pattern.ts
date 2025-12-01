/**
 * rare Command Pattern
 */

import type { CommandSyntax } from '../types';

export const rareCommand: CommandSyntax = {
  "command": "rare",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "rare"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "consumes"
      }
    ]
  }
};
