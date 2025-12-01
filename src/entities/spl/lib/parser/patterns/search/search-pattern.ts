/**
 * search Command Pattern
 */

import type { CommandSyntax } from '../types';

export const searchCommand: CommandSyntax = {
  "command": "search",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "search"
      },
      {
        "kind": "param",
        "type": "evaled-field",
        "quantifier": "?"
      }
    ]
  }
};
