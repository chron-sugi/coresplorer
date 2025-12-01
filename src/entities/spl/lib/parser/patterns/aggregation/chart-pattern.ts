/**
 * chart Command Pattern
 */

import type { CommandSyntax } from '../types';

export const chartCommand: CommandSyntax = {
  "command": "chart",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "chart"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "consumes"
      }
    ]
  }
};
