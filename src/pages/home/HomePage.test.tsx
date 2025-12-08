import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { HomePage } from './HomePage';
import { RouterWrapper } from '@/test/utils/RouterWrapper';
import { useKOData, useKOFilters, useKOSort } from '@/features/ko-explorer';

// Mock the Layout widget
vi.mock('@/widgets/layout', () => ({
  Layout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">{children}</div>
  ),
}));

// Mock the KO Explorer feature components
vi.mock('@/features/ko-explorer', () => ({
  FilterBar: ({
    searchTerm,
    onSearchChange,
  }: {
    filterOptions: unknown;
    searchTerm: string;
    onSearchChange: (value: string) => void;
  }) => (
    <div data-testid="filter-bar" data-search-term={searchTerm}>
      <input
        data-testid="search-input"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  ),
  SummaryStrip: ({ kos }: { kos: unknown[] }) => (
    <div data-testid="summary-strip" data-ko-count={kos.length}>
      Summary: {kos.length} KOs
    </div>
  ),
  KOTable: ({
    kos,
    loading,
    error,
  }: {
    kos: unknown[];
    loading: boolean;
    error: string | null;
    sortBy: string;
    sortDirection: string;
    onSort: (column: string) => void;
  }) => (
    <div data-testid="ko-table" data-loading={loading} data-error={error}>
      {loading && <span>Loading...</span>}
      {error && <span>Error: {error}</span>}
      {!loading && !error && <span>{kos.length} items</span>}
    </div>
  ),
  useKOData: vi.fn(),
  useKOFilters: vi.fn(),
  useKOSort: vi.fn(),
  deriveFilterOptions: vi.fn(() => ({
    types: [],
    apps: [],
  })),
}));

const mockKOs = [
  { id: '1', name: 'macro1', type: 'macro', app: 'search' },
  { id: '2', name: 'report1', type: 'report', app: 'myapp' },
  { id: '3', name: 'dashboard1', type: 'dashboard', app: 'myapp' },
];

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    (useKOData as Mock).mockReturnValue({
      kos: mockKOs,
      loading: false,
      error: null,
    });

    (useKOFilters as Mock).mockReturnValue({
      filters: { searchTerm: '', type: null, app: null },
      setFilter: vi.fn(),
      filteredKOs: mockKOs,
    });

    (useKOSort as Mock).mockReturnValue({
      sortBy: 'name',
      sortDirection: 'asc',
      handleSort: vi.fn(),
      sortedKOs: mockKOs,
    });
  });

  describe('rendering', () => {
    it('renders within Layout component', () => {
      render(
        <RouterWrapper>
          <HomePage />
        </RouterWrapper>
      );

      expect(screen.getByTestId('layout')).toBeInTheDocument();
    });

    it('renders FilterBar component', () => {
      render(
        <RouterWrapper>
          <HomePage />
        </RouterWrapper>
      );

      expect(screen.getByTestId('filter-bar')).toBeInTheDocument();
    });

    it('renders SummaryStrip with KO count', () => {
      render(
        <RouterWrapper>
          <HomePage />
        </RouterWrapper>
      );

      const summaryStrip = screen.getByTestId('summary-strip');
      expect(summaryStrip).toBeInTheDocument();
      expect(summaryStrip).toHaveAttribute('data-ko-count', '3');
    });

    it('renders KOTable component', () => {
      render(
        <RouterWrapper>
          <HomePage />
        </RouterWrapper>
      );

      expect(screen.getByTestId('ko-table')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('passes loading state to KOTable', () => {
      (useKOData as Mock).mockReturnValue({
        kos: [],
        loading: true,
        error: null,
      });

      render(
        <RouterWrapper>
          <HomePage />
        </RouterWrapper>
      );

      const koTable = screen.getByTestId('ko-table');
      expect(koTable).toHaveAttribute('data-loading', 'true');
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('passes error state to KOTable', () => {
      (useKOData as Mock).mockReturnValue({
        kos: [],
        loading: false,
        error: 'Failed to fetch data',
      });

      render(
        <RouterWrapper>
          <HomePage />
        </RouterWrapper>
      );

      const koTable = screen.getByTestId('ko-table');
      expect(koTable).toHaveAttribute('data-error', 'Failed to fetch data');
      expect(screen.getByText('Error: Failed to fetch data')).toBeInTheDocument();
    });
  });

  describe('data flow', () => {
    it('uses sortedKOs from useKOSort for the table', () => {
      const sortedKOs = [mockKOs[2], mockKOs[0], mockKOs[1]]; // Different order
      (useKOSort as Mock).mockReturnValue({
        sortBy: 'name',
        sortDirection: 'desc',
        handleSort: vi.fn(),
        sortedKOs,
      });

      render(
        <RouterWrapper>
          <HomePage />
        </RouterWrapper>
      );

      expect(screen.getByText('3 items')).toBeInTheDocument();
    });

    it('passes original kos (not filtered) to SummaryStrip', () => {
      const filteredKOs = [mockKOs[0]]; // Only 1 item after filter
      (useKOFilters as Mock).mockReturnValue({
        filters: { searchTerm: 'macro', type: null, app: null },
        setFilter: vi.fn(),
        filteredKOs,
      });
      (useKOSort as Mock).mockReturnValue({
        sortBy: 'name',
        sortDirection: 'asc',
        handleSort: vi.fn(),
        sortedKOs: filteredKOs,
      });

      render(
        <RouterWrapper>
          <HomePage />
        </RouterWrapper>
      );

      // SummaryStrip should show total KOs (3), not filtered (1)
      const summaryStrip = screen.getByTestId('summary-strip');
      expect(summaryStrip).toHaveAttribute('data-ko-count', '3');
    });
  });

  describe('hook composition', () => {
    it('calls useKOData hook', () => {
      render(
        <RouterWrapper>
          <HomePage />
        </RouterWrapper>
      );

      expect(useKOData).toHaveBeenCalled();
    });

    it('passes kos from useKOData to useKOFilters', () => {
      render(
        <RouterWrapper>
          <HomePage />
        </RouterWrapper>
      );

      expect(useKOFilters).toHaveBeenCalledWith(mockKOs);
    });

    it('passes filteredKOs from useKOFilters to useKOSort', () => {
      const filteredKOs = [mockKOs[0], mockKOs[1]];
      (useKOFilters as Mock).mockReturnValue({
        filters: { searchTerm: '', type: null, app: null },
        setFilter: vi.fn(),
        filteredKOs,
      });

      render(
        <RouterWrapper>
          <HomePage />
        </RouterWrapper>
      );

      expect(useKOSort).toHaveBeenCalledWith(filteredKOs);
    });
  });

  describe('accessibility', () => {
    it('renders without crashing', () => {
      expect(() => {
        render(
          <RouterWrapper>
            <HomePage />
          </RouterWrapper>
        );
      }).not.toThrow();
    });
  });
});
