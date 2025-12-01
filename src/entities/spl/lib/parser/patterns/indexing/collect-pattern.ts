/**
 * collect Command Pattern
 */

import type { CommandSyntax } from '../types';

export const collectCommand: CommandSyntax = {
  "command": "collect",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "collect"
      },
      {
        "kind": "param",
        "type": "field"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "*"
      }
    ]
  }
};
