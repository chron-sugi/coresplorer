/**
 * Generator Command Patterns
 *
 * Commands that generate synthetic data.
 * Includes: makeresults, gentimes, inputcsv, metadata
 *
 * @module entities/spl/lib/parser/patterns/commands/generators
 */

import type { CommandSyntax } from '../types';

// =============================================================================
// MAKERESULTS COMMAND
// =============================================================================

/**
 * makeresults command
 *
 * Description: Generates result rows from nothing.
 */
export const makeresultsCommand: CommandSyntax = {
  command: 'makeresults',
  category: 'generating',
  description: 'Generates result rows from nothing',
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
            { kind: 'literal', value: 'count' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'count' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'annotate' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'annotate' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'splunk_server' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'splunk_server' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'splunk_server_group' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'splunk_server_group' },
          ],
        },
      ],
    },
  },
  related: ['gentimes'],
  tags: ['generate', 'results', 'create'],
};

// =============================================================================
// GENTIMES COMMAND
// =============================================================================

/**
 * gentimes command
 *
 * Description: Generates time range results.
 */
export const gentimesCommand: CommandSyntax = {
  command: 'gentimes',
  category: 'generating',
  description: 'Generates time range results',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'literal', value: 'start' },
      { kind: 'literal', value: '=' },
      { kind: 'param', type: 'string', name: 'start' },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'end' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'end' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'increment' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'increment' },
          ],
        },
      },
    ],
  },
  related: ['makeresults'],
  tags: ['generate', 'time', 'range'],
};

// =============================================================================
// INPUTCSV COMMAND
// =============================================================================

/**
 * inputcsv command
 *
 * Description: Loads search results from a CSV file.
 */
export const inputcsvCommand: CommandSyntax = {
  command: 'inputcsv',
  category: 'input',
  description: 'Loads search results from a CSV file',
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
                { kind: 'literal', value: 'start' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'start' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'max' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'max' },
              ],
            },
          ],
        },
      },
      { kind: 'param', type: 'string', name: 'filename' },
    ],
  },
  related: ['outputcsv', 'inputlookup'],
  tags: ['input', 'csv', 'load'],
};

// =============================================================================
// METADATA COMMAND
// =============================================================================

/**
 * metadata command
 *
 * Description: Returns metadata information about sources, sourcetypes, or hosts.
 */
export const metadataCommand: CommandSyntax = {
  command: 'metadata',
  category: 'generating',
  description: 'Returns metadata information about sources, sourcetypes, or hosts',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'literal', value: 'type' },
      { kind: 'literal', value: '=' },
      {
        kind: 'alternation',
        options: [
          { kind: 'literal', value: 'hosts' },
          { kind: 'literal', value: 'sources' },
          { kind: 'literal', value: 'sourcetypes' },
        ],
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'index' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'index' },
          ],
        },
      },
    ],
  },
  related: ['tstats'],
  tags: ['metadata', 'hosts', 'sources', 'sourcetypes'],
};

// =============================================================================
// AGGREGATE EXPORTS
// =============================================================================

/**
 * All generator command patterns
 */
export const generatorCommands = {
  makeresults: makeresultsCommand,
  gentimes: gentimesCommand,
  inputcsv: inputcsvCommand,
  metadata: metadataCommand,
} as const;
