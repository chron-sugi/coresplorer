/**
 * lookup Command Pattern
 */

import type { CommandSyntax } from '../types';

export const lookupCommand: CommandSyntax = {
  "command": "lookup",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "lookup"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "local"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "update"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "event_time_field"
        },
        "quantifier": "?"
      },
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
                    "type": "field"
                  }
                ]
              },
              "quantifier": "?"
            }
          ]
        },
        "quantifier": "+"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "alternation",
          "options": [
            {
              "kind": "literal",
              "value": "OUTPUT"
            },
            {
              "kind": "sequence",
              "patterns": [
                {
                  "kind": "literal",
                  "value": "OUTPUTNEW"
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
                              "type": "field"
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
          ]
        },
        "quantifier": "?"
      }
    ]
  }
};
