import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IndexLineageTable } from './IndexLineageTable';
import { RouterWrapper } from '@/test/utils/RouterWrapper';

const sampleRecords = [
  {
    lineage_key: 'security-main-index|auth|__unknown_source__',
    index_id: 'security-main-index',
    index_label: 'Security Events',
    sourcetype: 'auth',
    source: '__unknown_source__',
    direct_dependent_count: 2,
    transitive_dependent_count: 7,
    terminal_count: 3,
    max_depth: 4,
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
          selectedLineageKey={null}
          sortBy="index"
          sortDirection="asc"
          onSort={vi.fn()}
          onSelectLineageKey={vi.fn()}
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
          selectedLineageKey={null}
          sortBy="index"
          sortDirection="asc"
          onSort={vi.fn()}
          onSelectLineageKey={vi.fn()}
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
          selectedLineageKey={null}
          sortBy="index"
          sortDirection="asc"
          onSort={onSort}
          onSelectLineageKey={vi.fn()}
        />
      </RouterWrapper>
    );

    fireEvent.click(screen.getByRole('button', { name: /sourcetype/i }));
    expect(onSort).toHaveBeenCalledWith('sourcetype');
  });

  it('calls onSelectLineageKey when a row is clicked', () => {
    const onSelectLineageKey = vi.fn();
    render(
      <RouterWrapper>
        <IndexLineageTable
          records={sampleRecords}
          loading={false}
          error={null}
          selectedLineageKey={null}
          sortBy="index"
          sortDirection="asc"
          onSort={vi.fn()}
          onSelectLineageKey={onSelectLineageKey}
        />
      </RouterWrapper>
    );

    fireEvent.click(screen.getByRole('button', { name: /security events/i }));
    expect(onSelectLineageKey).toHaveBeenCalledWith('security-main-index|auth|__unknown_source__');
  });
});

