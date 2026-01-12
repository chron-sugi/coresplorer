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
  getKoColor,
  isValidKoType,
  SPLUNK_KO_TYPES,
  // Zod schemas
  IndexNodeSchema,
  IndexSchema,
} from './model';

export type { SplunkKoType, KnowledgeObject, IndexNode, KOIndex } from './model';

// API - Data fetching
export { useKOIndexQuery, useKOListQuery, koQueryKeys } from './api';

// UI
export { KOActionButtons } from './ui/KOActionButtons';

// Lib
export { nodeHasSpl } from './lib/ko.utils';
