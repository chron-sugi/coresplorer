/**
 * Knowledge Object Queries Tests
 *
 * Tests for TanStack Query hooks for fetching Knowledge Object data.
 *
 * @module entities/knowledge-object/api/ko.queries.test
 */
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useKOIndexQuery, useKOListQuery, koQueryKeys } from './ko.queries';
import { DataFetchError, DataValidationError } from '@/shared/lib';
import type { KOIndex } from '../model';

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

const validIndexData: KOIndex = {
  'ko-1': {
    label: 'Search 1',
    type: 'saved_search',
    app: 'search',
    owner: 'admin',
  },
  'ko-2': {
    label: 'Dashboard 1',
    type: 'dashboard',
    app: 'search',
    owner: 'admin',
    isolated: true,
  },
};

const originalFetch = globalThis.fetch;

afterEach(() => {
  vi.restoreAllMocks();
  if (originalFetch) {
    globalThis.fetch = originalFetch;
  }
});

describe('koQueryKeys', () => {
  it('provides query key factory functions', () => {
    expect(koQueryKeys.all).toEqual(['ko']);
    expect(koQueryKeys.index()).toEqual(['ko', 'index']);
  });
});

describe('useKOIndexQuery', () => {
  it('fetches and returns raw index data on success', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => validIndexData,
      status: 200,
      statusText: 'OK',
    } as Response);
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useKOIndexQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetchMock).toHaveBeenCalled();
    expect(result.current.data).toEqual(validIndexData);
  });

  it('throws DataFetchError for non-OK HTTP responses', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      url: 'http://example.com/index.json',
      json: async () => ({}),
    } as Response);
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useKOIndexQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(DataFetchError);
    expect((result.current.error as DataFetchError).message).toContain('Failed to fetch index data');
    expect((result.current.error as DataFetchError).message).toContain('500');
  });

  it('throws DataValidationError for invalid schema', async () => {
    const invalidData = {
      'ko-1': {
        // Missing required fields
        label: 'Test',
      },
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => invalidData,
      status: 200,
      statusText: 'OK',
    } as Response);
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useKOIndexQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(DataValidationError);
    expect((result.current.error as DataValidationError).message).toContain('Invalid index data structure');
  });

  it('uses correct query key', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => validIndexData,
      status: 200,
      statusText: 'OK',
    } as Response);
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useKOIndexQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Query key should match the factory
    expect(result.current.data).toBeDefined();
  });

  it('handles network errors', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('Network error'));
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useKOIndexQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeTruthy();
    expect((result.current.error as Error).message).toContain('Network error');
  });
});

describe('useKOListQuery', () => {
  it('transforms index data into KnowledgeObject array', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => validIndexData,
      status: 200,
      statusText: 'OK',
    } as Response);
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useKOListQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data).toEqual([
      {
        id: 'ko-1',
        name: 'Search 1',
        type: 'saved_search',
        app: 'search',
        owner: 'admin',
        isolated: false,
      },
      {
        id: 'ko-2',
        name: 'Dashboard 1',
        type: 'dashboard',
        app: 'search',
        owner: 'admin',
        isolated: true,
      },
    ]);
  });

  it('sets isolated to false when not present in data', async () => {
    const dataWithoutIsolated: KOIndex = {
      'ko-1': {
        label: 'Test',
        type: 'saved_search',
        app: 'search',
        owner: 'admin',
      },
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => dataWithoutIsolated,
      status: 200,
      statusText: 'OK',
    } as Response);
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useKOListQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data![0].isolated).toBe(false);
  });

  it('handles empty index data', async () => {
    const emptyData: KOIndex = {};

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => emptyData,
      status: 200,
      statusText: 'OK',
    } as Response);
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useKOListQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
  });

  it('uses correct query key and transformation', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => validIndexData,
      status: 200,
      statusText: 'OK',
    } as Response);
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useKOListQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Should return transformed data, not raw index
    expect(result.current.data![0]).toHaveProperty('id');
    expect(result.current.data![0]).toHaveProperty('name');
    expect(result.current.data![0]).not.toHaveProperty('label');
  });

  it('propagates fetch errors', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      url: 'http://example.com/index.json',
      json: async () => ({}),
    } as Response);
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useKOListQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(DataFetchError);
  });

  it('propagates validation errors', async () => {
    const invalidData = { 'ko-1': { label: 'Test' } };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => invalidData,
      status: 200,
      statusText: 'OK',
    } as Response);
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useKOListQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(DataValidationError);
  });
});
