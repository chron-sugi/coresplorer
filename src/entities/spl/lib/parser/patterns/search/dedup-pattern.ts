/**
 * dedup Command Pattern
 */

import type { CommandSyntax } from '../types';

export const dedupCommand: CommandSyntax = {
  "command": "dedup",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "dedup"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int"
        },
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field-list"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "sequence",
          "patterns": [
            {
              "kind": "literal",
              "value": "sortby"
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
