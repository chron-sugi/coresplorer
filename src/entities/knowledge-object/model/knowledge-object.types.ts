/**
 * Knowledge Object Entity Types
 *
 * Domain types for Splunk Knowledge Objects.
 * This is the canonical shape used throughout the application.
 *
 * @module entities/knowledge-object/model/knowledge-object.types
 */

import type { SplunkKoType } from './knowledge-object';

/**
 * A Splunk Knowledge Object (KO) domain entity.
 *
 * Represents items like saved searches, lookups, macros, dashboards, etc.
 * This is the transformed domain model - the raw API uses `label` which
 * gets mapped to `name` during transformation.
 */
export interface KnowledgeObject {
  id: string;
  name: string;
  type: SplunkKoType; // 'saved_search', 'lookup', 'macro', 'data_model', 'index', 'dashboard', 'event_type'
  app: string;
  owner: string;
  isolated: boolean;
  description?: string;
}
