/**
 * Miscellaneous Command Patterns
 *
 * Commands that don't fit neatly into other specific categories.
 * Includes: streaming, visualization, system, ML/analysis, and utility commands.
 *
 * @module entities/spl/lib/parser/patterns/commands/misc
 */

import type { CommandSyntax } from '../types';

// =============================================================================
// ACCUM COMMAND
// =============================================================================

/**
 * accum command
 *
 * Description: Computes a running total of a numeric field.
 */
export const accumCommand: CommandSyntax = {
  command: 'accum',
  category: '',
  description: 'Computes a running total of a numeric field',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'field', name: 'field', effect: 'consumes' },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'as' },
            { kind: 'param', type: 'field', name: 'alias', effect: 'creates', dependsOn: ['field'] },
          ],
        },
      },
    ],
  },
  semantics: {
    preservesAll: true,
  },
  related: ['autoregress', 'delta', 'streamstats'],
  tags: ['running', 'total', 'cumulative', 'sum'],
};

// =============================================================================
// AUTOREGRESS COMMAND
// =============================================================================

/**
 * autoregress command
 *
 * Description: Copies field values from previous events into current event.
 */
export const autoregressCommand: CommandSyntax = {
  command: 'autoregress',
  category: '',
  description: 'Copies field values from previous events into current event',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'field', name: 'field', effect: 'consumes' },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'as' },
            { kind: 'param', type: 'field', name: 'alias', effect: 'creates', dependsOn: ['field'] },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'p' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'lag' },
          ],
        },
      },
    ],
  },
  semantics: {
    preservesAll: true,
  },
  related: ['accum', 'delta', 'streamstats'],
  tags: ['lag', 'previous', 'time-series'],
};

// =============================================================================
// DELTA COMMAND
// =============================================================================

/**
 * delta command
 *
 * Description: Computes the difference between current and previous values.
 */
export const deltaCommand: CommandSyntax = {
  command: 'delta',
  category: '',
  description: 'Computes the difference between current and previous values',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'field', name: 'field', effect: 'consumes' },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'as' },
            { kind: 'param', type: 'field', name: 'alias', effect: 'creates', dependsOn: ['field'] },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'p' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'lag' },
          ],
        },
      },
    ],
  },
  semantics: {
    preservesAll: true,
  },
  related: ['accum', 'autoregress', 'streamstats'],
  tags: ['difference', 'change', 'time-series'],
};

// =============================================================================
// GAUGE COMMAND
// =============================================================================

/**
 * gauge command
 *
 * Description: Displays a gauge visualization.
 */
export const gaugeCommand: CommandSyntax = {
  command: 'gauge',
  category: 'reporting',
  description: 'Displays a gauge visualization',
  grammarSupport: 'generic',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'field', effect: 'consumes', name: 'field' },
      {
        kind: 'group',
        quantifier: '*',
        pattern: { kind: 'param', type: 'num', name: 'rangeValue' },
      },
    ],
  },
  related: ['chart'],
  tags: ['gauge', 'visualization'],
};

// =============================================================================
// GEOM COMMAND
// =============================================================================

/**
 * geom command
 *
 * Description: Adds geographic fields from a feature collection.
 */
export const geomCommand: CommandSyntax = {
  command: 'geom',
  category: 'fields::add',
  description: 'Adds geographic fields from a feature collection',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'string', name: 'featureCollection' },
      {
        kind: 'group',
        quantifier: '*',
        pattern: {
          kind: 'alternation',
          options: [
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'featureIdField' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'field', effect: 'consumes', name: 'featureIdField' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'gen' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'num', name: 'gen' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'min_x' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'num', name: 'min_x' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'min_y' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'num', name: 'min_y' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'max_x' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'num', name: 'max_x' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'max_y' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'num', name: 'max_y' },
              ],
            },
          ],
        },
      },
    ],
  },
  semantics: { preservesAll: true },
  related: ['geostats', 'iplocation'],
  tags: ['geographic', 'map', 'choropleth'],
};

// =============================================================================
// GEOMFILTER COMMAND
// =============================================================================

/**
 * geomfilter command
 *
 * Description: Filters geographic data by bounding box.
 */
export const geomfilterCommand: CommandSyntax = {
  command: 'geomfilter',
  category: 'results',
  description: 'Filters geographic data by bounding box',
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
            { kind: 'literal', value: 'min_x' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'num', name: 'min_x' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'min_y' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'num', name: 'min_y' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'max_x' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'num', name: 'max_x' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'max_y' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'num', name: 'max_y' },
          ],
        },
      ],
    },
  },
  related: ['geom', 'geostats'],
  tags: ['geographic', 'filter', 'bounding-box'],
};

// =============================================================================
// HIGHLIGHT COMMAND
// =============================================================================

/**
 * highlight command
 *
 * Description: Highlights search terms in results.
 */
export const highlightCommand: CommandSyntax = {
  command: 'highlight',
  category: 'misc',
  description: 'Highlights search terms in results',
  grammarSupport: 'generic',
  syntax: {
    kind: 'param',
    type: 'string',
    name: 'terms',
    quantifier: '+',
  },
  related: ['search'],
  tags: ['highlight', 'display', 'terms'],
};

// =============================================================================
// HISTORY COMMAND
// =============================================================================

/**
 * history command
 *
 * Description: Returns search history.
 */
export const historyCommand: CommandSyntax = {
  command: 'history',
  category: 'misc',
  description: 'Returns search history',
  grammarSupport: 'generic',
  syntax: {
    kind: 'group',
    quantifier: '?',
    pattern: {
      kind: 'sequence',
      patterns: [
        { kind: 'literal', value: 'events' },
        { kind: 'literal', value: '=' },
        { kind: 'param', type: 'bool', name: 'events' },
      ],
    },
  },
  related: ['audit'],
  tags: ['history', 'audit', 'search'],
};

// =============================================================================
// ICONIFY COMMAND
// =============================================================================

/**
 * iconify command
 *
 * Description: Displays field values as icons.
 */
export const iconifyCommand: CommandSyntax = {
  command: 'iconify',
  category: 'misc',
  description: 'Displays field values as icons',
  grammarSupport: 'generic',
  syntax: {
    kind: 'param',
    type: 'field-list',
    effect: 'consumes',
    name: 'fields',
  },
  related: ['eval'],
  tags: ['icon', 'display', 'visualization'],
};

// =============================================================================
// KMEANS COMMAND
// =============================================================================

/**
 * kmeans command
 *
 * Description: Performs k-means clustering on data.
 */
export const kmeansCommand: CommandSyntax = {
  command: 'kmeans',
  category: 'reporting',
  description: 'Performs k-means clustering on data',
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
                { kind: 'literal', value: 'k' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'k' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'maxiters' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'maxiters' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'reps' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'reps' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'dt' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'dt' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'cfield' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'field', effect: 'creates', name: 'cfield' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'dfield' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'field', effect: 'creates', name: 'dfield' },
              ],
            },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: { kind: 'param', type: 'field-list', effect: 'consumes', name: 'fields' },
      },
    ],
  },
  semantics: { preservesAll: true },
  related: ['cluster', 'anomalydetection'],
  tags: ['kmeans', 'clustering', 'machine-learning'],
};

// =============================================================================
// KVFORM COMMAND
// =============================================================================

/**
 * kvform command
 *
 * Description: Extracts key-value pairs using form templates.
 */
export const kvformCommand: CommandSyntax = {
  command: 'kvform',
  category: 'fields::add',
  description: 'Extracts key-value pairs using form templates',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'form' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'form' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'field' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'field', effect: 'consumes', name: 'field' },
          ],
        },
      },
    ],
  },
  semantics: { preservesAll: true },
  related: ['rex', 'extract', 'kv'],
  tags: ['extract', 'form', 'key-value'],
};

// =============================================================================
// LOADJOB COMMAND
// =============================================================================

/**
 * loadjob command
 *
 * Description: Loads results from a previously run search job.
 */
export const loadjobCommand: CommandSyntax = {
  command: 'loadjob',
  category: 'input',
  description: 'Loads results from a previously run search job',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'string', name: 'sid' },
      {
        kind: 'group',
        quantifier: '*',
        pattern: {
          kind: 'alternation',
          options: [
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'events' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'events' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'job_delegate' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'job_delegate' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'artifact_offset' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'artifact_offset' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'ignore_running' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'ignore_running' },
              ],
            },
          ],
        },
      },
    ],
  },
  related: ['savedsearch'],
  tags: ['load', 'job', 'results'],
};

// =============================================================================
// LOCALIZE COMMAND
// =============================================================================

/**
 * localize command
 *
 * Description: Returns time ranges of events.
 */
export const localizeCommand: CommandSyntax = {
  command: 'localize',
  category: 'results',
  description: 'Returns time ranges of events',
  grammarSupport: 'generic',
  syntax: {
    kind: 'group',
    quantifier: '*',
    pattern: {
      kind: 'alternation',
      options: [
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'maxpause' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'maxpause' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'timeafter' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'timeafter' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'timebefore' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'timebefore' },
          ],
        },
      ],
    },
  },
  related: ['transaction'],
  tags: ['localize', 'time', 'range'],
};

// =============================================================================
// LOCALOP COMMAND
// =============================================================================

/**
 * localop command
 *
 * Description: Runs subsequent commands on the search head only.
 */
export const localopCommand: CommandSyntax = {
  command: 'localop',
  category: 'misc',
  description: 'Runs subsequent commands on the search head only',
  grammarSupport: 'generic',
  syntax: { kind: 'literal', value: 'localop' },
  related: [],
  tags: ['local', 'search-head'],
};

// =============================================================================
// MAKECONTINUOUS COMMAND
// =============================================================================

/**
 * makecontinuous command
 *
 * Description: Makes a field continuous by filling gaps.
 */
export const makecontinuousCommand: CommandSyntax = {
  command: 'makecontinuous',
  category: 'fields::modify',
  description: 'Makes a field continuous by filling gaps',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'field', effect: 'modifies', name: 'field' },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'span' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'span' },
          ],
        },
      },
    ],
  },
  related: ['bin', 'timechart'],
  tags: ['continuous', 'fill', 'gaps'],
};

// =============================================================================
// METASEARCH COMMAND
// =============================================================================

/**
 * metasearch command
 *
 * Description: Retrieves event metadata from indexes.
 */
export const metasearchCommand: CommandSyntax = {
  command: 'metasearch',
  category: 'misc',
  description: 'Retrieves event metadata from indexes',
  grammarSupport: 'generic',
  syntax: {
    kind: 'param',
    type: 'string',
    name: 'searchExpression',
  },
  related: ['metadata'],
  tags: ['metadata', 'search'],
};

// =============================================================================
// MULTIKV COMMAND
// =============================================================================

/**
 * multikv command
 *
 * Description: Extracts field values from table-formatted events.
 */
export const multikvCommand: CommandSyntax = {
  command: 'multikv',
  category: 'fields::add',
  description: 'Extracts field values from table-formatted events',
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
                { kind: 'literal', value: 'conf' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'conf' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'copyattrs' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'copyattrs' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'filter' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'filter' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'forceheader' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'forceheader' },
              ],
            },
            { kind: 'literal', value: 'noheader' },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'rmorig' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'rmorig' },
              ],
            },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'fields' },
            { kind: 'param', type: 'field-list', effect: 'creates', name: 'fields' },
          ],
        },
      },
    ],
  },
  related: ['kv', 'extract'],
  tags: ['extract', 'table', 'key-value'],
};

// =============================================================================
// NOMV COMMAND
// =============================================================================

/**
 * nomv command
 *
 * Description: Converts a multivalue field to a single value.
 */
export const nomvCommand: CommandSyntax = {
  command: 'nomv',
  category: 'fields::modify',
  description: 'Converts a multivalue field to a single value',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'param',
    type: 'field',
    effect: 'modifies',
    name: 'field',
  },
  related: ['makemv', 'mvexpand'],
  tags: ['multivalue', 'single', 'convert'],
};

// =============================================================================
// OUTLIER COMMAND
// =============================================================================

/**
 * outlier command
 *
 * Description: Removes or transforms outliers from results.
 */
export const outlierCommand: CommandSyntax = {
  command: 'outlier',
  category: 'reporting',
  description: 'Removes or transforms outliers from results',
  grammarSupport: 'generic',
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
                { kind: 'literal', value: 'action' },
                { kind: 'literal', value: '=' },
                {
                  kind: 'alternation',
                  options: [
                    { kind: 'literal', value: 'remove' },
                    { kind: 'literal', value: 'transform' },
                  ],
                },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'param' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'num', name: 'param' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'uselower' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'uselower' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'mark' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'mark' },
              ],
            },
          ],
        },
      },
      { kind: 'param', type: 'field', effect: 'modifies', name: 'field' },
    ],
  },
  related: ['anomalydetection'],
  tags: ['outlier', 'anomaly', 'statistics'],
};

// =============================================================================
// PIVOT COMMAND
// =============================================================================

/**
 * pivot command
 *
 * Description: Creates pivot reports from data models.
 */
export const pivotCommand: CommandSyntax = {
  command: 'pivot',
  category: 'reporting',
  description: 'Creates pivot reports from data models',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'string', name: 'datamodelName' },
      { kind: 'param', type: 'string', name: 'objectName' },
      { kind: 'param', type: 'string', name: 'pivotDescription' },
    ],
  },
  related: ['datamodel', 'tstats'],
  tags: ['pivot', 'datamodel', 'reporting'],
};

// =============================================================================
// PREDICT COMMAND
// =============================================================================

/**
 * predict command
 *
 * Description: Predicts future values based on historical data.
 */
export const predictCommand: CommandSyntax = {
  command: 'predict',
  category: 'reporting',
  description: 'Predicts future values based on historical data',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'field', effect: 'consumes', name: 'field' },
      {
        kind: 'group',
        quantifier: '*',
        pattern: {
          kind: 'alternation',
          options: [
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'as' },
                { kind: 'param', type: 'field', effect: 'creates', name: 'newField' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'algorithm' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'algorithm' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'future_timespan' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'future_timespan' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'holdback' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'holdback' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'period' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'period' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'upper' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'field', effect: 'creates', name: 'upper' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'lower' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'field', effect: 'creates', name: 'lower' },
              ],
            },
          ],
        },
      },
    ],
  },
  semantics: { preservesAll: true },
  related: ['trendline', 'timechart'],
  tags: ['predict', 'forecast', 'machine-learning'],
};

// =============================================================================
// RELTIME COMMAND
// =============================================================================

/**
 * reltime command
 *
 * Description: Converts _time to relative time.
 */
export const reltimeCommand: CommandSyntax = {
  command: 'reltime',
  category: 'fields::add',
  description: 'Converts _time to relative time',
  grammarSupport: 'dedicated',
  syntax: { kind: 'literal', value: 'reltime' },
  semantics: { preservesAll: true },
  related: ['convert'],
  tags: ['time', 'relative'],
};

// =============================================================================
// REST COMMAND
// =============================================================================

/**
 * rest command
 *
 * Description: Accesses Splunk REST API endpoints.
 */
export const restCommand: CommandSyntax = {
  command: 'rest',
  category: 'generating',
  description: 'Accesses Splunk REST API endpoints',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'string', name: 'endpoint' },
      {
        kind: 'group',
        quantifier: '*',
        pattern: {
          kind: 'alternation',
          options: [
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
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'timeout' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'timeout' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'count' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'count' },
              ],
            },
          ],
        },
      },
    ],
  },
  related: ['metadata'],
  tags: ['rest', 'api', 'endpoint'],
};

// =============================================================================
// RTORDER COMMAND
// =============================================================================

/**
 * rtorder command
 *
 * Description: Buffers events for real-time ordering.
 */
export const rtorderCommand: CommandSyntax = {
  command: 'rtorder',
  category: 'results',
  description: 'Buffers events for real-time ordering',
  grammarSupport: 'generic',
  syntax: {
    kind: 'group',
    quantifier: '*',
    pattern: {
      kind: 'alternation',
      options: [
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'discard' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'discard' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'buffer_span' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'buffer_span' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'max_buffer_size' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'max_buffer_size' },
          ],
        },
      ],
    },
  },
  semantics: { preservesAll: true },
  related: ['sort'],
  tags: ['realtime', 'order', 'buffer'],
};

// =============================================================================
// SAVEDSEARCH COMMAND
// =============================================================================

/**
 * savedsearch command
 *
 * Description: Runs a saved search.
 */
export const savedsearchCommand: CommandSyntax = {
  command: 'savedsearch',
  category: 'misc',
  description: 'Runs a saved search',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'param',
    type: 'string',
    name: 'searchName',
  },
  related: ['loadjob'],
  tags: ['saved', 'search', 'report'],
};

// =============================================================================
// SCRIPT COMMAND
// =============================================================================

/**
 * script command
 *
 * Description: Runs an external script.
 */
export const scriptCommand: CommandSyntax = {
  command: 'script',
  category: 'misc',
  description: 'Runs an external script',
  grammarSupport: 'generic',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'string', name: 'scriptName' },
      {
        kind: 'group',
        quantifier: '?',
        pattern: { kind: 'param', type: 'string', name: 'args' },
      },
    ],
  },
  related: ['run'],
  tags: ['script', 'external', 'command'],
};

// =============================================================================
// SCRUB COMMAND
// =============================================================================

/**
 * scrub command
 *
 * Description: Anonymizes data in search results.
 */
export const scrubCommand: CommandSyntax = {
  command: 'scrub',
  category: 'misc',
  description: 'Anonymizes data in search results',
  grammarSupport: 'generic',
  syntax: {
    kind: 'group',
    quantifier: '*',
    pattern: {
      kind: 'alternation',
      options: [
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'public-terms' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'publicTerms' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'private-terms' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'privateTerms' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'name-terms' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'nameTerms' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'dictionary' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'dictionary' },
          ],
        },
      ],
    },
  },
  related: ['anonymize'],
  tags: ['scrub', 'anonymize', 'privacy'],
};

// =============================================================================
// SEARCHTXN COMMAND
// =============================================================================

/**
 * searchtxn command
 *
 * Description: Finds transactions based on events.
 */
export const searchtxnCommand: CommandSyntax = {
  command: 'searchtxn',
  category: 'results',
  description: 'Finds transactions based on events',
  grammarSupport: 'generic',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'string', name: 'transactionName' },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'max_terms' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'max_terms' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'use_disjunct' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'use_disjunct' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'eventsonly' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'eventsonly' },
          ],
        },
      },
    ],
  },
  related: ['transaction'],
  tags: ['transaction', 'search'],
};

// =============================================================================
// SETFIELDS COMMAND
// =============================================================================

/**
 * setfields command
 *
 * Description: Sets field values explicitly.
 */
export const setfieldsCommand: CommandSyntax = {
  command: 'setfields',
  category: 'fields::add',
  description: 'Sets field values explicitly',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'group',
    quantifier: '+',
    pattern: {
      kind: 'sequence',
      patterns: [
        { kind: 'param', type: 'field', effect: 'creates', name: 'field' },
        { kind: 'literal', value: '=' },
        { kind: 'param', type: 'string', name: 'value' },
      ],
    },
  },
  semantics: { preservesAll: true },
  related: ['eval'],
  tags: ['setfields', 'assign'],
};

// =============================================================================
// SICHART COMMAND
// =============================================================================

/**
 * sichart command
 *
 * Description: Summary indexing version of chart.
 */
export const sichartCommand: CommandSyntax = {
  command: 'sichart',
  category: 'reporting',
  description: 'Summary indexing version of chart',
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
                { kind: 'literal', value: 'sep' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'sep' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'format' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'format' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'cont' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'cont' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'limit' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'limit' },
              ],
            },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '+',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'param', type: 'stats-func', name: 'function' },
            { kind: 'literal', value: '(' },
            { kind: 'param', type: 'field', effect: 'consumes', quantifier: '?' },
            { kind: 'literal', value: ')' },
            {
              kind: 'group',
              quantifier: '?',
              pattern: {
                kind: 'sequence',
                patterns: [
                  { kind: 'literal', value: 'as' },
                  { kind: 'param', type: 'field', effect: 'creates', name: 'alias' },
                ],
              },
            },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'over' },
            { kind: 'param', type: 'field', effect: 'groups-by', name: 'overField' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'by' },
            { kind: 'param', type: 'field-list', effect: 'groups-by', name: 'byFields' },
          ],
        },
      },
    ],
  },
  semantics: { dropsAllExcept: ['byFields', 'creates'] },
  related: ['chart', 'collect'],
  tags: ['sichart', 'summary-index', 'chart'],
};

// =============================================================================
// SIRARE COMMAND
// =============================================================================

/**
 * sirare command
 *
 * Description: Summary indexing version of rare.
 */
export const sirareCommand: CommandSyntax = {
  command: 'sirare',
  category: 'reporting',
  description: 'Summary indexing version of rare',
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
                { kind: 'literal', value: 'limit' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'limit' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'showcount' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'showcount' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'showperc' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'showperc' },
              ],
            },
            { kind: 'literal', value: 'useother' },
            { kind: 'literal', value: 'usenull' },
          ],
        },
      },
      { kind: 'param', type: 'field-list', effect: 'groups-by', name: 'fields' },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'by' },
            { kind: 'param', type: 'field-list', effect: 'groups-by', name: 'byFields' },
          ],
        },
      },
    ],
  },
  semantics: { dropsAllExcept: ['byFields', 'creates'] },
  related: ['rare', 'collect'],
  tags: ['sirare', 'summary-index', 'rare'],
};

// =============================================================================
// SISTATS COMMAND
// =============================================================================

/**
 * sistats command
 *
 * Description: Summary indexing version of stats.
 */
export const sistatsCommand: CommandSyntax = {
  command: 'sistats',
  category: 'reporting',
  description: 'Summary indexing version of stats',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      {
        kind: 'group',
        quantifier: '+',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'param', type: 'stats-func', name: 'function' },
            { kind: 'literal', value: '(' },
            { kind: 'param', type: 'field', effect: 'consumes', quantifier: '?' },
            { kind: 'literal', value: ')' },
            {
              kind: 'group',
              quantifier: '?',
              pattern: {
                kind: 'sequence',
                patterns: [
                  { kind: 'literal', value: 'as' },
                  { kind: 'param', type: 'field', effect: 'creates', name: 'alias' },
                ],
              },
            },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'by' },
            { kind: 'param', type: 'field-list', effect: 'groups-by', name: 'byFields' },
          ],
        },
      },
    ],
  },
  semantics: { dropsAllExcept: ['byFields', 'creates'] },
  related: ['stats', 'collect'],
  tags: ['sistats', 'summary-index', 'stats'],
};

// =============================================================================
// SITIMECHART COMMAND
// =============================================================================

/**
 * sitimechart command
 *
 * Description: Summary indexing version of timechart.
 */
export const sitimechartCommand: CommandSyntax = {
  command: 'sitimechart',
  category: 'reporting',
  description: 'Summary indexing version of timechart',
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
                { kind: 'literal', value: 'span' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'span' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'limit' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'limit' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'bins' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'bins' },
              ],
            },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '+',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'param', type: 'stats-func', name: 'function' },
            { kind: 'literal', value: '(' },
            { kind: 'param', type: 'field', effect: 'consumes', quantifier: '?' },
            { kind: 'literal', value: ')' },
            {
              kind: 'group',
              quantifier: '?',
              pattern: {
                kind: 'sequence',
                patterns: [
                  { kind: 'literal', value: 'as' },
                  { kind: 'param', type: 'field', effect: 'creates', name: 'alias' },
                ],
              },
            },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'by' },
            { kind: 'param', type: 'field-list', effect: 'groups-by', name: 'byFields' },
          ],
        },
      },
    ],
  },
  semantics: { dropsAllExcept: ['byFields', 'creates'] },
  related: ['timechart', 'collect'],
  tags: ['sitimechart', 'summary-index', 'timechart'],
};

// =============================================================================
// SITOP COMMAND
// =============================================================================

/**
 * sitop command
 *
 * Description: Summary indexing version of top.
 */
export const sitopCommand: CommandSyntax = {
  command: 'sitop',
  category: 'reporting',
  description: 'Summary indexing version of top',
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
                { kind: 'literal', value: 'limit' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'limit' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'showcount' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'showcount' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'showperc' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'showperc' },
              ],
            },
            { kind: 'literal', value: 'useother' },
            { kind: 'literal', value: 'usenull' },
          ],
        },
      },
      { kind: 'param', type: 'field-list', effect: 'groups-by', name: 'fields' },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'by' },
            { kind: 'param', type: 'field-list', effect: 'groups-by', name: 'byFields' },
          ],
        },
      },
    ],
  },
  semantics: { dropsAllExcept: ['byFields', 'creates'] },
  related: ['top', 'collect'],
  tags: ['sitop', 'summary-index', 'top'],
};

// =============================================================================
// TAGS COMMAND
// =============================================================================

/**
 * tags command
 *
 * Description: Annotates specified fields with tags.
 */
export const tagsCommand: CommandSyntax = {
  command: 'tags',
  category: 'fields::add',
  description: 'Annotates specified fields with tags',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'outputfield' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'field', effect: 'creates', name: 'outputfield' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'inclname' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'inclname' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'inclvalue' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'inclvalue' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: { kind: 'param', type: 'field-list', effect: 'consumes', name: 'fields' },
      },
    ],
  },
  semantics: { preservesAll: true },
  related: ['eval'],
  tags: ['tags', 'annotate'],
};

// =============================================================================
// TRENDLINE COMMAND
// =============================================================================

/**
 * trendline command
 *
 * Description: Computes moving averages of fields.
 */
export const trendlineCommand: CommandSyntax = {
  command: 'trendline',
  category: 'reporting',
  description: 'Computes moving averages of fields',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'group',
    quantifier: '+',
    pattern: {
      kind: 'sequence',
      patterns: [
        {
          kind: 'alternation',
          options: [
            { kind: 'literal', value: 'sma' },
            { kind: 'literal', value: 'ema' },
            { kind: 'literal', value: 'wma' },
          ],
        },
        { kind: 'param', type: 'int', name: 'period' },
        { kind: 'literal', value: '(' },
        { kind: 'param', type: 'field', effect: 'consumes', name: 'field' },
        { kind: 'literal', value: ')' },
        {
          kind: 'group',
          quantifier: '?',
          pattern: {
            kind: 'sequence',
            patterns: [
              { kind: 'literal', value: 'as' },
              { kind: 'param', type: 'field', effect: 'creates', name: 'alias' },
            ],
          },
        },
      ],
    },
  },
  semantics: { preservesAll: true },
  related: ['predict', 'timechart'],
  tags: ['trendline', 'moving-average', 'sma', 'ema'],
};

// =============================================================================
// TYPEAHEAD COMMAND
// =============================================================================

/**
 * typeahead command
 *
 * Description: Returns typeahead information for a prefix.
 */
export const typeaheadCommand: CommandSyntax = {
  command: 'typeahead',
  category: 'generating',
  description: 'Returns typeahead information for a prefix',
  grammarSupport: 'generic',
  syntax: {
    kind: 'sequence',
    patterns: [
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'prefix' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'prefix' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'count' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'count' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'max_time' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'max_time' },
          ],
        },
      },
    ],
  },
  related: ['search'],
  tags: ['typeahead', 'autocomplete'],
};

// =============================================================================
// UNIQ COMMAND
// =============================================================================

/**
 * uniq command
 *
 * Description: Removes duplicate events.
 */
export const uniqCommand: CommandSyntax = {
  command: 'uniq',
  category: 'results',
  description: 'Removes duplicate events',
  grammarSupport: 'generic',
  syntax: { kind: 'literal', value: 'uniq' },
  semantics: { preservesAll: true },
  related: ['dedup'],
  tags: ['uniq', 'unique', 'duplicate'],
};

// =============================================================================
// ABSTRACT COMMAND
// =============================================================================

/**
 * abstract command
 *
 * Description: Produces a summary of each event.
 */
export const abstractCommand: CommandSyntax = {
  command: 'abstract',
  category: 'reporting',
  description: 'Produces a summary of each event',
  grammarSupport: 'generic',
  syntax: {
    kind: 'group',
    quantifier: '*',
    pattern: {
      kind: 'alternation',
      options: [
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'maxterms' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'maxterms' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'maxlines' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'maxlines' },
          ],
        },
      ],
    },
  },
  semantics: { preservesAll: true },
  tags: ['abstract', 'summary'],
};

// =============================================================================
// ADDCOLTOTALS COMMAND
// =============================================================================

/**
 * addcoltotals command
 *
 * Description: Computes column totals for numeric fields.
 */
export const addcoltotalsCommand: CommandSyntax = {
  command: 'addcoltotals',
  category: 'reporting',
  description: 'Computes column totals for numeric fields',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'labelfield' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'field', name: 'labelfield', effect: 'creates' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'label' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'label' },
          ],
        },
      },
      { kind: 'param', type: 'field-list', name: 'fields', effect: 'consumes', quantifier: '?' },
    ],
  },
  semantics: { preservesAll: true },
  related: ['addtotals'],
  tags: ['totals', 'sum', 'column'],
};

// =============================================================================
// ADDINFO COMMAND
// =============================================================================

/**
 * addinfo command
 *
 * Description: Adds information about the search job.
 */
export const addinfoCommand: CommandSyntax = {
  command: 'addinfo',
  category: 'fields::add',
  description: 'Adds information fields about the search',
  grammarSupport: 'dedicated',
  syntax: { kind: 'literal', value: 'addinfo' },
  semantics: { preservesAll: true },
  tags: ['info', 'metadata'],
};

// =============================================================================
// ANALYZEFIELDS COMMAND
// =============================================================================

/**
 * analyzefields command
 *
 * Description: Analyzes field coverage and statistics.
 */
export const analyzefieldsCommand: CommandSyntax = {
  command: 'analyzefields',
  category: 'reporting',
  description: 'Analyzes field coverage and statistics',
  grammarSupport: 'generic',
  syntax: {
    kind: 'group',
    quantifier: '?',
    pattern: {
      kind: 'sequence',
      patterns: [
        { kind: 'literal', value: 'classfield' },
        { kind: 'literal', value: '=' },
        { kind: 'param', type: 'field', name: 'classfield', effect: 'consumes' },
      ],
    },
  },
  semantics: {
    dropsAllExcept: ['creates'],
  },
  tags: ['analyze', 'statistics'],
};

// =============================================================================
// ANOMALIES COMMAND
// =============================================================================

/**
 * anomalies command
 *
 * Description: Finds anomalies in field values.
 */
export const anomaliesCommand: CommandSyntax = {
  command: 'anomalies',
  category: 'reporting',
  description: 'Finds anomalies in field values',
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
            { kind: 'literal', value: 'threshold' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'num', name: 'threshold' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'field' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'field', name: 'field', effect: 'consumes' },
          ],
        },
      ],
    },
  },
  semantics: { preservesAll: true },
  tags: ['anomaly', 'outlier'],
};

// =============================================================================
// ANOMALOUSVALUE COMMAND
// =============================================================================

/**
 * anomalousvalue command
 *
 * Description: Identifies statistically anomalous values.
 */
export const anomalousvalueCommand: CommandSyntax = {
  command: 'anomalousvalue',
  category: 'reporting',
  description: 'Identifies statistically anomalous values',
  grammarSupport: 'generic',
  syntax: {
    kind: 'group',
    quantifier: '*',
    pattern: {
      kind: 'alternation',
      options: [
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'pthresh' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'num', name: 'pthresh' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'minsupcount' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'minsupcount' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'minsupfreq' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'num', name: 'minsupfreq' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'maxanofreq' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'num', name: 'maxanofreq' },
          ],
        },
      ],
    },
  },
  semantics: { preservesAll: true },
  tags: ['anomaly', 'statistics'],
};

// =============================================================================
// ANOMALYDETECTION COMMAND
// =============================================================================

/**
 * anomalydetection command
 *
 * Description: ML-based anomaly detection.
 */
export const anomalydetectionCommand: CommandSyntax = {
  command: 'anomalydetection',
  category: 'reporting',
  description: 'ML-based anomaly detection',
  grammarSupport: 'generic',
  syntax: {
    kind: 'group',
    quantifier: '*',
    pattern: {
      kind: 'alternation',
      options: [
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'method' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'method' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'action' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'action' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'pthresh' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'num', name: 'pthresh' },
          ],
        },
      ],
    },
  },
  semantics: { preservesAll: true },
  tags: ['anomaly', 'ml', 'detection'],
};

// =============================================================================
// ARULES COMMAND
// =============================================================================

/**
 * arules command
 *
 * Description: Association rules analysis.
 */
export const arulesCommand: CommandSyntax = {
  command: 'arules',
  category: 'reporting',
  description: 'Association rules analysis',
  grammarSupport: 'generic',
  syntax: {
    kind: 'group',
    quantifier: '*',
    pattern: {
      kind: 'alternation',
      options: [
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'sup' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'num', name: 'support' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'conf' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'num', name: 'confidence' },
          ],
        },
      ],
    },
  },
  semantics: {
    dropsAllExcept: ['creates'],
  },
  tags: ['association', 'rules', 'market-basket'],
};

// =============================================================================
// ASSOCIATE COMMAND
// =============================================================================

/**
 * associate command
 *
 * Description: Identifies correlations between fields.
 */
export const associateCommand: CommandSyntax = {
  command: 'associate',
  category: 'reporting',
  description: 'Identifies correlations between fields',
  grammarSupport: 'generic',
  syntax: {
    kind: 'group',
    quantifier: '*',
    pattern: {
      kind: 'alternation',
      options: [
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'supcnt' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'supcnt' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'supfreq' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'num', name: 'supfreq' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'improv' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'num', name: 'improv' },
          ],
        },
      ],
    },
  },
  semantics: {
    dropsAllExcept: ['creates'],
  },
  tags: ['associate', 'correlation'],
};

// =============================================================================
// AUDIT COMMAND
// =============================================================================

/**
 * audit command
 *
 * Description: Returns audit trail information.
 */
export const auditCommand: CommandSyntax = {
  command: 'audit',
  category: 'dataset',
  description: 'Returns audit trail information',
  grammarSupport: 'generic',
  syntax: { kind: 'literal', value: 'audit' },
  semantics: {
    dropsAllExcept: ['creates'],
  },
  tags: ['audit', 'log'],
};

// =============================================================================
// BUCKETDIR COMMAND
// =============================================================================

/**
 * bucketdir command
 *
 * Description: Extracts directory components from paths.
 */
export const bucketdirCommand: CommandSyntax = {
  command: 'bucketdir',
  category: 'fields::add',
  description: 'Extracts directory components from paths',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'field', name: 'pathField', effect: 'consumes' },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'pathfield' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'field', name: 'outputField', effect: 'creates' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'depth' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'depth' },
          ],
        },
      },
    ],
  },
  semantics: { preservesAll: true },
  tags: ['bucket', 'directory', 'path'],
};

// =============================================================================
// CLUSTER COMMAND
// =============================================================================

/**
 * cluster command
 *
 * Description: Clusters events together.
 */
export const clusterCommand: CommandSyntax = {
  command: 'cluster',
  category: 'reporting',
  description: 'Clusters events together',
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
            { kind: 'literal', value: 't' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'num', name: 'threshold' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'showcount' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'showcount' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'labelfield' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'field', name: 'labelfield', effect: 'creates' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'field' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'field', name: 'field', effect: 'consumes' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'labelonly' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'labelonly' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'match' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'match' },
          ],
        },
      ],
    },
  },
  semantics: { preservesAll: true },
  tags: ['cluster', 'group'],
};

// =============================================================================
// COFILTER COMMAND
// =============================================================================

/**
 * cofilter command
 *
 * Description: Finds values that occur together.
 */
export const cofilterCommand: CommandSyntax = {
  command: 'cofilter',
  category: 'reporting',
  description: 'Finds values that occur together',
  grammarSupport: 'generic',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'field', name: 'field1', effect: 'consumes' },
      { kind: 'param', type: 'field', name: 'field2', effect: 'consumes' },
    ],
  },
  semantics: {
    dropsAllExcept: ['creates'],
  },
  tags: ['cofilter', 'co-occurrence'],
};

// =============================================================================
// CONCURRENCY COMMAND
// =============================================================================

/**
 * concurrency command
 *
 * Description: Calculates concurrent events.
 */
export const concurrencyCommand: CommandSyntax = {
  command: 'concurrency',
  category: 'reporting',
  description: 'Calculates concurrent events',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      {
        kind: 'sequence',
        patterns: [
          { kind: 'literal', value: 'duration' },
          { kind: 'literal', value: '=' },
          { kind: 'param', type: 'field', name: 'duration', effect: 'consumes' },
        ],
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'start' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'field', name: 'start', effect: 'consumes' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'output' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'field', name: 'output', effect: 'creates' },
          ],
        },
      },
    ],
  },
  semantics: { preservesAll: true },
  tags: ['concurrency', 'overlap'],
};

// =============================================================================
// CONTINGENCY COMMAND
// =============================================================================

/**
 * contingency command
 *
 * Description: Builds a contingency table.
 */
export const contingencyCommand: CommandSyntax = {
  command: 'contingency',
  category: 'reporting',
  description: 'Builds a contingency table',
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
                { kind: 'literal', value: 'maxrows' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'maxrows' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'maxcols' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'maxcols' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'mincolcover' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'num', name: 'mincolcover' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'minrowcover' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'num', name: 'minrowcover' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'totalstr' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'totalstr' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'usetotal' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'bool', name: 'usetotal' },
              ],
            },
          ],
        },
      },
      { kind: 'param', type: 'field', name: 'rowField', effect: 'consumes' },
      { kind: 'param', type: 'field', name: 'colField', effect: 'consumes' },
    ],
  },
  semantics: {
    dropsAllExcept: ['creates'],
  },
  related: ['stats'],
  tags: ['contingency', 'crosstab', 'pivot'],
};

// =============================================================================
// CORRELATE COMMAND
// =============================================================================

/**
 * correlate command
 *
 * Description: Calculates field correlations.
 */
export const correlateCommand: CommandSyntax = {
  command: 'correlate',
  category: 'reporting',
  description: 'Calculates field correlations',
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
            { kind: 'literal', value: 'type' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'type' },
          ],
        },
      ],
    },
  },
  semantics: {
    dropsAllExcept: ['creates'],
  },
  tags: ['correlate', 'correlation'],
};

// =============================================================================
// DATAMODEL COMMAND
// =============================================================================

/**
 * datamodel command
 *
 * Description: Examines data model or data model dataset.
 */
export const datamodelCommand: CommandSyntax = {
  command: 'datamodel',
  category: 'dataset',
  description: 'Examines data model or data model dataset',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'string', name: 'datamodel' },
      { kind: 'param', type: 'string', name: 'object', quantifier: '?' },
      { kind: 'param', type: 'string', name: 'summaryType', quantifier: '?' },
    ],
  },
  semantics: {
    dropsAllExcept: ['creates'],
  },
  tags: ['datamodel', 'pivot'],
};

// =============================================================================
// DBINSPECT COMMAND
// =============================================================================

/**
 * dbinspect command
 *
 * Description: Returns database metadata.
 */
export const dbinspectCommand: CommandSyntax = {
  command: 'dbinspect',
  category: 'dataset',
  description: 'Returns database metadata',
  grammarSupport: 'generic',
  syntax: {
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
            { kind: 'literal', value: 'timeformat' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'timeformat' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'span' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'span' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'corruptonly' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'corruptonly' },
          ],
        },
      ],
    },
  },
  semantics: {
    dropsAllExcept: ['creates'],
  },
  tags: ['dbinspect', 'index', 'metadata'],
};

// =============================================================================
// DELETE COMMAND
// =============================================================================

/**
 * delete command
 *
 * Description: Marks events for deletion.
 */
export const deleteCommand: CommandSyntax = {
  command: 'delete',
  category: 'output',
  description: 'Marks events for deletion',
  grammarSupport: 'generic',
  syntax: { kind: 'literal', value: 'delete' },
  semantics: { preservesAll: true },
  tags: ['delete', 'remove'],
};

// =============================================================================
// DIFF COMMAND
// =============================================================================

/**
 * diff command
 *
 * Description: Compares events.
 */
export const diffCommand: CommandSyntax = {
  command: 'diff',
  category: 'reporting',
  description: 'Compares events',
  grammarSupport: 'generic',
  syntax: {
    kind: 'group',
    quantifier: '*',
    pattern: {
      kind: 'alternation',
      options: [
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'position1' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'position1' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'position2' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'position2' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'attribute' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'field', name: 'attribute', effect: 'consumes' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'diffheader' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'diffheader' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'context' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'context' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'maxlen' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'maxlen' },
          ],
        },
      ],
    },
  },
  semantics: { preservesAll: true },
  tags: ['diff', 'compare'],
};

// =============================================================================
// EVENTCOUNT COMMAND
// =============================================================================

/**
 * eventcount command
 *
 * Description: Returns number of events in index.
 */
export const eventcountCommand: CommandSyntax = {
  command: 'eventcount',
  category: 'reporting',
  description: 'Returns number of events in index',
  grammarSupport: 'generic',
  syntax: {
    kind: 'group',
    quantifier: '*',
    pattern: {
      kind: 'alternation',
      options: [
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'summarize' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'summarize' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'report_size' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'reportSize' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'list_vix' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'listVix' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'index' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'index' },
          ],
        },
      ],
    },
  },
  semantics: {
    dropsAllExcept: ['creates'],
  },
  tags: ['eventcount', 'count', 'index'],
};

// =============================================================================
// FIELDFORMAT COMMAND
// =============================================================================

/**
 * fieldformat command
 *
 * Description: Formats field values for display.
 */
export const fieldformatCommand: CommandSyntax = {
  command: 'fieldformat',
  category: 'fields::modify',
  description: 'Formats field values for display',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'field', name: 'field', effect: 'modifies' },
      { kind: 'literal', value: '=' },
      { kind: 'param', type: 'evaled-field', name: 'expression' },
    ],
  },
  semantics: { preservesAll: true },
  related: ['eval'],
  tags: ['fieldformat', 'format', 'display'],
};

// =============================================================================
// FIELDSUMMARY COMMAND
// =============================================================================

/**
 * fieldsummary command
 *
 * Description: Generates summary statistics for fields.
 */
export const fieldsummaryCommand: CommandSyntax = {
  command: 'fieldsummary',
  category: 'reporting',
  description: 'Generates summary statistics for fields',
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
            { kind: 'literal', value: 'maxvals' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'maxvals' },
          ],
        },
      ],
    },
  },
  semantics: {
    dropsAllExcept: ['creates'],
  },
  related: ['stats'],
  tags: ['fieldsummary', 'summary', 'statistics'],
};

// =============================================================================
// FINDTYPES COMMAND
// =============================================================================

/**
 * findtypes command
 *
 * Description: Generates event type definitions.
 */
export const findtypesCommand: CommandSyntax = {
  command: 'findtypes',
  category: 'reporting',
  description: 'Generates event type definitions',
  grammarSupport: 'generic',
  syntax: {
    kind: 'group',
    quantifier: '*',
    pattern: {
      kind: 'alternation',
      options: [
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'max' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'max' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'notcovered' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'notcovered' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'usealiases' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'usealiases' },
          ],
        },
      ],
    },
  },
  semantics: {
    dropsAllExcept: ['creates'],
  },
  tags: ['findtypes', 'eventtype'],
};

// =============================================================================
// FOLDERIZE COMMAND
// =============================================================================

/**
 * folderize command
 *
 * Description: Creates a hierarchical folder structure.
 */
export const folderizeCommand: CommandSyntax = {
  command: 'folderize',
  category: 'fields::add',
  description: 'Creates a hierarchical folder structure',
  grammarSupport: 'generic',
  syntax: {
    kind: 'sequence',
    patterns: [
      {
        kind: 'sequence',
        patterns: [
          { kind: 'literal', value: 'sep' },
          { kind: 'literal', value: '=' },
          { kind: 'param', type: 'string', name: 'sep' },
        ],
      },
      { kind: 'param', type: 'field', name: 'field', effect: 'consumes' },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'attr' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'field', name: 'attr', effect: 'creates' },
          ],
        },
      },
    ],
  },
  semantics: { preservesAll: true },
  tags: ['folderize', 'hierarchy', 'path'],
};

// =============================================================================
// FROM COMMAND
// =============================================================================

/**
 * from command
 *
 * Description: Retrieves data from a dataset.
 */
export const fromCommand: CommandSyntax = {
  command: 'from',
  category: 'dataset',
  description: 'Retrieves data from a dataset',
  grammarSupport: 'generic',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'string', name: 'dataset' },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'type' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'type' },
          ],
        },
      },
    ],
  },
  semantics: {
    dropsAllExcept: ['creates'],
  },
  tags: ['from', 'dataset', 'source'],
};

// =============================================================================
// OUTPUTTEXT COMMAND
// =============================================================================

/**
 * outputtext command
 *
 * Description: Outputs results as text.
 */
export const outputtextCommand: CommandSyntax = {
  command: 'outputtext',
  category: 'output',
  description: 'Outputs results as text',
  grammarSupport: 'generic',
  syntax: {
    kind: 'group',
    quantifier: '?',
    pattern: {
      kind: 'sequence',
      patterns: [
        { kind: 'literal', value: 'usexml' },
        { kind: 'literal', value: '=' },
        { kind: 'param', type: 'bool', name: 'usexml' },
      ],
    },
  },
  semantics: { preservesAll: true },
  tags: ['outputtext', 'text', 'output'],
};

// =============================================================================
// OVERLAP COMMAND
// =============================================================================

/**
 * overlap command
 *
 * Description: Finds overlapping events.
 */
export const overlapCommand: CommandSyntax = {
  command: 'overlap',
  category: 'reporting',
  description: 'Finds overlapping events',
  grammarSupport: 'generic',
  syntax: { kind: 'literal', value: 'overlap' },
  semantics: { preservesAll: true },
  tags: ['overlap', 'time'],
};

// =============================================================================
// TIMEWRAP COMMAND
// =============================================================================

/**
 * timewrap command
 *
 * Description: Wraps time values for comparison.
 */
export const timewrapCommand: CommandSyntax = {
  command: 'timewrap',
  category: 'reporting',
  description: 'Wraps time values for comparison',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'string', name: 'span' },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'align' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'align' },
          ],
        },
      },
      {
        kind: 'group',
        quantifier: '?',
        pattern: {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'series' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'series' },
          ],
        },
      },
    ],
  },
  semantics: { preservesAll: true },
  related: ['timechart'],
  tags: ['timewrap', 'time', 'compare'],
};

// =============================================================================
// TSCOLLECT COMMAND
// =============================================================================

/**
 * tscollect command
 *
 * Description: Writes results to a tsidx file.
 */
export const tscollectCommand: CommandSyntax = {
  command: 'tscollect',
  category: 'output',
  description: 'Writes results to a tsidx file',
  grammarSupport: 'generic',
  syntax: {
    kind: 'group',
    quantifier: '*',
    pattern: {
      kind: 'alternation',
      options: [
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'namespace' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'namespace' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'squash' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'bool', name: 'squash' },
          ],
        },
      ],
    },
  },
  semantics: { preservesAll: true },
  related: ['tstats'],
  tags: ['tscollect', 'tsidx', 'accelerate'],
};

// =============================================================================
// TYPELEARNER COMMAND
// =============================================================================

/**
 * typelearner command
 *
 * Description: Learns event type information.
 */
export const typelearnerCommand: CommandSyntax = {
  command: 'typelearner',
  category: 'reporting',
  description: 'Learns event type information',
  grammarSupport: 'generic',
  syntax: {
    kind: 'group',
    quantifier: '*',
    pattern: {
      kind: 'alternation',
      options: [
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'maxlen' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'int', name: 'maxlen' },
          ],
        },
      ],
    },
  },
  semantics: { preservesAll: true },
  tags: ['typelearner', 'eventtype'],
};

// =============================================================================
// TYPER COMMAND
// =============================================================================

/**
 * typer command
 *
 * Description: Calculates eventtype field for events.
 */
export const typerCommand: CommandSyntax = {
  command: 'typer',
  category: 'fields::add',
  description: 'Calculates eventtype field for events',
  grammarSupport: 'dedicated',
  syntax: { kind: 'literal', value: 'typer' },
  semantics: { preservesAll: true },
  tags: ['typer', 'eventtype'],
};

// =============================================================================
// WALKLEX COMMAND
// =============================================================================

/**
 * walklex command
 *
 * Description: Walks lexicon terms.
 */
export const walklexCommand: CommandSyntax = {
  command: 'walklex',
  category: 'dataset',
  description: 'Walks lexicon terms',
  grammarSupport: 'generic',
  syntax: {
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
            { kind: 'literal', value: 'type' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'type' },
          ],
        },
        {
          kind: 'sequence',
          patterns: [
            { kind: 'literal', value: 'prefix' },
            { kind: 'literal', value: '=' },
            { kind: 'param', type: 'string', name: 'prefix' },
          ],
        },
      ],
    },
  },
  semantics: {
    dropsAllExcept: ['creates'],
  },
  tags: ['walklex', 'lexicon', 'terms'],
};

// =============================================================================
// X11 COMMAND
// =============================================================================

/**
 * x11 command
 *
 * Description: Seasonal decomposition (X11).
 */
export const x11Command: CommandSyntax = {
  command: 'x11',
  category: 'reporting',
  description: 'Seasonal decomposition (X11)',
  grammarSupport: 'generic',
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'field', name: 'field', effect: 'consumes' },
      {
        kind: 'group',
        quantifier: '*',
        pattern: {
          kind: 'alternation',
          options: [
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'period' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'int', name: 'period' },
              ],
            },
            {
              kind: 'sequence',
              patterns: [
                { kind: 'literal', value: 'output' },
                { kind: 'literal', value: '=' },
                { kind: 'param', type: 'string', name: 'output' },
              ],
            },
          ],
        },
      },
    ],
  },
  semantics: { preservesAll: true },
  tags: ['x11', 'seasonal', 'decomposition'],
};

// =============================================================================
// XMLUNESCAPE COMMAND
// =============================================================================

/**
 * xmlunescape command
 *
 * Description: Unescapes XML characters.
 */
export const xmlunescapeCommand: CommandSyntax = {
  command: 'xmlunescape',
  category: 'fields::modify',
  description: 'Unescapes XML characters',
  grammarSupport: 'dedicated',
  syntax: {
    kind: 'group',
    quantifier: '?',
    pattern: {
      kind: 'sequence',
      patterns: [
        { kind: 'literal', value: 'field' },
        { kind: 'literal', value: '=' },
        { kind: 'param', type: 'field', name: 'field', effect: 'modifies' },
      ],
    },
  },
  semantics: { preservesAll: true },
  related: ['xmlkv'],
  tags: ['xmlunescape', 'xml', 'escape'],
};

// =============================================================================
// MISC COMMANDS AGGREGATE EXPORT
// =============================================================================

/**
 * Miscellaneous command patterns not yet categorized into specific modules.
 * These are commands that don't fit neatly into other categories.
 */
export const miscCommands = {
  // Streaming commands
  accum: accumCommand,
  autoregress: autoregressCommand,
  delta: deltaCommand,

  // Visualization
  gauge: gaugeCommand,
  highlight: highlightCommand,
  iconify: iconifyCommand,

  // Geographic
  geom: geomCommand,
  geomfilter: geomfilterCommand,

  // System/utility
  history: historyCommand,
  loadjob: loadjobCommand,
  localize: localizeCommand,
  localop: localopCommand,
  rest: restCommand,
  savedsearch: savedsearchCommand,
  script: scriptCommand,
  datamodel: datamodelCommand,
  dbinspect: dbinspectCommand,

  // Analysis/ML
  kmeans: kmeansCommand,
  predict: predictCommand,
  trendline: trendlineCommand,
  anomalies: anomaliesCommand,
  anomalousvalue: anomalousvalueCommand,
  anomalydetection: anomalydetectionCommand,
  cluster: clusterCommand,
  outlier: outlierCommand,
  correlate: correlateCommand,

  // Field operations
  kvform: kvformCommand,
  makecontinuous: makecontinuousCommand,
  multikv: multikvCommand,
  nomv: nomvCommand,
  reltime: reltimeCommand,
  setfields: setfieldsCommand,
  fieldformat: fieldformatCommand,
  fieldsummary: fieldsummaryCommand,
  tags: tagsCommand,

  // Search/metadata
  metasearch: metasearchCommand,
  pivot: pivotCommand,
  rtorder: rtorderCommand,
  scrub: scrubCommand,
  searchtxn: searchtxnCommand,
  typeahead: typeaheadCommand,
  findtypes: findtypesCommand,
  abstract: abstractCommand,
  analyzefields: analyzefieldsCommand,

  // Totals/aggregation helpers
  addcoltotals: addcoltotalsCommand,
  addinfo: addinfoCommand,
  contingency: contingencyCommand,
  timewrap: timewrapCommand,

  // Summary indexing variants
  sichart: sichartCommand,
  sirare: sirareCommand,
  sistats: sistatsCommand,
  sitimechart: sitimechartCommand,
  sitop: sitopCommand,

  // Output
  outputtext: outputtextCommand,
  tscollect: tscollectCommand,

  // Association/rules
  arules: arulesCommand,
  associate: associateCommand,
  cofilter: cofilterCommand,

  // Misc utilities
  audit: auditCommand,
  bucketdir: bucketdirCommand,
  concurrency: concurrencyCommand,
  delete: deleteCommand,
  diff: diffCommand,
  eventcount: eventcountCommand,
  folderize: folderizeCommand,
  from: fromCommand,
  overlap: overlapCommand,
  typelearner: typelearnerCommand,
  typer: typerCommand,
  uniq: uniqCommand,
  walklex: walklexCommand,
  x11: x11Command,
  xmlunescape: xmlunescapeCommand,
} as const;
