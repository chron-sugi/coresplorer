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
  | 'metrics'        // Metrics index operations
  | 'ml'             // Machine learning and analytics
  | 'admin'          // Administrative and system commands
  | 'other';

// =============================================================================
// FACTORY HELPERS
// =============================================================================

/**
 * Default field effects for commands.
 * Represents a safe pass-through command that doesn't modify fields.
 */
const DEFAULT_FIELD_EFFECTS = {
  creates: false,
  modifies: false,
  drops: false,
  preservesOthers: true,
} as const;

/**
 * Create a CommandInfo object with sensible defaults for fieldEffects.
 * Reduces boilerplate by only requiring overrides for non-default values.
 *
 * @example
 * // Field creator (most common pattern)
 * createCommand({
 *   name: 'eval',
 *   category: 'eval',
 *   description: 'Calculate expressions',
 *   docsUrl: '...',
 *   fieldEffects: { creates: true, modifies: true }  // only specify what differs
 * })
 */
function createCommand(config: {
  name: string;
  category: CommandCategory;
  description: string;
  docsUrl: string;
  fieldEffects?: Partial<CommandInfo['fieldEffects']>;
  performanceRisk?: PerformanceRisk;
  performanceNote?: string;
  performanceSuggestion?: string;
  example?: string;
}): CommandInfo {
  return {
    name: config.name,
    category: config.category,
    description: config.description,
    docsUrl: config.docsUrl,
    fieldEffects: {
      ...DEFAULT_FIELD_EFFECTS,
      ...config.fieldEffects,
    },
    ...(config.performanceRisk && { performanceRisk: config.performanceRisk }),
    ...(config.performanceNote && { performanceNote: config.performanceNote }),
    ...(config.performanceSuggestion && { performanceSuggestion: config.performanceSuggestion }),
    ...(config.example && { example: config.example }),
  };
}

// =============================================================================
// COMMAND REGISTRY
// =============================================================================

const DOCS_BASE = 'https://docs.splunk.com/Documentation/Splunk/latest/SearchReference';

export const SPL_COMMANDS: Record<string, CommandInfo> = {
  // ---------------------------------------------------------------------------
  // EVAL CATEGORY - Field calculation and extraction
  // ---------------------------------------------------------------------------
  eval: createCommand({
    name: 'eval',
    category: 'eval',
    description: 'Calculate an expression and assign to a field',
    fieldEffects: { creates: true, modifies: true },
    docsUrl: `${DOCS_BASE}/Eval`,
    example: 'eval full_name = first_name . " " . last_name',
  }),
  rex: createCommand({
    name: 'rex',
    category: 'eval',
    description: 'Extract fields using regular expressions',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Rex`,
    example: 'rex field=_raw "user=(?<username>\\w+)"',
  }),
  spath: createCommand({
    name: 'spath',
    category: 'eval',
    description: 'Extract fields from JSON or XML',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Spath`,
    example: 'spath input=json_data path=user.name output=username',
  }),
  extract: createCommand({
    name: 'extract',
    category: 'eval',
    description: 'Extract fields using field extraction rules (kv, auto)',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Extract`,
  }),
  kv: createCommand({
    name: 'kv',
    category: 'eval',
    description: 'Extract key-value pairs',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Extract`,
  }),
  iplocation: createCommand({
    name: 'iplocation',
    category: 'eval',
    description: 'Add geographic data from IP addresses',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Iplocation`,
    example: 'iplocation src_ip',
  }),
  xmlkv: createCommand({
    name: 'xmlkv',
    category: 'eval',
    description: 'Extract XML key-value pairs',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Xmlkv`,
  }),
  xmlunescape: createCommand({
    name: 'xmlunescape',
    category: 'eval',
    description: 'Unescape XML entities in field values',
    fieldEffects: { modifies: true },
    docsUrl: `${DOCS_BASE}/Xmlunescape`,
  }),
  xpath: createCommand({
    name: 'xpath',
    category: 'eval',
    description: 'Extract fields from XML using XPath expressions',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Xpath`,
    example: 'xpath outfield=title "//item/title"',
  }),

  // ---------------------------------------------------------------------------
  // AGGREGATE CATEGORY - Statistical operations
  // ---------------------------------------------------------------------------
  stats: createCommand({
    name: 'stats',
    category: 'aggregate',
    description: 'Calculate aggregate statistics, replacing events with results',
    fieldEffects: { creates: true, drops: true, preservesOthers: false },
    docsUrl: `${DOCS_BASE}/Stats`,
    example: 'stats count, avg(duration) BY host',
  }),
  eventstats: createCommand({
    name: 'eventstats',
    category: 'aggregate',
    description: 'Add aggregate statistics to each event (preserves events)',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Eventstats`,
    example: 'eventstats avg(bytes) AS avg_bytes BY host',
  }),
  streamstats: createCommand({
    name: 'streamstats',
    category: 'aggregate',
    description: 'Calculate streaming/cumulative statistics',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Streamstats`,
    example: 'streamstats sum(bytes) AS running_total',
  }),
  chart: createCommand({
    name: 'chart',
    category: 'aggregate',
    description: 'Create chart-ready aggregated data',
    fieldEffects: { creates: true, drops: true, preservesOthers: false },
    docsUrl: `${DOCS_BASE}/Chart`,
    example: 'chart count BY status OVER _time',
  }),
  timechart: createCommand({
    name: 'timechart',
    category: 'aggregate',
    description: 'Create time-series chart data',
    fieldEffects: { creates: true, drops: true, preservesOthers: false },
    docsUrl: `${DOCS_BASE}/Timechart`,
    example: 'timechart span=1h count BY status',
  }),
  contingency: createCommand({
    name: 'contingency',
    category: 'aggregate',
    description: 'Build a contingency table of two fields',
    fieldEffects: { creates: true, drops: true, preservesOthers: false },
    docsUrl: `${DOCS_BASE}/Contingency`,
    example: 'contingency status host',
  }),
  geostats: createCommand({
    name: 'geostats',
    category: 'aggregate',
    description: 'Calculate geographic statistics for map visualization',
    fieldEffects: { creates: true, drops: true, preservesOthers: false },
    docsUrl: `${DOCS_BASE}/Geostats`,
    example: 'geostats count latfield=lat longfield=lon',
  }),
  sichart: createCommand({
    name: 'sichart',
    category: 'aggregate',
    description: 'Streaming incremental chart',
    fieldEffects: { creates: true, drops: true, preservesOthers: false },
    docsUrl: `${DOCS_BASE}/Sichart`,
  }),
  sirare: createCommand({
    name: 'sirare',
    category: 'aggregate',
    description: 'Streaming incremental rare',
    fieldEffects: { creates: true, drops: true, preservesOthers: false },
    docsUrl: `${DOCS_BASE}/Sirare`,
  }),
  sistats: createCommand({
    name: 'sistats',
    category: 'aggregate',
    description: 'Streaming incremental stats',
    fieldEffects: { creates: true, drops: true, preservesOthers: false },
    docsUrl: `${DOCS_BASE}/Sistats`,
  }),
  sitimechart: createCommand({
    name: 'sitimechart',
    category: 'aggregate',
    description: 'Streaming incremental timechart',
    fieldEffects: { creates: true, drops: true, preservesOthers: false },
    docsUrl: `${DOCS_BASE}/Sitimechart`,
  }),
  sitop: createCommand({
    name: 'sitop',
    category: 'aggregate',
    description: 'Streaming incremental top',
    fieldEffects: { creates: true, drops: true, preservesOthers: false },
    docsUrl: `${DOCS_BASE}/Sitop`,
  }),

  // ---------------------------------------------------------------------------
  // TRANSFORM CATEGORY - Data restructuring
  // ---------------------------------------------------------------------------
  foreach: createCommand({
    name: 'foreach',
    category: 'transform',
    description: 'Apply eval-like expressions over multiple fields using wildcards',
    fieldEffects: { modifies: true },
    performanceRisk: 'moderate',
    performanceNote: '"foreach" can expand to many evaluations and increase search cost.',
    performanceSuggestion: 'Limit wildcards or use explicit field lists when possible.',
    docsUrl: `${DOCS_BASE}/Foreach`,
    example: 'foreach host* [ eval <<FIELD>>=upper(<<FIELD>>) ]',
  }),
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
  autoregress: createCommand({
    name: 'autoregress',
    category: 'transform',
    description: 'Copy previous event field values to the current event',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Autoregress`,
    example: 'autoregress count p=1-3 AS prev_count*',
  }),
  bucketdir: createCommand({
    name: 'bucketdir',
    category: 'transform',
    description: 'Create buckets based on directory path components',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Bucketdir`,
  }),
  cluster: createCommand({
    name: 'cluster',
    category: 'transform',
    description: 'Cluster similar events together',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Cluster`,
    example: 'cluster t=0.8 showcount=true',
  }),
  concurrency: createCommand({
    name: 'concurrency',
    category: 'transform',
    description: 'Tag concurrent events with duration/start fields',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Concurrency`,
  }),
  convert: createCommand({
    name: 'convert',
    category: 'transform',
    description: 'Convert field values (memk, dur2sec, ctime, mktime, etc.)',
    fieldEffects: { modifies: true },
    docsUrl: `${DOCS_BASE}/Convert`,
    example: 'convert memk(memory) dur2sec(duration)',
  }),
  geom: createCommand({
    name: 'geom',
    category: 'transform',
    description: 'Add geographic features for choropleth maps',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Geom`,
    example: 'geom geo_us_states featureIdField=state',
  }),
  makecontinuous: createCommand({
    name: 'makecontinuous',
    category: 'transform',
    description: 'Make field values continuous (fill gaps in numeric sequences)',
    fieldEffects: { modifies: true },
    docsUrl: `${DOCS_BASE}/Makecontinuous`,
  }),
  rangemap: createCommand({
    name: 'rangemap',
    category: 'transform',
    description: 'Map numeric values to named ranges',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Rangemap`,
    example: 'rangemap field=cpu low=0-30 medium=31-70 high=71-100',
  }),
  replace: createCommand({
    name: 'replace',
    category: 'transform',
    description: 'Replace field values using wildcards or exact matches',
    fieldEffects: { modifies: true },
    docsUrl: `${DOCS_BASE}/Replace`,
    example: 'replace "127.0.0.1" WITH "localhost" IN src_ip',
  }),
  setfields: createCommand({
    name: 'setfields',
    category: 'transform',
    description: 'Set field values explicitly',
    fieldEffects: { creates: true, modifies: true },
    docsUrl: `${DOCS_BASE}/Setfields`,
    example: 'setfields marker="baseline"',
  }),
  strcat: createCommand({
    name: 'strcat',
    category: 'transform',
    description: 'Concatenate string values into a destination field',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Strcat`,
    example: 'strcat first_name " " last_name full_name',
  }),
  tags: createCommand({
    name: 'tags',
    category: 'transform',
    description: 'Add tags to events based on field values',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Tags`,
  }),
  transpose: createCommand({
    name: 'transpose',
    category: 'transform',
    description: 'Swap rows and columns in results',
    fieldEffects: { creates: true, drops: true, preservesOthers: false },
    docsUrl: `${DOCS_BASE}/Transpose`,
    example: 'transpose 10 column_name=metric',
  }),
  untable: createCommand({
    name: 'untable',
    category: 'transform',
    description: 'Flatten a table into key-value rows',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Untable`,
    example: 'untable _time metric value',
  }),
  folderize: createCommand({
    name: 'folderize',
    category: 'transform',
    description: 'Create a folder hierarchy from paths',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Folderize`,
  }),

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
  abstract: createCommand({
    name: 'abstract',
    category: 'format',
    description: 'Produce summary of each event',
    docsUrl: `${DOCS_BASE}/Abstract`,
  }),
  gauge: createCommand({
    name: 'gauge',
    category: 'format',
    description: 'Display gauge visualization',
    docsUrl: `${DOCS_BASE}/Gauge`,
    example: 'gauge cpu_percent 0 50 100',
  }),
  highlight: createCommand({
    name: 'highlight',
    category: 'format',
    description: 'Highlight search terms in results',
    docsUrl: `${DOCS_BASE}/Highlight`,
  }),
  iconify: createCommand({
    name: 'iconify',
    category: 'format',
    description: 'Display icons in results',
    docsUrl: `${DOCS_BASE}/Iconify`,
  }),
  outputtext: createCommand({
    name: 'outputtext',
    category: 'format',
    description: 'Output raw text',
    docsUrl: `${DOCS_BASE}/Outputtext`,
  }),
  uniq: createCommand({
    name: 'uniq',
    category: 'format',
    description: 'Remove consecutive duplicate events',
    docsUrl: `${DOCS_BASE}/Uniq`,
  }),

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
  datamodel: createCommand({
    name: 'datamodel',
    category: 'search',
    description: 'Examine data model structure or search accelerated data',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Datamodel`,
    example: 'datamodel Web search | stats count',
  }),
  gentimes: createCommand({
    name: 'gentimes',
    category: 'search',
    description: 'Generate time range events',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Gentimes`,
    example: 'gentimes start=-7d@d end=@d increment=1d',
  }),
  metasearch: createCommand({
    name: 'metasearch',
    category: 'search',
    description: 'Filter events by metadata (host, source, sourcetype)',
    docsUrl: `${DOCS_BASE}/Metasearch`,
  }),
  searchtxn: createCommand({
    name: 'searchtxn',
    category: 'search',
    description: 'Find related events in transaction datasets',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Searchtxn`,
  }),
  regex: createCommand({
    name: 'regex',
    category: 'search',
    description: 'Filter events by regular expression on a field',
    docsUrl: `${DOCS_BASE}/Regex`,
    example: 'regex _raw="error\\d{3}"',
  }),

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
  appendpipe: createCommand({
    name: 'appendpipe',
    category: 'subsearch',
    description: 'Append results from an inline subpipeline',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Appendpipe`,
    example: 'appendpipe [stats sum(count) AS total]',
  }),
  selfjoin: createCommand({
    name: 'selfjoin',
    category: 'subsearch',
    description: 'Join results with itself on specified fields',
    fieldEffects: { creates: true },
    performanceRisk: 'high',
    performanceNote: '"selfjoin" is expensive and should be avoided for large datasets.',
    docsUrl: `${DOCS_BASE}/Selfjoin`,
    example: 'selfjoin session_id',
  }),
  set: createCommand({
    name: 'set',
    category: 'subsearch',
    description: 'Set operations (union, diff, intersect) on subsearch results',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Set`,
    example: 'set diff [search index=b]',
  }),

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
  nomv: createCommand({
    name: 'nomv',
    category: 'multivalue',
    description: 'Flatten multivalue field to a single string',
    fieldEffects: { modifies: true },
    docsUrl: `${DOCS_BASE}/Nomv`,
  }),

  // ---------------------------------------------------------------------------
  // TIME CATEGORY - Time-based operations
  // ---------------------------------------------------------------------------
  localize: createCommand({
    name: 'localize',
    category: 'time',
    description: 'Localize time spans in events',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Localize`,
  }),
  reltime: createCommand({
    name: 'reltime',
    category: 'time',
    description: 'Convert time to relative time format',
    fieldEffects: { modifies: true },
    docsUrl: `${DOCS_BASE}/Reltime`,
  }),
  rtorder: createCommand({
    name: 'rtorder',
    category: 'time',
    description: 'Order real-time events by time',
    docsUrl: `${DOCS_BASE}/Rtorder`,
  }),

  // ---------------------------------------------------------------------------
  // METRICS CATEGORY - Metrics index operations
  // ---------------------------------------------------------------------------
  mcatalog: createCommand({
    name: 'mcatalog',
    category: 'metrics',
    description: 'Return metrics catalog information',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Mcatalog`,
    example: 'mcatalog values(metric_name) WHERE index=metrics_idx',
  }),
  mcollect: createCommand({
    name: 'mcollect',
    category: 'metrics',
    description: 'Write events as metric data points',
    docsUrl: `${DOCS_BASE}/Mcollect`,
  }),
  meventcollect: createCommand({
    name: 'meventcollect',
    category: 'metrics',
    description: 'Write events as metrics',
    docsUrl: `${DOCS_BASE}/Meventcollect`,
  }),
  mpreview: createCommand({
    name: 'mpreview',
    category: 'metrics',
    description: 'Preview metric data before indexing',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Mpreview`,
  }),
  tscollect: createCommand({
    name: 'tscollect',
    category: 'metrics',
    description: 'Collect time-series data for tsidx acceleration',
    docsUrl: `${DOCS_BASE}/Tscollect`,
  }),

  // ---------------------------------------------------------------------------
  // ML/ANALYTICS CATEGORY - Machine learning and analytics
  // ---------------------------------------------------------------------------
  analyzefields: createCommand({
    name: 'analyzefields',
    category: 'ml',
    description: 'Analyze field values for patterns',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Analyzefields`,
  }),
  anomalies: createCommand({
    name: 'anomalies',
    category: 'ml',
    description: 'Find unusual patterns in data',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Anomalies`,
  }),
  anomalousvalue: createCommand({
    name: 'anomalousvalue',
    category: 'ml',
    description: 'Find unusual field values',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Anomalousvalue`,
  }),
  anomalydetection: createCommand({
    name: 'anomalydetection',
    category: 'ml',
    description: 'ML-based anomaly detection',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Anomalydetection`,
  }),
  arules: createCommand({
    name: 'arules',
    category: 'ml',
    description: 'Find association rules in data',
    fieldEffects: { creates: true, drops: true, preservesOthers: false },
    docsUrl: `${DOCS_BASE}/Arules`,
  }),
  associate: createCommand({
    name: 'associate',
    category: 'ml',
    description: 'Find field associations and correlations',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Associate`,
  }),
  cofilter: createCommand({
    name: 'cofilter',
    category: 'ml',
    description: 'Find co-occurring field values',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Cofilter`,
  }),
  correlate: createCommand({
    name: 'correlate',
    category: 'ml',
    description: 'Calculate field correlations',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Correlate`,
  }),
  diff: createCommand({
    name: 'diff',
    category: 'ml',
    description: 'Diff two search results',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Diff`,
  }),
  fieldsummary: createCommand({
    name: 'fieldsummary',
    category: 'ml',
    description: 'Summarize field statistics',
    fieldEffects: { creates: true, drops: true, preservesOthers: false },
    docsUrl: `${DOCS_BASE}/Fieldsummary`,
  }),
  findtypes: createCommand({
    name: 'findtypes',
    category: 'ml',
    description: 'Find matching event types',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Findtypes`,
  }),
  kmeans: createCommand({
    name: 'kmeans',
    category: 'ml',
    description: 'K-means clustering',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Kmeans`,
    example: 'kmeans k=5 bytes, cpu_time',
  }),
  outlier: createCommand({
    name: 'outlier',
    category: 'ml',
    description: 'Remove statistical outliers',
    docsUrl: `${DOCS_BASE}/Outlier`,
  }),
  overlap: createCommand({
    name: 'overlap',
    category: 'ml',
    description: 'Find overlapping time events',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Overlap`,
  }),
  pivot: createCommand({
    name: 'pivot',
    category: 'ml',
    description: 'Run pivot on data model',
    fieldEffects: { creates: true, drops: true, preservesOthers: false },
    docsUrl: `${DOCS_BASE}/Pivot`,
  }),
  relevancy: createCommand({
    name: 'relevancy',
    category: 'ml',
    description: 'Calculate search relevancy scores',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Relevancy`,
  }),
  trendline: createCommand({
    name: 'trendline',
    category: 'ml',
    description: 'Compute moving averages for trend analysis',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Trendline`,
    example: 'trendline sma10(count) AS trend',
  }),
  typelearner: createCommand({
    name: 'typelearner',
    category: 'ml',
    description: 'Learn event types from data',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Typelearner`,
  }),
  typer: createCommand({
    name: 'typer',
    category: 'ml',
    description: 'Calculate event type for events',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Typer`,
  }),
  x11: createCommand({
    name: 'x11',
    category: 'ml',
    description: 'Seasonal time-series adjustment (X11 decomposition)',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/X11`,
  }),

  // ---------------------------------------------------------------------------
  // ADMIN CATEGORY - Administrative and system commands
  // ---------------------------------------------------------------------------
  audit: createCommand({
    name: 'audit',
    category: 'admin',
    description: 'Return audit trail events',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Audit`,
  }),
  crawl: createCommand({
    name: 'crawl',
    category: 'admin',
    description: 'Crawl filesystem for data',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Crawl`,
  }),
  dbinspect: createCommand({
    name: 'dbinspect',
    category: 'admin',
    description: 'Inspect index bucket metadata',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Dbinspect`,
  }),
  delete: createCommand({
    name: 'delete',
    category: 'admin',
    description: 'Mark events for deletion',
    docsUrl: `${DOCS_BASE}/Delete`,
  }),
  eventcount: createCommand({
    name: 'eventcount',
    category: 'admin',
    description: 'Count events in indexes',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Eventcount`,
    example: 'eventcount index=main',
  }),
  history: createCommand({
    name: 'history',
    category: 'admin',
    description: 'Access search history',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/History`,
  }),
  input: createCommand({
    name: 'input',
    category: 'admin',
    description: 'Add inputs to search',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Input`,
  }),
  loadjob: createCommand({
    name: 'loadjob',
    category: 'admin',
    description: 'Load saved job results',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Loadjob`,
    example: 'loadjob savedsearch="daily_report"',
  }),
  localop: createCommand({
    name: 'localop',
    category: 'admin',
    description: 'Run operation locally on search head',
    docsUrl: `${DOCS_BASE}/Localop`,
  }),
  rest: createCommand({
    name: 'rest',
    category: 'admin',
    description: 'Access Splunk REST API',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Rest`,
    example: 'rest /services/server/info',
  }),
  savedsearch: createCommand({
    name: 'savedsearch',
    category: 'admin',
    description: 'Run a saved search',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Savedsearch`,
    example: 'savedsearch savedsearch="my_alert"',
  }),
  script: createCommand({
    name: 'script',
    category: 'admin',
    description: 'Run external script',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Script`,
  }),
  run: createCommand({
    name: 'run',
    category: 'admin',
    description: 'Alias for script command',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Script`,
  }),
  scrub: createCommand({
    name: 'scrub',
    category: 'admin',
    description: 'Anonymize data',
    fieldEffects: { modifies: true },
    docsUrl: `${DOCS_BASE}/Scrub`,
  }),
  sendemail: createCommand({
    name: 'sendemail',
    category: 'admin',
    description: 'Send email with results',
    docsUrl: `${DOCS_BASE}/Sendemail`,
  }),
  typeahead: createCommand({
    name: 'typeahead',
    category: 'admin',
    description: 'Get typeahead suggestions',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Typeahead`,
  }),
  walklex: createCommand({
    name: 'walklex',
    category: 'admin',
    description: 'Walk lexicon for field values',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Walklex`,
  }),
  addinfo: createCommand({
    name: 'addinfo',
    category: 'admin',
    description: 'Add search metadata fields',
    fieldEffects: { creates: true },
    docsUrl: `${DOCS_BASE}/Addinfo`,
  }),

  // ---------------------------------------------------------------------------
  // OTHER
  // ---------------------------------------------------------------------------
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
