/**
 * table Command Pattern
 */

import type { CommandSyntax } from '../types';

export const tableCommand: CommandSyntax = {
  "command": "table",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "table"
      },
      {
        "kind": "param",
        "type": "field"
      }
    ]
  }
};
