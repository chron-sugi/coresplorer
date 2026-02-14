import { describe, expect, it } from 'vitest';
import { IndexLineageDatasetSchema } from './index-lineage.schemas';

const validDataset = {
  version: '1.0.0',
  unknown_tokens: {
    sourcetype: '__unknown_sourcetype__',
    source: '__unknown_source__',
  },
  records: [
    {
      lineage_key: 'security-main-index|auth|__unknown_source__',
      index_id: 'security-main-index',
      index_label: 'Security Events',
      sourcetype: 'auth',
      source: '__unknown_source__',
      direct_dependent_count: 2,
      transitive_dependent_count: 10,
      terminal_count: 4,
      max_depth: 3,
    },
  ],
  paths: [
    {
      lineage_key: 'security-main-index|auth|__unknown_source__',
      index_id: 'security-main-index',
      source_object_id: 'failed_logins-security_ops-saved_search',
      source_object_type: 'saved_search',
      terminal_object_id: 'security_overview_dashboard-security_ops-dashboard',
      terminal_object_type: 'dashboard',
      path_node_ids: [
        'security-main-index',
        'failed_logins-security_ops-saved_search',
        'security_overview_dashboard-security_ops-dashboard',
      ],
      path_length: 2,
      cycle_detected: false,
    },
  ],
};

describe('IndexLineageDatasetSchema', () => {
  it('parses a valid dataset', () => {
    const parsed = IndexLineageDatasetSchema.parse(validDataset);
    expect(parsed.records).toHaveLength(1);
    expect(parsed.paths).toHaveLength(1);
  });

  it('accepts unknown token values', () => {
    const parseResult = IndexLineageDatasetSchema.safeParse(validDataset);
    expect(parseResult.success).toBe(true);
    if (parseResult.success) {
      expect(parseResult.data.unknown_tokens.sourcetype).toBe('__unknown_sourcetype__');
      expect(parseResult.data.unknown_tokens.source).toBe('__unknown_source__');
    }
  });

  it('fails when required record fields are missing', () => {
    const invalid = {
      ...validDataset,
      records: [
        {
          index_id: 'security-main-index',
        },
      ],
    };

    const parseResult = IndexLineageDatasetSchema.safeParse(invalid);
    expect(parseResult.success).toBe(false);
  });
});

