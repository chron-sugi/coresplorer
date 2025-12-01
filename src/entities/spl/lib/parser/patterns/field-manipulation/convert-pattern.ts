/**
 * convert Command Pattern
 */

import type { CommandSyntax } from '../types';

export const convertCommand: CommandSyntax = {
  "command": "convert",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "convert"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "timeformat"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "sequence",
          "patterns": [
            {
              "kind": "param",
              "type": "field"
            },
            {
              "kind": "group",
              "pattern": {
                "kind": "sequence",
                "patterns": [
                  {
                    "kind": "literal",
                    "value": "as"
                  },
                  {
                    "kind": "param",
                    "type": "wc-field"
                  }
                ]
              },
              "quantifier": "?"
            }
          ]
        },
        "quantifier": "+"
      }
    ]
  }
};
