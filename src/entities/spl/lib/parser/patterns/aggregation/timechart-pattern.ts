/**
 * timechart Command Pattern
 */

import type { CommandSyntax } from '../types';

export const timechartCommand: CommandSyntax = {
  "command": "timechart",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "timechart"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "consumes"
      }
    ]
  }
};
