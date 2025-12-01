/**
 * inputlookup Command Pattern
 */

import type { CommandSyntax } from '../types';

export const inputlookupCommand: CommandSyntax = {
  "command": "inputlookup",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "inputlookup"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "append"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int",
          "name": "start"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int",
          "name": "max"
        },
        "quantifier": "?"
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
        "kind": "group",
        "pattern": {
          "kind": "sequence",
          "patterns": [
            {
              "kind": "literal",
              "value": "where"
            },
            {
              "kind": "param",
              "type": "field"
            }
          ]
        },
        "quantifier": "?"
      }
    ]
  }
};
