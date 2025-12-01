/**
 * Knowledge Object Entity
 *
 * Domain entity for Splunk Knowledge Objects.
 * Single source of truth for type definitions, labels, icons, and styling.
 *
 * @module entities/knowledge-object
 */
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
  // Zod schemas
  IndexNodeSchema,
  IndexSchema,
} from './model';

export type { SplunkKoType, KnowledgeObject, IndexNode, KOIndex } from './model';
