/**
 * Field Model Index
 *
 * @module entities/field/model
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
} from './implicit';

export type { ImplicitFieldInfo } from './implicit';
