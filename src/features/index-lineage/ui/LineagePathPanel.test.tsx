import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LineagePathPanel } from './LineagePathPanel';

const selectedRecord = {
  lineage_key: 'security-main-index|auth|__unknown_source__',
  index_id: 'security-main-index',
  index_label: 'Security Events',
  sourcetype: 'auth',
  source: '__unknown_source__',
  direct_dependent_count: 2,
  transitive_dependent_count: 7,
  terminal_count: 3,
  max_depth: 4,
};

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

describe('LineagePathPanel', () => {
  it('shows placeholder when no lineage row is selected', () => {
    render(<LineagePathPanel selectedRecord={null} paths={[]} />);

    expect(screen.getByText(/select a lineage row/i)).toBeInTheDocument();
  });

  it('renders selected lineage paths', () => {
    render(<LineagePathPanel selectedRecord={selectedRecord} paths={paths} />);

    expect(screen.getByText(/security events \| auth/i)).toBeInTheDocument();
    expect(screen.getAllByText(/failed_logins-security_ops-saved_search/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/security_overview_dashboard-security_ops-dashboard/i).length).toBeGreaterThan(0);
  });
});
