/**
 * Implicit Splunk Fields
 *
 * Fields that exist automatically in Splunk events without
 * explicit creation. These are added by Splunk at index time
 * or search time.
 *
 * @module entities/field/model/implicit
 */

// =============================================================================
// TYPES
// =============================================================================

export interface ImplicitFieldInfo {
  /** Field name */
  name: string;

  /** When this field is available */
  availability: 'always' | 'raw-events' | 'transformed';

  /** Data type */
  type: 'string' | 'number' | 'time';

  /** Brief description */
  description: string;

  /** Whether this is an internal field (starts with _) */
  internal: boolean;

  /** Whether this field survives aggregation */
  survivesStats: boolean;
}

// =============================================================================
// IMPLICIT FIELD DEFINITIONS
// =============================================================================

export const IMPLICIT_FIELDS: Record<string, ImplicitFieldInfo> = {
  // ---------------------------------------------------------------------------
  // CORE EVENT FIELDS (always present on raw events)
  // ---------------------------------------------------------------------------
  _time: {
    name: '_time',
    availability: 'always',
    type: 'time',
    description: 'Event timestamp (Unix epoch)',
    internal: true,
    survivesStats: false,
  },
  _raw: {
    name: '_raw',
    availability: 'raw-events',
    type: 'string',
    description: 'Raw event text',
    internal: true,
    survivesStats: false,
  },
  _indextime: {
    name: '_indextime',
    availability: 'always',
    type: 'time',
    description: 'Time when event was indexed',
    internal: true,
    survivesStats: false,
  },

  // ---------------------------------------------------------------------------
  // METADATA FIELDS
  // ---------------------------------------------------------------------------
  host: {
    name: 'host',
    availability: 'always',
    type: 'string',
    description: 'Host that generated the event',
    internal: false,
    survivesStats: false,
  },
  source: {
    name: 'source',
    availability: 'always',
    type: 'string',
    description: 'Source file or input',
    internal: false,
    survivesStats: false,
  },
  sourcetype: {
    name: 'sourcetype',
    availability: 'always',
    type: 'string',
    description: 'Data format/type',
    internal: false,
    survivesStats: false,
  },
  index: {
    name: 'index',
    availability: 'always',
    type: 'string',
    description: 'Index containing the event',
    internal: false,
    survivesStats: false,
  },

  // ---------------------------------------------------------------------------
  // INTERNAL FIELDS
  // ---------------------------------------------------------------------------
  linecount: {
    name: 'linecount',
    availability: 'raw-events',
    type: 'number',
    description: 'Number of lines in event',
    internal: false,
    survivesStats: false,
  },
  punct: {
    name: 'punct',
    availability: 'raw-events',
    type: 'string',
    description: 'Punctuation pattern of event',
    internal: false,
    survivesStats: false,
  },
  splunk_server: {
    name: 'splunk_server',
    availability: 'always',
    type: 'string',
    description: 'Splunk server that indexed the event',
    internal: false,
    survivesStats: false,
  },
  splunk_server_group: {
    name: 'splunk_server_group',
    availability: 'always',
    type: 'string',
    description: 'Server group',
    internal: false,
    survivesStats: false,
  },
  _bkt: {
    name: '_bkt',
    availability: 'always',
    type: 'string',
    description: 'Bucket ID',
    internal: true,
    survivesStats: false,
  },
  _cd: {
    name: '_cd',
    availability: 'always',
    type: 'string',
    description: 'Bucket:offset address',
    internal: true,
    survivesStats: false,
  },
  _serial: {
    name: '_serial',
    availability: 'always',
    type: 'number',
    description: 'Event serial number in bucket',
    internal: true,
    survivesStats: false,
  },
  _si: {
    name: '_si',
    availability: 'always',
    type: 'string',
    description: 'Splunk server and index',
    internal: true,
    survivesStats: false,
  },

  // ---------------------------------------------------------------------------
  // TRANSACTION FIELDS (created by transaction command)
  // ---------------------------------------------------------------------------
  duration: {
    name: 'duration',
    availability: 'transformed',
    type: 'number',
    description: 'Transaction duration in seconds',
    internal: false,
    survivesStats: false,
  },
  eventcount: {
    name: 'eventcount',
    availability: 'transformed',
    type: 'number',
    description: 'Number of events in transaction',
    internal: false,
    survivesStats: false,
  },
};

// =============================================================================
// FIELD SETS
// =============================================================================

/** Fields that are always present on raw events (includes core implicit fields like _raw) */
export const ALWAYS_PRESENT_FIELDS = Object.values(IMPLICIT_FIELDS)
  .filter(f => f.availability === 'always' || f.availability === 'raw-events')
  .map(f => f.name);

/** Fields that start with underscore (internal) */
export const INTERNAL_FIELDS = Object.values(IMPLICIT_FIELDS)
  .filter(f => f.internal)
  .map(f => f.name);

/** Standard metadata fields (non-internal, always present) */
export const METADATA_FIELDS = ['host', 'source', 'sourcetype', 'index'];

/** The internal field prefix */
export const INTERNAL_FIELD_PREFIX = '_';

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Check if a field is an implicit Splunk field.
 */
export function isImplicitField(fieldName: string): boolean {
  return fieldName in IMPLICIT_FIELDS;
}

/**
 * Check if a field is an internal field (starts with _).
 */
export function isInternalField(fieldName: string): boolean {
  return fieldName.startsWith(INTERNAL_FIELD_PREFIX);
}

/**
 * Get info about an implicit field.
 */
export function getImplicitFieldInfo(fieldName: string): ImplicitFieldInfo | null {
  return IMPLICIT_FIELDS[fieldName] ?? null;
}

/**
 * Get all implicit field names.
 */
export function getImplicitFieldNames(): string[] {
  return Object.keys(IMPLICIT_FIELDS);
}
