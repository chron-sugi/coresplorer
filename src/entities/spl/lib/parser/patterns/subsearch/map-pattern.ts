/**
 * map Command Pattern
 */

import type { CommandSyntax } from '../types';

export const mapCommand: CommandSyntax = {
  "command": "map",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "map"
      },
      {
        "kind": "alternation",
        "options": [
          {
            "kind": "param",
            "type": "field"
          },
          {
            "kind": "param",
            "type": "field"
          }
        ]
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?"
      }
    ]
  }
};
