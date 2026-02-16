import { describe, expect, it } from 'vitest';
import type { IndexLineageRecord } from '@/entities/index-lineage';
import type { LineageRecordContext } from './lineage-filters';
import { groupLineageRows } from './lineage-grouping';

const records: IndexLineageRecord[] = [
  {
    lineage_key: 'security-main-index|auth|source_a',
    index_id: 'security-main-index',
    index_label: 'Security Events',
    sourcetype: 'auth',
    source: 'source_a',
    direct_dependent_count: 1,
    transitive_dependent_count: 2,
    terminal_count: 1,
    max_depth: 2,
  },
  {
    lineage_key: 'security-main-index|auth|source_b',
    index_id: 'security-main-index',
    index_label: 'Security Events',
    sourcetype: 'auth',
    source: 'source_b',
    direct_dependent_count: 1,
    transitive_dependent_count: 2,
    terminal_count: 1,
    max_depth: 2,
  },
  {
    lineage_key: 'security-main-index|web|source_a',
    index_id: 'security-main-index',
    index_label: 'Security Events',
    sourcetype: 'web',
    source: 'source_a',
    direct_dependent_count: 1,
    transitive_dependent_count: 2,
    terminal_count: 1,
    max_depth: 1,
  },
];

const contextsByLineageKey = new Map<string, LineageRecordContext>([
  [
    'security-main-index|auth|source_a',
    {
      paths: [
        {
          lineage_key: 'security-main-index|auth|source_a',
          index_id: 'security-main-index',
          source_object_id: 'ss-1',
          source_object_type: 'saved_search',
          terminal_object_id: 'dash-1',
          terminal_object_type: 'dashboard',
          path_node_ids: ['security-main-index', 'ss-1', 'dash-1'],
          path_length: 2,
          cycle_detected: false,
        },
      ],
      relatedKOs: [
        {
          id: 'ss-1',
          name: 'Saved Search 1',
          type: 'saved_search',
          app: 'security_app',
          owner: 'admin',
          isolated: false,
        },
      ],
    },
  ],
  [
    'security-main-index|auth|source_b',
    {
      paths: [
        {
          lineage_key: 'security-main-index|auth|source_b',
          index_id: 'security-main-index',
          source_object_id: 'ss-2',
          source_object_type: 'saved_search',
          terminal_object_id: 'dash-1',
          terminal_object_type: 'dashboard',
          path_node_ids: ['security-main-index', 'ss-2', 'dash-1'],
          path_length: 2,
          cycle_detected: false,
        },
      ],
      relatedKOs: [
        {
          id: 'ss-2',
          name: 'Saved Search 2',
          type: 'saved_search',
          app: 'security_app',
          owner: 'admin',
          isolated: false,
        },
      ],
    },
  ],
  [
    'security-main-index|web|source_a',
    {
      paths: [
        {
          lineage_key: 'security-main-index|web|source_a',
          index_id: 'security-main-index',
          source_object_id: 'ss-1',
          source_object_type: 'saved_search',
          terminal_object_id: 'dash-2',
          terminal_object_type: 'dashboard',
          path_node_ids: ['security-main-index', 'ss-1', 'dash-2'],
          path_length: 1,
          cycle_detected: false,
        },
      ],
      relatedKOs: [
        {
          id: 'ss-1',
          name: 'Saved Search 1',
          type: 'saved_search',
          app: 'security_app',
          owner: 'admin',
          isolated: false,
        },
      ],
    },
  ],
]);

describe('lineage-grouping', () => {
  it('collapses by index and computes deduped counts', () => {
    const { rows, contextsByGroupKey } = groupLineageRows(records, contextsByLineageKey, 'index');

    expect(rows).toHaveLength(1);
    expect(rows[0].group_key).toBe('security-main-index|*|*');
    expect(rows[0].sourcetype).toBe('*');
    expect(rows[0].source).toBe('*');
    expect(rows[0].direct_dependent_count).toBe(2);
    expect(rows[0].transitive_dependent_count).toBe(4);
    expect(rows[0].terminal_count).toBe(2);
    expect(rows[0].max_depth).toBe(2);

    const context = contextsByGroupKey.get('security-main-index|*|*');
    expect(context?.distinct_sourcetypes).toEqual(['auth', 'web']);
    expect(context?.distinct_sources).toEqual(['source_a', 'source_b']);
  });

  it('splits by index+sourcetype', () => {
    const { rows } = groupLineageRows(records, contextsByLineageKey, 'index+sourcetype');

    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.group_key)).toEqual([
      'security-main-index|auth|*',
      'security-main-index|web|*',
    ]);
    expect(rows.find((row) => row.group_key === 'security-main-index|auth|*')?.source).toBe('*');
  });

  it('splits by index+source', () => {
    const { rows } = groupLineageRows(records, contextsByLineageKey, 'index+source');

    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.group_key)).toEqual([
      'security-main-index|*|source_a',
      'security-main-index|*|source_b',
    ]);
    expect(rows.find((row) => row.group_key === 'security-main-index|*|source_a')?.sourcetype).toBe('*');
  });

  it('matches full-key cardinality in index+sourcetype+source mode', () => {
    const { rows } = groupLineageRows(records, contextsByLineageKey, 'index+sourcetype+source');

    expect(rows).toHaveLength(records.length);
    expect(rows.map((row) => row.group_key)).toEqual(records.map((record) => record.lineage_key).sort());
  });
});
