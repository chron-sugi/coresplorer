/**
 * Output Command Patterns
 *
 * Commands that write or send results.
 * Includes: outputlookup, outputcsv, collect, sendemail
 *
 * @module entities/spl/lib/parser/patterns/commands/output
 */

import type { CommandSyntax } from '../types';

// =============================================================================
// OUTPUTLOOKUP COMMAND
// =============================================================================

/**
 * outputlookup command
 *
 * Description: Saves search results to a lookup table.
 */
export const outputlookupCommand: CommandSyntax = {
  command: 'outputlookup',
  category: 'results::write',
  description: 'Saves search results to a lookup table',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      {
        kind: 'group',
        quantifier: '*',
        pattern: {
          kind: 'alternation',
          options: [
            {
              kind: 'param',
              type: 'bool',
              name: 'append',
            },
            {
              kind: 'param',
              type: 'bool',
              name: 'create_empty',
            },
            {
              kind: 'param',
              type: 'bool',
              name: 'override_if_empty',
            },
            {
              kind: 'param',
              type: 'int',
              name: 'max',
            },
            {
              kind: 'param',
              type: 'field',
              name: 'key_field',
            },
            {
              kind: 'param',
              type: 'bool',
              name: 'createinapp',
            },
            {
              kind: 'param',
              type: 'string',
              name: 'output_format',
            },
          ],
        },
      },
      {
        kind: 'param',
        type: 'string',
        name: 'destination',
      },
    ],
  },
  related: ['inputlookup', 'lookup', 'outputcsv'],
  tags: ['output', 'csv', 'save', 'write', 'lookup', 'table'],
};

// =============================================================================
// OUTPUTCSV COMMAND
// =============================================================================

/**
 * outputcsv command
 *
 * Description: Writes search results to a CSV file.
 */
export const outputcsvCommand: CommandSyntax = {
  command: 'outputcsv',
  category: 'output',
  description: 'Writes search results to a CSV file',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      {
        kind: 'group',
        quantifier: '*',
        pattern: {
          kind: 'alternation',
          options: [
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'append' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'append' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'create_empty' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'createEmpty' },
              ],
            },
          ],
        },
      },
      { kind: 'param', type: 'string', name: 'filename' },
    ],
  },
  related: ['inputcsv', 'outputlookup'],
  tags: ['output', 'csv', 'file', 'write'],
};

// =============================================================================
// COLLECT COMMAND
// =============================================================================

/**
 * collect command
 *
 * Description: Writes search results to an index.
 */
export const collectCommand: CommandSyntax = {
  command: 'collect',
  category: 'output',
  description: 'Writes search results to an index',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      {
        kind: 'group',
        quantifier: '*',
        pattern: {
          kind: 'alternation',
          options: [
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'index' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'index' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'host' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'host' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'source' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'source' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'sourcetype' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'sourcetype' },
              ],
            },
          ],
        },
      },
    ],
  },
  related: ['mcollect'],
  tags: ['collect', 'index', 'write'],
};

// =============================================================================
// SENDEMAIL COMMAND
// =============================================================================

/**
 * sendemail command
 *
 * Description: Sends email with search results.
 */
export const sendemailCommand: CommandSyntax = {
  command: 'sendemail',
  category: 'output',
  description: 'Sends email with search results',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'group',
    quantifier: '*',
    pattern: {
      kind: 'alternation',
      options: [
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'to' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'to' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'from' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'from' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'subject' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'subject' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'message' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'message' },
          ],
        },
      ],
    },
  },
  related: ['outputcsv'],
  tags: ['email', 'send', 'alert'],
};

// =============================================================================
// AGGREGATE EXPORTS
// =============================================================================

/**
 * All output command patterns
 */
export const outputCommands = {
  outputlookup: outputlookupCommand,
  outputcsv: outputcsvCommand,
  collect: collectCommand,
  sendemail: sendemailCommand,
} as const;
