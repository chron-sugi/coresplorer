/**
 * useKOData Hook Tests
 *
 * Tests for the useKOData hook that fetches Knowledge Object data.
 *
 * @module features/ko-explorer/model/hooks/useKOData.test
 */
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useKOData } from './useKOData';
import type { KOIndex } from '@/entities/knowledge-object';

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

const mockIndexData: KOIndex = {
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
    owner: 'user1',
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

describe('useKOData', () => {
  it('returns empty array and loading state initially', () => {
    const fetchMock = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => mockIndexData,
              }),
            100
          )
        )
    );
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useKOData(), {
      wrapper: createWrapper(),
    });

    expect(result.current.kos).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('returns knowledge objects on successful fetch', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockIndexData,
      status: 200,
      statusText: 'OK',
    } as Response);
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useKOData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.kos).toHaveLength(2);
    expect(result.current.kos[0]).toEqual({
      id: 'ko-1',
      name: 'Search 1',
      type: 'saved_search',
      app: 'search',
      owner: 'admin',
      isolated: false,
    });
    expect(result.current.kos[1]).toEqual({
      id: 'ko-2',
      name: 'Dashboard 1',
      type: 'dashboard',
      app: 'search',
      owner: 'user1',
      isolated: true,
    });
    expect(result.current.error).toBeNull();
  });

  it('returns error message on fetch failure', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      url: 'http://example.com/index.json',
      json: async () => ({}),
    } as Response);
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useKOData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.kos).toEqual([]);
    expect(result.current.error).toBeTruthy();
    expect(result.current.error).toContain('Failed to fetch index data');
  });

  it('returns error message for validation errors', async () => {
    const invalidData = {
      'ko-1': {
        label: 'Test',
        // Missing required fields
      },
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => invalidData,
      status: 200,
      statusText: 'OK',
    } as Response);
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useKOData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.kos).toEqual([]);
    expect(result.current.error).toBeTruthy();
    expect(result.current.error).toContain('Invalid index data structure');
  });

  it('provides refetch function', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockIndexData,
      status: 200,
      statusText: 'OK',
    } as Response);
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useKOData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Call refetch
    result.current.refetch();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });

  it('handles empty data gracefully', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
      status: 200,
      statusText: 'OK',
    } as Response);
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useKOData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.kos).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('converts Error objects to error strings', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('Custom error message'));
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useKOData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Custom error message');
  });

  it('handles non-Error objects as unknown errors', async () => {
    const fetchMock = vi.fn().mockRejectedValue('String error');
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useKOData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Unknown error');
  });
});
