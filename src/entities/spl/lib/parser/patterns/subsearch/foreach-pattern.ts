/**
 * foreach Command Pattern
 */

import type { CommandSyntax } from '../types';

export const foreachCommand: CommandSyntax = {
  "command": "foreach",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "foreach"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "wc-field"
        },
        "quantifier": "+"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "fieldstr"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "matchstr"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "matchseg1"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "matchseg2"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "matchseg3"
        },
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field"
      }
    ]
  }
};
