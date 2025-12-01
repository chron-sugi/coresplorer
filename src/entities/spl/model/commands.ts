/**
 * SPL Command Metadata
 *
 * Declarative information about SPL commands - what they do,
 * how they affect fields, and where to find documentation.
 *
 * @module entities/spl/model/commands
 */

// =============================================================================
// TYPES
// =============================================================================

export interface CommandInfo {
  /** Command name (lowercase) */
  name: string;

  /** Functional category */
  category: CommandCategory;

  /** Brief description */
  description: string;

  /** Field effects */
  fieldEffects: {
    /** Can create new fields */
    creates: boolean;
    /** Can modify existing fields */
    modifies: boolean;
    /** Can remove fields */
    drops: boolean;
    /** Preserves fields not explicitly mentioned */
    preservesOthers: boolean;
  };

  /** Performance risk level for linting */
  performanceRisk?: PerformanceRisk;

  /** Human-readable performance warning message */
  performanceNote?: string;

  /** Suggestion for alternatives when performance risk is high */
  performanceSuggestion?: string;

  /** Splunk documentation URL */
  docsUrl: string;

  /** Example usage */
  example?: string;
}

export type PerformanceRisk = 'none' | 'low' | 'moderate' | 'high';

export type CommandCategory =
  | 'search'         // Filtering/searching events
  | 'transform'      // Restructuring data
  | 'aggregate'      // Statistical aggregation
  | 'eval'           // Field calculation/extraction
  | 'format'         // Output formatting
  | 'subsearch'      // Pipeline manipulation
  | 'lookup'         // External data enrichment
  | 'multivalue'     // Multivalue field operations
  | 'time'           // Time-based operations
  | 'other';

// =============================================================================
// COMMAND REGISTRY
// =============================================================================

const DOCS_BASE = 'https://docs.splunk.com/Documentation/Splunk/latest/SearchReference';

export const SPL_COMMANDS: Record<string, CommandInfo> = {
  // ---------------------------------------------------------------------------
  // EVAL CATEGORY - Field calculation and extraction
  // ---------------------------------------------------------------------------
  eval: {
    name: 'eval',
    category: 'eval',
    description: 'Calculate an expression and assign to a field',
    fieldEffects: { creates: true, modifies: true, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Eval`,
    example: 'eval full_name = first_name . " " . last_name',
  },
  rex: {
    name: 'rex',
    category: 'eval',
    description: 'Extract fields using regular expressions',
    fieldEffects: { creates: true, modifies: false, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Rex`,
    example: 'rex field=_raw "user=(?<username>\\w+)"',
  },
  spath: {
    name: 'spath',
    category: 'eval',
    description: 'Extract fields from JSON or XML',
    fieldEffects: { creates: true, modifies: false, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Spath`,
    example: 'spath input=json_data path=user.name output=username',
  },
  extract: {
    name: 'extract',
    category: 'eval',
    description: 'Extract fields using field extraction rules (kv, auto)',
    fieldEffects: { creates: true, modifies: false, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Extract`,
  },
  kv: {
    name: 'kv',
    category: 'eval',
    description: 'Extract key-value pairs',
    fieldEffects: { creates: true, modifies: false, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Extract`,
  },

  // ---------------------------------------------------------------------------
  // AGGREGATE CATEGORY - Statistical operations
  // ---------------------------------------------------------------------------
  stats: {
    name: 'stats',
    category: 'aggregate',
    description: 'Calculate aggregate statistics, replacing events with results',
    fieldEffects: { creates: true, modifies: false, drops: true, preservesOthers: false },
    docsUrl: `${DOCS_BASE}/Stats`,
    example: 'stats count, avg(duration) BY host',
  },
  eventstats: {
    name: 'eventstats',
    category: 'aggregate',
    description: 'Add aggregate statistics to each event (preserves events)',
    fieldEffects: { creates: true, modifies: false, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Eventstats`,
    example: 'eventstats avg(bytes) AS avg_bytes BY host',
  },
  streamstats: {
    name: 'streamstats',
    category: 'aggregate',
    description: 'Calculate streaming/cumulative statistics',
    fieldEffects: { creates: true, modifies: false, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Streamstats`,
    example: 'streamstats sum(bytes) AS running_total',
  },
  chart: {
    name: 'chart',
    category: 'aggregate',
    description: 'Create chart-ready aggregated data',
    fieldEffects: { creates: true, modifies: false, drops: true, preservesOthers: false },
    docsUrl: `${DOCS_BASE}/Chart`,
    example: 'chart count BY status OVER _time',
  },
  timechart: {
    name: 'timechart',
    category: 'aggregate',
    description: 'Create time-series chart data',
    fieldEffects: { creates: true, modifies: false, drops: true, preservesOthers: false },
    docsUrl: `${DOCS_BASE}/Timechart`,
    example: 'timechart span=1h count BY status',
  },

  // ---------------------------------------------------------------------------
  // TRANSFORM CATEGORY - Data restructuring
  // ---------------------------------------------------------------------------
  foreach: {
    name: 'foreach',
    category: 'transform',
    description: 'Apply eval-like expressions over multiple fields using wildcards',
    fieldEffects: { creates: false, modifies: true, drops: false, preservesOthers: true },
    performanceRisk: 'moderate',
    performanceNote: '"foreach" can expand to many evaluations and increase search cost.',
    performanceSuggestion: 'Limit wildcards or use explicit field lists when possible.',
    docsUrl: `${DOCS_BASE}/Foreach`,
    example: 'foreach host* [ eval <<FIELD>>=upper(<<FIELD>>) ]',
  },
  rename: {
    name: 'rename',
    category: 'transform',
    description: 'Rename fields',
    fieldEffects: { creates: true, modifies: false, drops: true, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Rename`,
    example: 'rename src AS source_ip, dst AS dest_ip',
  },
  bin: {
    name: 'bin',
    category: 'transform',
    description: 'Discretize continuous values into bins',
    fieldEffects: { creates: false, modifies: true, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Bin`,
    example: 'bin _time span=1h',
  },
  bucket: {
    name: 'bucket',
    category: 'transform',
    description: 'Alias for bin',
    fieldEffects: { creates: false, modifies: true, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Bin`,
  },
  transaction: {
    name: 'transaction',
    category: 'transform',
    description: 'Group events into transactions',
    fieldEffects: { creates: true, modifies: false, drops: false, preservesOthers: true },
    performanceRisk: 'high',
    performanceNote: '"transaction" is memory intensive and single-threaded.',
    performanceSuggestion: 'Use "stats" with "streamstats" for better performance.',
    docsUrl: `${DOCS_BASE}/Transaction`,
    example: 'transaction session_id maxspan=30m',
  },
  delta: {
    name: 'delta',
    category: 'transform',
    description: 'Calculate the difference between consecutive events',
    fieldEffects: { creates: true, modifies: false, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Delta`,
    example: 'delta bytes AS bytes_delta',
  },
  accum: {
    name: 'accum',
    category: 'transform',
    description: 'Compute a running total over events',
    fieldEffects: { creates: true, modifies: false, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Accum`,
    example: 'accum count AS running_count',
  },
  addtotals: {
    name: 'addtotals',
    category: 'transform',
    description: 'Add row/column totals to events',
    fieldEffects: { creates: true, modifies: false, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Addtotals`,
    example: 'addtotals col=t labelfield=Total',
  },
  addcoltotals: {
    name: 'addcoltotals',
    category: 'transform',
    description: 'Add totals row across specified fields',
    fieldEffects: { creates: true, modifies: false, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Addcoltotals`,
    example: 'addcoltotals count error_count',
  },
  fieldformat: {
    name: 'fieldformat',
    category: 'transform',
    description: 'Format field values for display without changing raw values',
    fieldEffects: { creates: false, modifies: false, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Fieldformat`,
    example: 'fieldformat bytes = tostring(bytes, "commas")',
  },

  // ---------------------------------------------------------------------------
  // FORMAT CATEGORY - Output control
  // ---------------------------------------------------------------------------
  table: {
    name: 'table',
    category: 'format',
    description: 'Display only specified fields in tabular format',
    fieldEffects: { creates: false, modifies: false, drops: true, preservesOthers: false },
    docsUrl: `${DOCS_BASE}/Table`,
    example: 'table _time, host, status, message',
  },
  fields: {
    name: 'fields',
    category: 'format',
    description: 'Keep (+) or remove (-) fields',
    fieldEffects: { creates: false, modifies: false, drops: true, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Fields`,
    example: 'fields - _raw, _time | fields + host, status',
  },
  format: {
    name: 'format',
    category: 'format',
    description: 'Format search results for subsearch consumption',
    fieldEffects: { creates: false, modifies: false, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Format`,
  },
  outputcsv: {
    name: 'outputcsv',
    category: 'format',
    description: 'Write search results to a CSV file on disk',
    fieldEffects: { creates: false, modifies: false, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Outputcsv`,
    example: 'outputcsv results.csv',
  },
  dedup: {
    name: 'dedup',
    category: 'format',
    description: 'Remove duplicate events based on field values',
    fieldEffects: { creates: false, modifies: false, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Dedup`,
    example: 'dedup host, status',
  },
  sort: {
    name: 'sort',
    category: 'format',
    description: 'Sort events by field values',
    fieldEffects: { creates: false, modifies: false, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Sort`,
    example: 'sort -_time, +status',
  },
  head: {
    name: 'head',
    category: 'format',
    description: 'Return first N events',
    fieldEffects: { creates: false, modifies: false, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Head`,
    example: 'head 100',
  },
  tail: {
    name: 'tail',
    category: 'format',
    description: 'Return last N events',
    fieldEffects: { creates: false, modifies: false, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Tail`,
    example: 'tail 100',
  },

  // ---------------------------------------------------------------------------
  // SEARCH CATEGORY - Filtering
  // ---------------------------------------------------------------------------
  makeresults: {
    name: 'makeresults',
    category: 'search',
    description: 'Generate placeholder events for testing or eval',
    fieldEffects: { creates: true, modifies: false, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Makeresults`,
    example: 'makeresults count=5 | streamstats count AS row',
  },
  metadata: {
    name: 'metadata',
    category: 'search',
    description: 'Return metadata about hosts, sources, or sourcetypes',
    fieldEffects: { creates: true, modifies: false, drops: true, preservesOthers: false },
    docsUrl: `${DOCS_BASE}/Metadata`,
    example: 'metadata type=hosts index=main',
  },
  where: {
    name: 'where',
    category: 'search',
    description: 'Filter events using eval expressions',
    fieldEffects: { creates: false, modifies: false, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Where`,
    example: 'where status >= 400 AND len(message) > 0',
  },
  search: {
    name: 'search',
    category: 'search',
    description: 'Filter events using search syntax',
    fieldEffects: { creates: false, modifies: false, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Search`,
    example: 'search status=500 OR status=503',
  },

  // ---------------------------------------------------------------------------
  // LOOKUP CATEGORY - External data
  // ---------------------------------------------------------------------------
  inputcsv: {
    name: 'inputcsv',
    category: 'lookup',
    description: 'Read events from a CSV file on disk',
    fieldEffects: { creates: true, modifies: false, drops: false, preservesOthers: false },
    docsUrl: `${DOCS_BASE}/Inputcsv`,
    example: 'inputcsv users.csv',
  },
  lookup: {
    name: 'lookup',
    category: 'lookup',
    description: 'Enrich events with lookup table data',
    fieldEffects: { creates: true, modifies: false, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Lookup`,
    example: 'lookup users_lookup user_id OUTPUT username, email',
  },
  inputlookup: {
    name: 'inputlookup',
    category: 'lookup',
    description: 'Load events from a lookup table',
    fieldEffects: { creates: true, modifies: false, drops: false, preservesOthers: false },
    docsUrl: `${DOCS_BASE}/Inputlookup`,
    example: 'inputlookup users_lookup',
  },
  outputlookup: {
    name: 'outputlookup',
    category: 'lookup',
    description: 'Write events to a lookup table',
    fieldEffects: { creates: false, modifies: false, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Outputlookup`,
  },

  // ---------------------------------------------------------------------------
  // SUBSEARCH CATEGORY - Pipeline operations
  // ---------------------------------------------------------------------------
  append: {
    name: 'append',
    category: 'subsearch',
    description: 'Append results from a subsearch',
    fieldEffects: { creates: true, modifies: false, drops: false, preservesOthers: true },
    performanceRisk: 'moderate',
    performanceNote: 'The "append" command requires the search head to process all subsearch results.',
    performanceSuggestion: 'Ensure subsearches are efficient or consider "stats" approaches.',
    docsUrl: `${DOCS_BASE}/Append`,
    example: 'append [search index=errors | stats count]',
  },
  appendcols: {
    name: 'appendcols',
    category: 'subsearch',
    description: 'Append fields from a subsearch as new columns',
    fieldEffects: { creates: true, modifies: false, drops: false, preservesOthers: true },
    performanceRisk: 'moderate',
    performanceNote: '"appendcols" runs an additional subsearch for every result set.',
    performanceSuggestion: 'Use stats or lookups to combine data when possible.',
    docsUrl: `${DOCS_BASE}/Appendcols`,
    example: 'appendcols [ search index=errors | stats count AS error_count ]',
  },
  join: {
    name: 'join',
    category: 'subsearch',
    description: 'Join results with a subsearch',
    fieldEffects: { creates: true, modifies: false, drops: false, preservesOthers: true },
    performanceRisk: 'high',
    performanceNote: 'Avoid using "join" as it is resource intensive and has limits (50k rows default).',
    performanceSuggestion: 'Consider using "stats", "append", or "lookup" instead.',
    docsUrl: `${DOCS_BASE}/Join`,
    example: 'join user_id [search index=users | table user_id, name]',
  },
  map: {
    name: 'map',
    category: 'subsearch',
    description: 'Run a subsearch for each result and merge the outputs',
    fieldEffects: { creates: true, modifies: false, drops: false, preservesOthers: true },
    performanceRisk: 'high',
    performanceNote: '"map" executes many subsearches and can be very expensive.',
    performanceSuggestion: 'Refactor to a single search or stats aggregation when possible.',
    docsUrl: `${DOCS_BASE}/Map`,
    example: 'map search="search index=$index$ host=$host$ | stats count"',
  },
  multisearch: {
    name: 'multisearch',
    category: 'subsearch',
    description: 'Run multiple searches in parallel and merge the events',
    fieldEffects: { creates: true, modifies: false, drops: false, preservesOthers: true },
    performanceRisk: 'moderate',
    performanceNote: '"multisearch" runs multiple pipelines and can increase resource use.',
    performanceSuggestion: 'Consider a combined search with filters or tags.',
    docsUrl: `${DOCS_BASE}/Multisearch`,
  },
  union: {
    name: 'union',
    category: 'subsearch',
    description: 'Combine results from multiple searches',
    fieldEffects: { creates: true, modifies: false, drops: false, preservesOthers: true },
    performanceRisk: 'moderate',
    performanceNote: 'The "union" command requires the search head to process all subsearch results.',
    performanceSuggestion: 'Ensure subsearches are efficient or consider "stats" approaches.',
    docsUrl: `${DOCS_BASE}/Union`,
  },
  return: {
    name: 'return',
    category: 'subsearch',
    description: 'Return values from a subsearch to the parent search',
    fieldEffects: { creates: true, modifies: false, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Return`,
    example: 'return 5 host',
  },
  collect: {
    name: 'collect',
    category: 'subsearch',
    description: 'Write results to an index (summaries) for later searching',
    fieldEffects: { creates: false, modifies: false, drops: false, preservesOthers: true },
    performanceRisk: 'moderate',
    performanceNote: '"collect" writes to disk and can create load on indexers.',
    performanceSuggestion: 'Limit to summary indexing with narrow datasets.',
    docsUrl: `${DOCS_BASE}/Collect`,
  },

  // ---------------------------------------------------------------------------
  // MULTIVALUE CATEGORY
  // ---------------------------------------------------------------------------
  mvexpand: {
    name: 'mvexpand',
    category: 'multivalue',
    description: 'Expand multivalue field into separate events',
    fieldEffects: { creates: false, modifies: true, drops: false, preservesOthers: true },
    performanceRisk: 'moderate',
    performanceNote: '"mvexpand" can explode event counts significantly.',
    performanceSuggestion: 'Ensure the multivalue field cardinality is low.',
    docsUrl: `${DOCS_BASE}/Mvexpand`,
    example: 'mvexpand categories',
  },
  makemv: {
    name: 'makemv',
    category: 'multivalue',
    description: 'Convert single value to multivalue',
    fieldEffects: { creates: false, modifies: true, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Makemv`,
    example: 'makemv delim="," tags',
  },
  mvcombine: {
    name: 'mvcombine',
    category: 'multivalue',
    description: 'Combine events into multivalue fields',
    fieldEffects: { creates: false, modifies: true, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Mvcombine`,
  },

  // ---------------------------------------------------------------------------
  // OTHER
  // ---------------------------------------------------------------------------
  regex: {
    name: 'regex',
    category: 'other',
    description: 'Filter events by regular expression on a field',
    fieldEffects: { creates: false, modifies: false, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Regex`,
    example: 'regex _raw="error\\d{3}"',
  },
  erex: {
    name: 'erex',
    category: 'other',
    description: 'Extract fields using named capture groups with examples',
    fieldEffects: { creates: true, modifies: false, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Erex`,
    example: 'erex user examples="bob,alice,carol"',
  },
  kvform: {
    name: 'kvform',
    category: 'other',
    description: 'Extract fields from form-like key/value text',
    fieldEffects: { creates: true, modifies: false, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Kvform`,
  },
  multikv: {
    name: 'multikv',
    category: 'other',
    description: 'Extract fields from multi-line tabular events',
    fieldEffects: { creates: true, modifies: false, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Multikv`,
  },
  fillnull: {
    name: 'fillnull',
    category: 'other',
    description: 'Replace null values',
    fieldEffects: { creates: false, modifies: true, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Fillnull`,
    example: 'fillnull value=0 count',
  },
  filldown: {
    name: 'filldown',
    category: 'other',
    description: 'Fill null values with previous non-null value',
    fieldEffects: { creates: false, modifies: true, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Filldown`,
  },
  top: {
    name: 'top',
    category: 'aggregate',
    description: 'Show the most common field values with counts and percentages',
    fieldEffects: { creates: true, modifies: false, drops: true, preservesOthers: false },
    docsUrl: `${DOCS_BASE}/Top`,
    example: 'top limit=5 status',
  },
  rare: {
    name: 'rare',
    category: 'aggregate',
    description: 'Show the least common field values with counts and percentages',
    fieldEffects: { creates: true, modifies: false, drops: true, preservesOthers: false },
    docsUrl: `${DOCS_BASE}/Rare`,
    example: 'rare limit=5 status',
  },
  xyseries: {
    name: 'xyseries',
    category: 'aggregate',
    description: 'Transform stats output into x/y series columns',
    fieldEffects: { creates: true, modifies: false, drops: true, preservesOthers: false },
    docsUrl: `${DOCS_BASE}/Xyseries`,
    example: 'stats sum(bytes) BY host _time | xyseries _time host sum(bytes)',
  },
  timewrap: {
    name: 'timewrap',
    category: 'aggregate',
    description: 'Overlay timechart data across time periods',
    fieldEffects: { creates: true, modifies: false, drops: true, preservesOthers: false },
    docsUrl: `${DOCS_BASE}/Timewrap`,
    example: 'timechart span=1h count | timewrap 1d',
  },
  predict: {
    name: 'predict',
    category: 'aggregate',
    description: 'Predict future values using historical trends',
    fieldEffects: { creates: true, modifies: false, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Predict`,
    example: 'predict cpu_load',
  },
  tstats: {
    name: 'tstats',
    category: 'aggregate',
    description: 'Accelerated stats over tsidx summaries',
    fieldEffects: { creates: true, modifies: false, drops: true, preservesOthers: false },
    docsUrl: `${DOCS_BASE}/Tstats`,
    example: 'tstats count WHERE index=main BY host',
  },
  mstats: {
    name: 'mstats',
    category: 'aggregate',
    description: 'Stats over metrics indexes',
    fieldEffects: { creates: true, modifies: false, drops: true, preservesOthers: false },
    docsUrl: `${DOCS_BASE}/Mstats`,
    example: 'mstats sum(cpu.usage) BY host span=1m',
  },
  reverse: {
    name: 'reverse',
    category: 'other',
    description: 'Reverse the order of events',
    fieldEffects: { creates: false, modifies: false, drops: false, preservesOthers: true },
    docsUrl: `${DOCS_BASE}/Reverse`,
  },
};

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get command info by name (case-insensitive).
 */
export function getCommandInfo(commandName: string): CommandInfo | null {
  return SPL_COMMANDS[commandName.toLowerCase()] ?? null;
}

/**
 * Get all commands in a category.
 */
export function getCommandsByCategory(category: CommandCategory): CommandInfo[] {
  return Object.values(SPL_COMMANDS).filter(cmd => cmd.category === category);
}

/**
 * Get all commands that can create fields.
 */
export function getFieldCreatingCommands(): CommandInfo[] {
  return Object.values(SPL_COMMANDS).filter(cmd => cmd.fieldEffects.creates);
}

/**
 * Check if a command drops fields not explicitly mentioned.
 */
export function commandDropsFields(commandName: string): boolean {
  const info = getCommandInfo(commandName);
  return info?.fieldEffects.drops ?? false;
}
