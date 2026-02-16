import { describe, expect, it } from 'vitest';
import type { KnowledgeObject } from '@/entities/knowledge-object';
import type { IndexLineagePath, IndexLineageRecord } from '@/entities/index-lineage';
import {
  buildLineageRecordContexts,
  deriveLineageFilterOptions,
  matchesLineageKoFilters,
  matchesLineageSearch,
} from './lineage-filters';

const record: IndexLineageRecord = {
  lineage_key: 'security-main-index|auth|__unknown_source__',
  index_id: 'security-main-index',
  index_label: 'Security Events',
  sourcetype: 'auth',
  source: '__unknown_source__',
  direct_dependent_count: 2,
  transitive_dependent_count: 5,
  terminal_count: 2,
  max_depth: 3,
};

const paths: IndexLineagePath[] = [
  {
    lineage_key: 'security-main-index|auth|__unknown_source__',
    index_id: 'security-main-index',
    source_object_id: 'failed_logins-security_ops-saved_search',
    source_object_type: 'saved_search',
    terminal_object_id: 'security_dashboard-security_ops-dashboard',
    terminal_object_type: 'dashboard',
    path_node_ids: [
      'security-main-index',
      'failed_logins-security_ops-saved_search',
      'security_dashboard-security_ops-dashboard',
    ],
    path_length: 2,
    cycle_detected: false,
  },
  {
    lineage_key: 'security-main-index|auth|__unknown_source__',
    index_id: 'security-main-index',
    source_object_id: 'auth_macro-security_ops-macro',
    source_object_type: 'macro',
    terminal_object_id: 'security_dashboard-security_ops-dashboard',
    terminal_object_type: 'dashboard',
    path_node_ids: [
      'security-main-index',
      'auth_macro-security_ops-macro',
      'security_dashboard-security_ops-dashboard',
    ],
    path_length: 2,
    cycle_detected: false,
  },
];

const relatedKos: KnowledgeObject[] = [
  {
    id: 'failed_logins-security_ops-saved_search',
    name: 'Failed Logins Search',
    type: 'saved_search',
    app: 'SecurityOps',
    owner: 'admin',
    isolated: false,
  },
  {
    id: 'security_dashboard-security_ops-dashboard',
    name: 'Security Dashboard',
    type: 'dashboard',
    app: 'SecurityOps',
    owner: 'sec_user',
    isolated: false,
  },
  {
    id: 'auth_macro-security_ops-macro',
    name: 'Auth Macro',
    type: 'macro',
    app: 'Helpers',
    owner: 'macro_owner',
    isolated: false,
  },
];

describe('lineage-filters', () => {
  it('builds lineage contexts with deduped related KOs and grouped paths', () => {
    const koById = new Map(relatedKos.map((ko) => [ko.id, ko]));
    const contexts = buildLineageRecordContexts(paths, koById);

    const context = contexts.get(record.lineage_key);
    expect(context).toBeDefined();
    expect(context?.paths).toHaveLength(2);
    expect(context?.relatedKOs).toHaveLength(3);
    expect(context?.relatedKOs.map((ko) => ko.id)).not.toContain('security-main-index');
  });

  it('derives sorted filter options from related KOs', () => {
    const koById = new Map(relatedKos.map((ko) => [ko.id, ko]));
    const contexts = buildLineageRecordContexts(paths, koById);
    const options = deriveLineageFilterOptions(contexts);

    expect(options.types).toEqual(['dashboard', 'macro', 'saved_search']);
    expect(options.apps).toEqual(['Helpers', 'SecurityOps']);
    expect(options.owners).toEqual(['admin', 'macro_owner', 'sec_user']);
  });

  it('applies KO filters using AND across categories on a single KO', () => {
    const koById = new Map(relatedKos.map((ko) => [ko.id, ko]));
    const contexts = buildLineageRecordContexts(paths, koById);
    const context = contexts.get(record.lineage_key);

    expect(
      matchesLineageKoFilters(context, {
        types: ['saved_search'],
        apps: ['SecurityOps'],
        owners: ['admin'],
      })
    ).toBe(true);

    expect(
      matchesLineageKoFilters(context, {
        types: ['saved_search'],
        apps: ['Helpers'],
        owners: [],
      })
    ).toBe(false);
  });

  it('matches search terms against related KO metadata', () => {
    const koById = new Map(relatedKos.map((ko) => [ko.id, ko]));
    const contexts = buildLineageRecordContexts(paths, koById);
    const context = contexts.get(record.lineage_key);

    expect(matchesLineageSearch(record, context, 'Security Dashboard')).toBe(true);
    expect(matchesLineageSearch(record, context, 'macro_owner')).toBe(true);
    expect(matchesLineageSearch(record, context, 'Saved Search')).toBe(true);
    expect(matchesLineageSearch(record, context, 'does-not-exist')).toBe(false);
  });

  it('matches collapsed sourcetype and source values in grouped contexts', () => {
    const koById = new Map(relatedKos.map((ko) => [ko.id, ko]));
    const contexts = buildLineageRecordContexts(paths, koById);
    const rawContext = contexts.get(record.lineage_key);
    const groupedContext = {
      paths: rawContext?.paths ?? [],
      relatedKOs: rawContext?.relatedKOs ?? [],
      distinct_sourcetypes: ['auth', 'web'],
      distinct_sources: ['/var/log/auth.log'],
    };

    const groupedRow = {
      group_key: 'security-main-index|*|*',
      index_id: 'security-main-index',
      index_label: 'Security Events',
      sourcetype: '*',
      source: '*',
      member_lineage_keys: ['security-main-index|auth|__unknown_source__'],
    };

    expect(matchesLineageSearch(groupedRow, groupedContext, 'web')).toBe(true);
    expect(matchesLineageSearch(groupedRow, groupedContext, '/var/log/auth.log')).toBe(true);
  });

  it('keeps records when no KO filters are active', () => {
    expect(
      matchesLineageKoFilters(undefined, {
        types: [],
        apps: [],
        owners: [],
      })
    ).toBe(true);
  });
});
