import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { HomePage } from './HomePage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { useFilterStore } from '@/features/ko-explorer/model/store/useFilterStore';
import { useSortStore } from '@/features/ko-explorer/model/store/useSortStore';
import { mockKOList } from '@/test/fixtures/page-mocks';
import {
  xssVectors,
  sqlInjectionVectors,
  unicodeVectors,
} from '@/test/fixtures/security-fixtures';
import type { KOIndex } from '@/entities/knowledge-object';

// Mock child components to speed up tests
vi.mock('@/widgets/layout', () => ({
  Layout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">
      <main>{children}</main>
    </div>
  ),
}));

vi.mock('@/features/ko-explorer/ui/SummaryStrip', () => ({
  SummaryStrip: () => <div data-testid="summary-strip">Summary</div>,
}));

vi.mock('@/features/ko-explorer/ui/FilterBar', () => ({
  FilterBar: ({ clearFilters }: { clearFilters: () => void }) => (
    <div data-testid="filter-bar">
      <button onClick={clearFilters} data-testid="clear-filters">
        Clear Filters
      </button>
    </div>
  ),
}));

vi.mock('@/features/ko-explorer/ui/KOTable', () => ({
  KOTable: ({
    kos,
    loading,
    error,
    onSort,
  }: {
    kos: unknown[];
    loading: boolean;
    error: string | null;
    onSort: (column: string) => void;
  }) => (
    <div data-testid="ko-table">
      {loading && <div data-testid="loading">Loading...</div>}
      {error && <div data-testid="error">{error}</div>}
      {!loading && !error && (
        <>
          <div data-testid="ko-count">{kos.length} items</div>
          <button onClick={() => onSort('name')} data-testid="sort-by-name">
            Sort by Name
          </button>
        </>
      )}
    </div>
  ),
}));

// Convert mock KO list to index format
const mockIndexData: KOIndex = mockKOList.reduce((acc, ko) => {
  acc[ko.id] = {
    label: ko.name,
    type: ko.type,
    app: ko.app,
    owner: ko.owner,
    isolated: ko.isolated,
  };
  return acc;
}, {} as KOIndex);

// Setup MSW server
const server = setupServer(
  http.get('/index.json', () => {
    return HttpResponse.json(mockIndexData);
  })
);

// Helper to create test wrapper
function createTestWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('HomePage', () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  beforeEach(() => {
    // Reset stores to initial state
    useFilterStore.getState().clearFilters();
    useSortStore.getState().reset();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  describe('rendering', () => {
    it('renders Layout component', async () => {
      render(<HomePage />, { wrapper: createTestWrapper() });

      expect(screen.getByTestId('layout')).toBeInTheDocument();
    });

    it('renders page title "Knowledge Objects"', () => {
      render(<HomePage />, { wrapper: createTestWrapper() });

      expect(screen.getByText('Knowledge Objects')).toBeInTheDocument();
    });

    it('renders SummaryStrip component', async () => {
      render(<HomePage />, { wrapper: createTestWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('summary-strip')).toBeInTheDocument();
      });
    });

    it('renders FilterBar component', async () => {
      render(<HomePage />, { wrapper: createTestWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('filter-bar')).toBeInTheDocument();
      });
    });

    it('renders KOTable component', async () => {
      render(<HomePage />, { wrapper: createTestWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('ko-table')).toBeInTheDocument();
      });
    });
  });

  describe('integration: data loading', () => {
    it('loads and displays KO data from API', async () => {
      render(<HomePage />, { wrapper: createTestWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('ko-count')).toHaveTextContent('5 items');
      });
    });

    it('shows loading state initially', () => {
      render(<HomePage />, { wrapper: createTestWrapper() });

      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('handles API error gracefully', async () => {
      server.use(
        http.get('/index.json', () => {
          return HttpResponse.error();
        })
      );

      render(<HomePage />, { wrapper: createTestWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
      });
    });

    it('handles 404 response', async () => {
      server.use(
        http.get('/index.json', () => {
          return new HttpResponse(null, { status: 404 });
        })
      );

      render(<HomePage />, { wrapper: createTestWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
      });
    });

    it('handles malformed JSON response', async () => {
      server.use(
        http.get('/index.json', () => {
          return new HttpResponse('invalid json{{{', {
            headers: { 'Content-Type': 'application/json' },
          });
        })
      );

      render(<HomePage />, { wrapper: createTestWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
      });
    });
  });

  describe('integration: filtering', () => {
    it('filters by search term', async () => {
      render(<HomePage />, { wrapper: createTestWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('ko-count')).toHaveTextContent('5 items');
      });

      // Set search filter via store
      useFilterStore.getState().setSearchTerm('dashboard');

      await waitFor(() => {
        expect(screen.getByTestId('ko-count')).toHaveTextContent('1 items');
      });
    });

    it('filters by type', async () => {
      render(<HomePage />, { wrapper: createTestWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('ko-count')).toHaveTextContent('5 items');
      });

      // Set type filter via store
      useFilterStore.getState().setTypes(['dashboard']);

      await waitFor(() => {
        expect(screen.getByTestId('ko-count')).toHaveTextContent('1 items');
      });
    });

    it('filters by app', async () => {
      render(<HomePage />, { wrapper: createTestWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('ko-count')).toHaveTextContent('5 items');
      });

      // Set app filter via store
      useFilterStore.getState().setApps(['search']);

      await waitFor(() => {
        expect(screen.getByTestId('ko-count')).toHaveTextContent('3 items');
      });
    });

    it('filters by owner', async () => {
      render(<HomePage />, { wrapper: createTestWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('ko-count')).toHaveTextContent('5 items');
      });

      // Set owner filter via store
      useFilterStore.getState().setOwners(['admin']);

      await waitFor(() => {
        expect(screen.getByTestId('ko-count')).toHaveTextContent('3 items');
      });
    });

    it('combines multiple filters (AND logic)', async () => {
      render(<HomePage />, { wrapper: createTestWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('ko-count')).toHaveTextContent('5 items');
      });

      // Set multiple filters via store
      useFilterStore.getState().setApps(['search']);
      useFilterStore.getState().setOwners(['admin']);

      await waitFor(() => {
        expect(screen.getByTestId('ko-count')).toHaveTextContent('2 items');
      });
    });

    it('clears filters when clearFilters is called', async () => {
      render(<HomePage />, { wrapper: createTestWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('ko-count')).toHaveTextContent('5 items');
      });

      // Set filters
      useFilterStore.getState().setSearchTerm('dashboard');

      await waitFor(() => {
        expect(screen.getByTestId('ko-count')).toHaveTextContent('1 items');
      });

      // Clear filters
      useFilterStore.getState().clearFilters();

      await waitFor(() => {
        expect(screen.getByTestId('ko-count')).toHaveTextContent('5 items');
      });
    });
  });

  describe('integration: sorting', () => {
    it('sorts by name ascending by default', async () => {
      render(<HomePage />, { wrapper: createTestWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('ko-count')).toHaveTextContent('5 items');
      });

      // Verify default sort state
      expect(useSortStore.getState().sortBy).toBe('name');
      expect(useSortStore.getState().sortDirection).toBe('asc');
    });

    it('toggles sort direction when clicking same column', async () => {
      render(<HomePage />, { wrapper: createTestWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('ko-count')).toHaveTextContent('5 items');
      });

      // Initial sort
      expect(useSortStore.getState().sortDirection).toBe('asc');

      // Toggle direction
      useSortStore.getState().handleSort('name');

      await waitFor(() => {
        expect(useSortStore.getState().sortDirection).toBe('desc');
      });
    });

    it('resets to ascending when sorting by new column', async () => {
      render(<HomePage />, { wrapper: createTestWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('ko-count')).toHaveTextContent('5 items');
      });

      // Set to descending first
      useSortStore.getState().handleSort('name');

      await waitFor(() => {
        expect(useSortStore.getState().sortDirection).toBe('desc');
      });

      // Sort by different column
      useSortStore.getState().handleSort('type');

      await waitFor(() => {
        expect(useSortStore.getState().sortBy).toBe('type');
        expect(useSortStore.getState().sortDirection).toBe('asc');
      });
    });
  });

  describe('security: XSS in search filter', () => {
    it('safely handles script tag in search term', async () => {
      render(<HomePage />, { wrapper: createTestWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('ko-count')).toHaveTextContent('5 items');
      });

      // Set XSS vector as search term
      useFilterStore.getState().setSearchTerm(xssVectors.scriptTag);

      // Should not execute script
      expect(document.scripts.length).toBe(0);

      // Should filter safely (no matches expected)
      await waitFor(() => {
        expect(screen.getByTestId('ko-count')).toHaveTextContent('0 items');
      });
    });

    it('safely handles img onerror in search term', async () => {
      render(<HomePage />, { wrapper: createTestWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('ko-count')).toHaveTextContent('5 items');
      });

      useFilterStore.getState().setSearchTerm(xssVectors.imgOnError);

      await waitFor(() => {
        expect(screen.getByTestId('ko-count')).toHaveTextContent('0 items');
      });
    });
  });

  describe('security: injection attempts', () => {
    it('treats SQL injection as literal search string', async () => {
      render(<HomePage />, { wrapper: createTestWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('ko-count')).toHaveTextContent('5 items');
      });

      useFilterStore.getState().setSearchTerm(sqlInjectionVectors.orTrue);

      // Should search literally, not execute SQL
      await waitFor(() => {
        expect(screen.getByTestId('ko-count')).toHaveTextContent('0 items');
      });
    });
  });

  describe('security: Unicode edge cases', () => {
    it('handles zero-width characters in search', async () => {
      render(<HomePage />, { wrapper: createTestWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('ko-count')).toHaveTextContent('5 items');
      });

      useFilterStore.getState().setSearchTerm(unicodeVectors.zeroWidth);

      await waitFor(() => {
        expect(screen.getByTestId('ko-count')).toHaveTextContent('0 items');
      });
    });

    it('handles RTL override characters in search', async () => {
      render(<HomePage />, { wrapper: createTestWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('ko-count')).toHaveTextContent('5 items');
      });

      useFilterStore.getState().setSearchTerm(unicodeVectors.rtlOverride);

      await waitFor(() => {
        expect(screen.getByTestId('ko-count')).toHaveTextContent('0 items');
      });
    });

    it('handles emoji in search', async () => {
      render(<HomePage />, { wrapper: createTestWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('ko-count')).toHaveTextContent('5 items');
      });

      useFilterStore.getState().setSearchTerm(unicodeVectors.emoji);

      await waitFor(() => {
        expect(screen.getByTestId('ko-count')).toHaveTextContent('0 items');
      });
    });
  });

  describe('performance: large datasets', () => {
    it('handles 1000+ items efficiently', async () => {
      // Create large dataset
      const largeIndex: KOIndex = {};
      for (let i = 0; i < 1000; i++) {
        largeIndex[`ko-${i}`] = {
          label: `Knowledge Object ${i}`,
          type: i % 5 === 0 ? 'dashboard' : 'alert',
          app: i % 3 === 0 ? 'search' : 'analytics',
          owner: i % 2 === 0 ? 'admin' : 'user',
          isolated: false,
        };
      }

      server.use(
        http.get('/index.json', () => {
          return HttpResponse.json(largeIndex);
        })
      );

      render(<HomePage />, { wrapper: createTestWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('ko-count')).toHaveTextContent('1000 items');
      });

      // Apply filter and ensure it's still fast
      useFilterStore.getState().setTypes(['dashboard']);

      await waitFor(() => {
        expect(screen.getByTestId('ko-count')).toHaveTextContent('200 items');
      });
    });
  });

  describe('error resilience: invalid data', () => {
    it('handles empty index gracefully', async () => {
      server.use(
        http.get('/index.json', () => {
          return HttpResponse.json({});
        })
      );

      render(<HomePage />, { wrapper: createTestWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('ko-count')).toHaveTextContent('0 items');
      });
    });

    it('handles index with invalid node structure', async () => {
      server.use(
        http.get('/index.json', () => {
          return HttpResponse.json({
            'invalid-node': {
              // Missing required fields
              label: null,
            },
          });
        })
      );

      render(<HomePage />, { wrapper: createTestWrapper() });

      // Should show error due to validation failure
      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
      });
    });

    it('handles corrupted filter store state', async () => {
      render(<HomePage />, { wrapper: createTestWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('ko-count')).toHaveTextContent('5 items');
      });

      // Corrupt filter state
      useFilterStore.setState({ searchTerm: null as any });

      // Should still render without crashing
      expect(screen.getByTestId('ko-table')).toBeInTheDocument();
    });

    it('handles corrupted sort store state', async () => {
      render(<HomePage />, { wrapper: createTestWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('ko-count')).toHaveTextContent('5 items');
      });

      // Corrupt sort state
      useSortStore.setState({ sortBy: 'invalid-column' as any });

      // Should still render without crashing
      expect(screen.getByTestId('ko-table')).toBeInTheDocument();
    });
  });
});
