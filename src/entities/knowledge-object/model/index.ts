/**
 * Knowledge Object Model Index
 *
 * @module entities/knowledge-object/model
 */

// Type configuration (labels, icons, badges, colors)
export {
  KO_TYPE_CONFIG,
  getKoConfig,
  getKoLabel,
  getKoIcon,
  getKoBadgeClasses,
  getKoColor,
  isValidKoType,
  SPLUNK_KO_TYPES,
} from './knowledge-object';

export type { SplunkKoType } from './knowledge-object';

// Domain entity type
export type { KnowledgeObject } from './knowledge-object.types';

// Zod schemas for API validation
export { IndexNodeSchema, IndexSchema } from './knowledge-object.schemas';
export type { IndexNode, KOIndex } from './knowledge-object.schemas';
