/**
 * makemv Command Pattern
 */

import type { CommandSyntax } from '../types';

export const makemvCommand: CommandSyntax = {
  "command": "makemv",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "makemv"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "alternation",
          "options": [
            {
              "kind": "param",
              "type": "string",
              "name": "delim"
            },
            {
              "kind": "param",
              "type": "string",
              "name": "tokenizer"
            }
          ]
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "allowempty"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "setsv"
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
