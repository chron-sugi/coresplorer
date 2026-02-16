import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IndexLineageTable } from './IndexLineageTable';
import { RouterWrapper } from '@/test/utils/RouterWrapper';
import type { GroupedLineageRow } from '../lib/lineage-grouping';

const sampleRecords: GroupedLineageRow[] = [
  {
    group_key: 'security-main-index|auth|__unknown_source__',
    group_by: 'index+sourcetype+source',
    index_id: 'security-main-index',
    index_label: 'Security Events',
    sourcetype: 'auth',
    source: '__unknown_source__',
    direct_dependent_count: 2,
    transitive_dependent_count: 7,
    terminal_count: 3,
    max_depth: 4,
    member_lineage_keys: ['security-main-index|auth|__unknown_source__'],
  },
];

describe('IndexLineageTable', () => {
  it('renders loading state', () => {
    render(
      <RouterWrapper>
        <IndexLineageTable
          records={[]}
          loading
          error={null}
          selectedGroupKey={null}
          sortBy="index"
          sortDirection="asc"
          onSort={vi.fn()}
          onSelectGroupKey={vi.fn()}
        />
      </RouterWrapper>
    );

    expect(screen.getByText(/loading index lineage/i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    render(
      <RouterWrapper>
        <IndexLineageTable
          records={[]}
          loading={false}
          error="Boom"
          selectedGroupKey={null}
          sortBy="index"
          sortDirection="asc"
          onSort={vi.fn()}
          onSelectGroupKey={vi.fn()}
        />
      </RouterWrapper>
    );

    expect(screen.getByText('Boom')).toBeInTheDocument();
  });

  it('calls onSort when a sortable header is clicked', () => {
    const onSort = vi.fn();
    render(
      <RouterWrapper>
        <IndexLineageTable
          records={sampleRecords}
          loading={false}
          error={null}
          selectedGroupKey={null}
          sortBy="index"
          sortDirection="asc"
          onSort={onSort}
          onSelectGroupKey={vi.fn()}
        />
      </RouterWrapper>
    );

    fireEvent.click(screen.getByRole('button', { name: /sourcetype/i }));
    expect(onSort).toHaveBeenCalledWith('sourcetype');
  });

  it('calls onSelectGroupKey when a row is clicked', () => {
    const onSelectGroupKey = vi.fn();
    render(
      <RouterWrapper>
        <IndexLineageTable
          records={sampleRecords}
          loading={false}
          error={null}
          selectedGroupKey={null}
          sortBy="index"
          sortDirection="asc"
          onSort={vi.fn()}
          onSelectGroupKey={onSelectGroupKey}
        />
      </RouterWrapper>
    );

    fireEvent.click(screen.getByRole('button', { name: /security events/i }));
    expect(onSelectGroupKey).toHaveBeenCalledWith('security-main-index|auth|__unknown_source__');
  });

  it('renders wildcard dimensions for grouped rows', () => {
    const groupedRows: GroupedLineageRow[] = [
      {
        ...sampleRecords[0],
        group_key: 'security-main-index|*|source_a',
        sourcetype: '*',
        source: 'source_a',
      },
    ];

    render(
      <RouterWrapper>
        <IndexLineageTable
          records={groupedRows}
          loading={false}
          error={null}
          selectedGroupKey={null}
          sortBy="index"
          sortDirection="asc"
          onSort={vi.fn()}
          onSelectGroupKey={vi.fn()}
        />
      </RouterWrapper>
    );

    expect(screen.getAllByText('*').length).toBeGreaterThan(0);
  });
});
