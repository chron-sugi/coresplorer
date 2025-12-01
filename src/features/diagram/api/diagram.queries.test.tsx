import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { useDiagramGraphQuery } from './diagram.queries';
import { DiagramDataFetchError, DiagramValidationError } from '../diagram.errors';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const validGraph = {
  version: '1.0.0',
  nodes: [
    {
      id: 'node-1',
      label: 'Node One',
      type: 'saved_search',
      app: 'search',
      owner: 'admin',
      last_modified: '2024-01-01T00:00:00.000Z',
      edges: [{ source: 'node-1', target: 'node-2' }],
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

describe('useDiagramGraphQuery', () => {
  it('returns parsed graph data on success', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => validGraph,
      status: 200,
      statusText: 'OK',
    } as Response);
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useDiagramGraphQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchMock).toHaveBeenCalled();
    expect(result.current.data).toEqual(validGraph);
  });

  it('throws DiagramDataFetchError for non-OK responses', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
      url: 'http://example.com/graph.json',
      json: async () => ({}),
    } as Response);
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useDiagramGraphQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(DiagramDataFetchError);
    expect((result.current.error as DiagramDataFetchError).message).toContain('Failed to fetch diagram data');
  });

  it('throws DiagramValidationError for invalid schema', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ version: '1.0.0', nodes: [{ id: 'missing-fields' }] }),
      status: 200,
      statusText: 'OK',
    } as Response);
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useDiagramGraphQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(DiagramValidationError);
  });
});
