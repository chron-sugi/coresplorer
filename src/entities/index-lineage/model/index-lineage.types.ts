/**
 * Index Lineage Entity Types
 *
 * Domain types for index lineage records and paths.
 *
 * @module entities/index-lineage/model/index-lineage.types
 */

export interface IndexLineageUnknownTokens {
  sourcetype: string;
  source: string;
}

export interface IndexLineageRecord {
  lineage_key: string;
  index_id: string;
  index_label: string;
  sourcetype: string;
  source: string;
  direct_dependent_count: number;
  transitive_dependent_count: number;
  terminal_count: number;
  max_depth: number;
}

export interface IndexLineagePath {
  lineage_key: string;
  index_id: string;
  source_object_id: string;
  source_object_type: string;
  terminal_object_id: string;
  terminal_object_type: string;
  path_node_ids: string[];
  path_length: number;
  cycle_detected: boolean;
}

export interface IndexLineageDataset {
  version: string;
  unknown_tokens: IndexLineageUnknownTokens;
  records: IndexLineageRecord[];
  paths: IndexLineagePath[];
}

