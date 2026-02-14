import { describe, expect, it, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useIndexLineageQuery } from './index-lineage.queries';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const mockDataset = {
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
      direct_dependent_count: 1,
      transitive_dependent_count: 4,
      terminal_count: 2,
      max_depth: 2,
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

const originalFetch = globalThis.fetch;

afterEach(() => {
  vi.restoreAllMocks();
  if (originalFetch) {
    globalThis.fetch = originalFetch;
  }
});

describe('useIndexLineageQuery', () => {
  it('returns lineage data on successful fetch', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockDataset,
      } as Response)
    );

    const { result } = renderHook(() => useIndexLineageQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data?.records).toHaveLength(1);
    expect(result.current.data?.paths).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it('returns a DataValidationError for invalid payload shape', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({ invalid: true }),
      } as Response)
    );

    const { result } = renderHook(() => useIndexLineageQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toContain('Invalid index lineage data structure');
  });

  it('returns a DataFetchError for HTTP failure responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        url: 'http://example.com/data/index_lineage.json',
        json: async () => ({}),
      } as Response)
    );

    const { result } = renderHook(() => useIndexLineageQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect((result.current.error as Error).message).toContain('Failed to fetch index lineage data');
  });
});

