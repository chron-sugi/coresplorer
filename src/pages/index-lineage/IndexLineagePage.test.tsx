import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RouterWrapper } from '@/test/utils/RouterWrapper';
import { IndexLineagePage } from './IndexLineagePage';
import { useIndexLineageQuery } from '@/entities/index-lineage';

vi.mock('@/widgets/layout', () => ({
  Layout: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>,
}));

vi.mock('@/entities/index-lineage', () => ({
  useIndexLineageQuery: vi.fn(),
}));

vi.mock('@/features/index-lineage', () => ({
  IndexLineageFilterBar: ({
    searchTerm,
    onSearchChange,
  }: {
    searchTerm: string;
    onSearchChange: (value: string) => void;
  }) => (
    <div data-testid="filter-bar">
      <input
        data-testid="lineage-search-input"
        value={searchTerm}
        onChange={(event) => onSearchChange(event.target.value)}
      />
    </div>
  ),
  IndexLineageTable: ({
    records,
    loading,
    error,
  }: {
    records: unknown[];
    loading: boolean;
    error: string | null;
  }) => (
    <div data-testid="lineage-table" data-loading={loading} data-error={error}>
      {records.length}
    </div>
  ),
  LineagePathPanel: () => <div data-testid="lineage-panel">panel</div>,
  buildFlattenedLineageCsv: vi.fn(() => 'lineage_key\n'),
  downloadCsv: vi.fn(),
}));

describe('IndexLineagePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useIndexLineageQuery).mockReturnValue({
      data: {
        version: '1.0.0',
        unknown_tokens: {
          sourcetype: '__unknown_sourcetype__',
          source: '__unknown_source__',
        },
        records: [],
        paths: [],
      },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useIndexLineageQuery>);
  });

  it('renders page content inside Layout', () => {
    render(
      <RouterWrapper>
        <IndexLineagePage />
      </RouterWrapper>
    );

    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByTestId('filter-bar')).toBeInTheDocument();
    expect(screen.getByTestId('lineage-table')).toBeInTheDocument();
    expect(screen.getByTestId('lineage-panel')).toBeInTheDocument();
  });

  it('passes loading state to table', () => {
    vi.mocked(useIndexLineageQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as unknown as ReturnType<typeof useIndexLineageQuery>);

    render(
      <RouterWrapper>
        <IndexLineagePage />
      </RouterWrapper>
    );

    expect(screen.getByTestId('lineage-table')).toHaveAttribute('data-loading', 'true');
  });
});
