/**
 * Field Entity
 *
 * Domain entity for Splunk fields metadata.
 * Provides implicit field definitions and helpers.
 *
 * @module entities/field
 */
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

// Store exports
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
