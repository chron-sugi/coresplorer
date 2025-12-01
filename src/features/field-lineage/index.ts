/**
 * Field Lineage Feature
 * 
 * Public API for tracking field origin, transformation, and usage
 * throughout an SPL search pipeline.
 * 
 * @example
 * ```typescript
 * import { parseSPL } from '@/entities/spl/lib/parser';
 * import { analyzeLineage } from '@/features/field-lineage';
 * 
 * const { ast } = parseSPL('index=main | eval user=lower(username) | stats count BY user');
 * const lineage = analyzeLineage(ast);
 * 
 * // Get field origin
 * const userOrigin = lineage.getFieldOrigin('user');
 * // { kind: 'created', line: 1, command: 'eval', ... }
 * 
 * // Check if field exists at a line
 * lineage.fieldExistsAt('user', 1);  // true (after eval)
 * ```
 * 
 * @module features/field-lineage
 */

// =============================================================================
// MAIN EXPORTS
// =============================================================================

export { analyzeLineage } from './lib/analyzer';

// =============================================================================
// HOOKS
// =============================================================================

export {
  useFieldLineage,
  useFieldInfo,
  useFieldsAtCursor,
} from './model/hooks/useFieldLineage';

// =============================================================================
// TYPES
// =============================================================================

export type {
  // Core types
  FieldLineage,
  FieldEvent,
  FieldEventKind,
  FieldDataType,
  ConfidenceLevel,
  
  // Pipeline state
  PipelineStageState,
  FieldState,
  
  // Query interface
  LineageIndex,
  LineageWarning,
  
  // Command effects
  CommandFieldEffect,
  FieldCreation,
  FieldModification,
  FieldDrop,
} from './model/field-lineage.types';

// =============================================================================
// CONSTANTS (re-exported from domain for convenience)
// =============================================================================

export {
  IMPLICIT_FIELDS,
  INTERNAL_FIELD_PREFIX,
  isImplicitField,
  isInternalField,
} from '@/entities/field';
