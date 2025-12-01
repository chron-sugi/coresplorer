/**
 * head Command Pattern
 */

import type { CommandSyntax } from '../types';

export const headCommand: CommandSyntax = {
  "command": "head",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "head"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "alternation",
          "options": [
            {
              "kind": "param",
              "type": "int"
            },
            {
              "kind": "sequence",
              "patterns": [
                {
                  "kind": "literal",
                  "value": "("
                },
                {
                  "kind": "param",
                  "type": "evaled-field"
                },
                {
                  "kind": "literal",
                  "value": ")"
                }
              ]
            }
          ]
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int",
          "name": "limit"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "null"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "keeplast"
        },
        "quantifier": "?"
      }
    ]
  }
};
