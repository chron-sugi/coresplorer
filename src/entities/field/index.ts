/**
 * Field Entity
 *
 * Domain entity for Splunk fields metadata.
 * Provides implicit field definitions, lineage analysis, and helpers.
 *
 * @module entities/field
 */

// =============================================================================
// IMPLICIT FIELD DEFINITIONS
// =============================================================================

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
} from './model';

export type { ImplicitFieldInfo } from './model';

// =============================================================================
// LINEAGE TYPES
// =============================================================================

export type {
  FieldLineage,
  FieldEvent,
  FieldEventKind,
  FieldDataType,
  ConfidenceLevel,
  PipelineStageState,
  FieldState,
  LineageIndex,
  LineageWarning,
  LineageConfig,
  FieldExistenceMap,
  CommandFieldEffect,
  FieldCreation,
  FieldModification,
  FieldDrop,
} from './model';

// =============================================================================
// LINEAGE ANALYSIS
// =============================================================================

export { analyzeLineage } from './lib/lineage/analyzer';

// =============================================================================
// LINEAGE HOOKS
// =============================================================================

export {
  useFieldLineage,
  useFieldInfo,
  useFieldsAtCursor,
} from './model/hooks/useFieldLineage';

// =============================================================================
// STORE
// =============================================================================

export {
  useLineageStore,
  selectLineageIndex,
  selectHoveredField,
  selectSelectedField,
  selectHighlightedLines,
  selectTooltipVisible,
  selectContextPanelOpen,
  selectActiveField,
  selectActiveFieldLineage,
} from './store';
