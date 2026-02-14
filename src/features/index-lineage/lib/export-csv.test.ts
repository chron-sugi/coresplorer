import { describe, expect, it } from 'vitest';
import { buildFlattenedLineageCsv } from './export-csv';

describe('buildFlattenedLineageCsv', () => {
  it('builds flattened one-row-per-path CSV output', () => {
    const records = [
      {
        lineage_key: 'security-main-index|auth|__unknown_source__',
        index_id: 'security-main-index',
        index_label: 'Security Events',
        sourcetype: 'auth',
        source: '__unknown_source__',
        direct_dependent_count: 2,
        transitive_dependent_count: 5,
        terminal_count: 2,
        max_depth: 3,
      },
    ];

    const paths = [
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
    ];

    const csv = buildFlattenedLineageCsv(records, paths);

    expect(csv).toContain('lineage_key,index_id,index_label,sourcetype,source');
    expect(csv).toContain('security-main-index|auth|__unknown_source__');
    expect(csv).toContain('security-main-index -> failed_logins-security_ops-saved_search -> security_overview_dashboard-security_ops-dashboard');
  });

  it('only includes rows for filtered records', () => {
    const records = [
      {
        lineage_key: 'security-main-index|auth|__unknown_source__',
        index_id: 'security-main-index',
        index_label: 'Security Events',
        sourcetype: 'auth',
        source: '__unknown_source__',
        direct_dependent_count: 2,
        transitive_dependent_count: 5,
        terminal_count: 2,
        max_depth: 3,
      },
    ];

    const paths = [
      {
        lineage_key: 'security-main-index|auth|__unknown_source__',
        index_id: 'security-main-index',
        source_object_id: 'failed_logins-security_ops-saved_search',
        source_object_type: 'saved_search',
        terminal_object_id: 'security_overview_dashboard-security_ops-dashboard',
        terminal_object_type: 'dashboard',
        path_node_ids: ['security-main-index', 'failed_logins-security_ops-saved_search'],
        path_length: 1,
        cycle_detected: false,
      },
      {
        lineage_key: 'network-main-index|dns|__unknown_source__',
        index_id: 'network-main-index',
        source_object_id: 'dns_exfiltration-security_ops-saved_search',
        source_object_type: 'saved_search',
        terminal_object_id: 'threat_intelligence_dashboard-security_ops-dashboard',
        terminal_object_type: 'dashboard',
        path_node_ids: ['network-main-index', 'dns_exfiltration-security_ops-saved_search'],
        path_length: 1,
        cycle_detected: false,
      },
    ];

    const csv = buildFlattenedLineageCsv(records, paths);

    expect(csv).toContain('security-main-index|auth|__unknown_source__');
    expect(csv).not.toContain('network-main-index|dns|__unknown_source__');
  });
});

