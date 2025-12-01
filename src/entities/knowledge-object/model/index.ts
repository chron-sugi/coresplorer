/**
 * Knowledge Object Model Index
 *
 * @module entities/knowledge-object/model
 */

// Type configuration (labels, icons, badges)
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

// Domain entity type
export type { KnowledgeObject } from './knowledge-object.types';

// Zod schemas for API validation
export { IndexNodeSchema, IndexSchema } from './knowledge-object.schemas';
export type { IndexNode, KOIndex } from './knowledge-object.schemas';
