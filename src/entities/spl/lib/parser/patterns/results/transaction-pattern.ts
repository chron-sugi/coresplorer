/**
 * transaction Command Pattern
 */

import type { CommandSyntax } from '../types';

export const transactionCommand: CommandSyntax = {
  "command": "transaction",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "transaction"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field-list"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "name"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "*"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "*"
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
