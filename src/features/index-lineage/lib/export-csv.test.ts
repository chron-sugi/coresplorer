import { describe, expect, it } from 'vitest';
import { buildFlattenedLineageCsv } from './export-csv';

describe('buildFlattenedLineageCsv', () => {
  it('builds flattened one-row-per-path CSV output', () => {
    const rows = [
      {
        group_key: 'security-main-index|auth|__unknown_source__',
        group_by: 'index+sourcetype+source' as const,
        index_id: 'security-main-index',
        index_label: 'Security Events',
        sourcetype: 'auth',
        source: '__unknown_source__',
        direct_dependent_count: 2,
        transitive_dependent_count: 5,
        terminal_count: 2,
        max_depth: 3,
        member_lineage_keys: ['security-main-index|auth|__unknown_source__'],
      },
    ];

    const contextByGroupKey = new Map([
      [
        'security-main-index|auth|__unknown_source__',
        {
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
          relatedKOs: [],
          distinct_sourcetypes: ['auth'],
          distinct_sources: ['__unknown_source__'],
        },
      ],
    ]);

    const csv = buildFlattenedLineageCsv(rows, contextByGroupKey);

    expect(csv).toContain('group_key,group_by,index_id,index_label,sourcetype,source,lineage_key');
    expect(csv).toContain('security-main-index|auth|__unknown_source__');
    expect(csv).toContain(
      'security-main-index -> failed_logins-security_ops-saved_search -> security_overview_dashboard-security_ops-dashboard'
    );
  });

  it('only includes rows for visible grouped records', () => {
    const rows = [
      {
        group_key: 'security-main-index|*|*',
        group_by: 'index' as const,
        index_id: 'security-main-index',
        index_label: 'Security Events',
        sourcetype: '*',
        source: '*',
        direct_dependent_count: 2,
        transitive_dependent_count: 5,
        terminal_count: 2,
        max_depth: 3,
        member_lineage_keys: [
          'security-main-index|auth|__unknown_source__',
          'security-main-index|web|__unknown_source__',
        ],
      },
    ];

    const contextByGroupKey = new Map([
      [
        'security-main-index|*|*',
        {
          paths: [
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
          ],
          relatedKOs: [],
          distinct_sourcetypes: ['auth', 'web'],
          distinct_sources: ['__unknown_source__'],
        },
      ],
      [
        'network-main-index|*|*',
        {
          paths: [
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
          ],
          relatedKOs: [],
          distinct_sourcetypes: ['dns'],
          distinct_sources: ['__unknown_source__'],
        },
      ],
    ]);

    const csv = buildFlattenedLineageCsv(rows, contextByGroupKey);

    expect(csv).toContain('security-main-index|auth|__unknown_source__');
    expect(csv).not.toContain('network-main-index|dns|__unknown_source__');
  });
});
