/**
 * Field Lineage Type Definitions
 * 
 * Types for tracking field origin, transformation, and usage
 * throughout an SPL search pipeline.
 * 
 * @module features/field-lineage/model/field-lineage.types
 */

// =============================================================================
// CORE TYPES
// =============================================================================

/**
 * Complete lineage information for a single field.
 */
export interface FieldLineage {
  /** The field name */
  fieldName: string;
  
  /** All events in this field's lifecycle */
  events: FieldEvent[];
  
  /** Where the field first appeared */
  origin: FieldEvent | null;
  
  /** Fields this field depends on (for computed fields) */
  dependsOn: string[];
  
  /** Fields that depend on this field */
  dependedOnBy: string[];
  
  /** Inferred data type */
  dataType: FieldDataType;
  
  /** Whether the field can have multiple values */
  isMultivalue: boolean;
  
  /** Confidence in the lineage information */
  confidence: ConfidenceLevel;
}

/**
 * A single event in a field's lifecycle.
 */
export interface FieldEvent {
  /** Type of event */
  kind: FieldEventKind;
  
  /** Line number where event occurred */
  line: number;
  
  /** Column number */
  column: number;
  
  /** Command that caused this event */
  command: string;
  
  /** Additional context about the event */
  details?: string;
  
  /** Expression (for eval, where, etc.) */
  expression?: string;
  
  /** Fields this event depends on */
  dependsOn?: string[];
  
  /** Warnings or notes about this event */
  warnings?: string[];
}

export type FieldEventKind =
  | 'origin'      // Field first appears (raw event, implicit)
  | 'created'     // Field created by command
  | 'modified'    // Field value changed
  | 'renamed'     // Field renamed (from another field)
  | 'consumed'    // Field used (read) by command
  | 'dropped';    // Field no longer exists after this point

export type FieldDataType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'time'
  | 'unknown';

export type ConfidenceLevel =
  | 'certain'     // Statically determined
  | 'likely'      // High confidence inference
  | 'possible'    // May or may not be accurate
  | 'unknown';    // Cannot determine

// =============================================================================
// PIPELINE STATE
// =============================================================================

/**
 * State of fields at a specific pipeline stage.
 */
export interface PipelineStageState {
  /** Stage index (0-based) */
  stageIndex: number;
  
  /** Line number of this stage */
  line: number;
  
  /** Command at this stage */
  command: string;
  
  /** All fields available at this stage (after command executes) */
  fieldsAvailable: Map<string, FieldState>;
  
  /** Fields created by this stage */
  fieldsCreated: string[];
  
  /** Fields modified by this stage */
  fieldsModified: string[];
  
  /** Fields consumed (read) by this stage */
  fieldsConsumed: string[];
  
  /** Fields that no longer exist after this stage */
  fieldsDropped: string[];
}

/**
 * State of a single field at a point in the pipeline.
 */
export interface FieldState {
  /** Field name */
  fieldName: string;
  
  /** Whether the field exists at this point */
  exists: boolean;
  
  /** Most recent event for this field */
  lastEvent: FieldEvent | null;
  
  /** Data type at this point */
  dataType: FieldDataType;
  
  /** Is multivalue at this point */
  isMultivalue: boolean;
  
  /** Confidence level */
  confidence: ConfidenceLevel;
}

// =============================================================================
// LINEAGE INDEX (Query Interface)
// =============================================================================

/**
 * Main interface for querying field lineage.
 */
export interface LineageIndex {
  /** Get complete lineage for a field */
  getFieldLineage(fieldName: string): FieldLineage | null;
  
  /** Get field info at a specific line */
  getFieldAtLine(fieldName: string, line: number): FieldState | null;
  
  /** Check if a field exists at a line */
  fieldExistsAt(fieldName: string, line: number): boolean;
  
  /** Get all fields available at a line */
  getFieldsAtLine(line: number): string[];
  
  /** Get the origin event for a field */
  getFieldOrigin(fieldName: string): FieldEvent | null;
  
  /** Get all events for a field */
  getFieldEvents(fieldName: string): FieldEvent[];
  
  /** Get fields that depend on a given field */
  getDependents(fieldName: string): string[];
  
  /** Get fields that a given field depends on */
  getDependencies(fieldName: string): string[];
  
  /** Get all pipeline stages */
  getStages(): PipelineStageState[];
  
  /** Get stage at a specific line */
  getStageAtLine(line: number): PipelineStageState | null;
  
  /** Get all known field names */
  getAllFields(): string[];
  
  /** Get warnings/issues found during analysis */
  getWarnings(): LineageWarning[];
}

/**
 * Warning or issue found during lineage analysis.
 */
export interface LineageWarning {
  /** Severity level */
  level: 'error' | 'warning' | 'info';
  
  /** Warning message */
  message: string;
  
  /** Line number (if applicable) */
  line?: number;
  
  /** Field name (if applicable) */
  field?: string;
  
  /** Suggestion for fixing */
  suggestion?: string;
}

// =============================================================================
// RE-EXPORTS FROM DOMAIN
// =============================================================================

// Implicit fields are defined in domain/fields
// Re-export for convenience
export {
  IMPLICIT_FIELDS,
  INTERNAL_FIELD_PREFIX,
  isImplicitField,
  isInternalField,
} from '@/entities/field';

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Configuration options for lineage analysis.
 */
export interface LineageConfig {
  /**
   * Commands to track for field lineage (allowlist).
   * Commands not in this list will be treated as pass-through (no field effects).
   * If not specified, defaults to DEFAULT_TRACKED_COMMANDS.
   */
  trackedCommands?: string[];

  /**
   * Optional source SPL string (used for heuristics like parsing lookup output fields
   * when the AST omits them).
   */
  source?: string;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Mapping of line numbers to field availability.
 */
export type FieldExistenceMap = Map<number, boolean>;

/**
 * Result of analyzing a single command's effect on fields.
 */
export interface CommandFieldEffect {
  /** Fields created by this command */
  creates: FieldCreation[];
  
  /** Fields modified by this command */
  modifies: FieldModification[];
  
  /** Fields consumed (read) by this command */
  consumes: string[];
  
  /** Fields dropped by this command */
  drops: FieldDrop[];
  
  /** Whether this command drops all fields not in a specific list */
  dropsAllExcept?: string[];
}

export interface FieldCreation {
  fieldName: string;
  dependsOn: string[];
  expression?: string;
  dataType?: FieldDataType;
  isMultivalue?: boolean;
  confidence: ConfidenceLevel;
  /** Line where this field is created (for multiline commands) */
  line?: number;
  /** Column where this field is created */
  column?: number;
}

export interface FieldModification {
  fieldName: string;
  dependsOn: string[];
  expression?: string;
}

export interface FieldDrop {
  fieldName: string;
  reason: 'explicit' | 'implicit' | 'aggregation';
}
