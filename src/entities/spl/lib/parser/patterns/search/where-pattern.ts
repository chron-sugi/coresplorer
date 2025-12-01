/**
 * where Command Pattern
 */

import type { CommandSyntax } from '../types';

export const whereCommand: CommandSyntax = {
  "command": "where",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "where"
      },
      {
        "kind": "param",
        "type": "evaled-field"
      }
    ]
  }
};
