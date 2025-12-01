/**
 * Entities Index
 *
 * Domain entities following Feature-Sliced Design.
 * These are cross-feature domain concepts used across the application.
 *
 * @module entities
 */

// Knowledge Object entity
export {
  // Primary API
  KO_TYPE_CONFIG,
  getKoConfig,
  getKoLabel,
  getKoIcon,
  getKoBadgeClasses,
  isValidKoType,
  // Backward compatibility (deprecated)
  SPLUNK_KO_TYPES,
  SPLUNK_KO_LABELS,
  SPLUNK_KO_ICONS,
} from './knowledge-object';

export type { SplunkKoType } from './knowledge-object';

// Field entity
export {
  IMPLICIT_FIELDS,
  ALWAYS_PRESENT_FIELDS,
  INTERNAL_FIELDS,
  METADATA_FIELDS,
  INTERNAL_FIELD_PREFIX,
  isImplicitField,
  isInternalField,
  getImplicitFieldInfo,
  getImplicitFieldNames,
} from './field';

export type { ImplicitFieldInfo } from './field';

// SPL entity
export {
  // Commands
  SPL_COMMANDS,
  getCommandInfo,
  getCommandsByCategory,
  getFieldCreatingCommands,
  commandDropsFields,
  // Functions
  SPL_FUNCTIONS,
  getFunctionInfo,
  getFunctionReturnType,
  getFunctionsByCategory,
  // Patterns
  SPL_PATTERNS,
  FIELD_PATTERNS,
  LINTER_PATTERNS,
  extractCommandName,
  isPipelineContinuation,
  // Linter
  lintSpl,
  getCommandsWithPerformanceRisk,
  LinterWarningSchema,
  LinterSeveritySchema,
} from './spl';

export type {
  CommandInfo,
  CommandCategory,
  PerformanceRisk,
  FunctionInfo,
  FunctionCategory,
  ParameterInfo,
  DataType,
  LinterWarning,
  LinterSeverity,
  LintOptions,
} from './spl';

// Snapshot entity
export {
  NodeTypeSchema,
  GraphEdgeSchema,
  GraphNodeSchema,
  GraphSchema,
  NodeDetailSchema,
  MetaSchema,
  parseGraphJson,
  parseNodeDetailJson,
  parseMetaJson,
} from './snapshot';

export type {
  NodeType,
  GraphEdge,
  GraphNode,
  Graph,
  NodeDetail,
  SnapshotMeta,
} from './snapshot';
