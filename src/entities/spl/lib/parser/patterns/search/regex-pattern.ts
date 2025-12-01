/**
 * regex Command Pattern
 */

import type { CommandSyntax } from '../types';

export const regexCommand: CommandSyntax = {
  "command": "regex",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "regex"
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
              "kind": "alternation",
              "options": [
                {
                  "kind": "literal",
                  "value": "="
                },
                {
                  "kind": "literal",
                  "value": "!="
                }
              ]
            }
          ]
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
