import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { useNodeDetailsQuery } from './node-details.queries';
import { DiagramValidationError } from '../diagram.errors';

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

const validDetail = {
  id: 'node-success',
  name: 'Success Node',
  type: 'index',
  app: 'search',
  owner: 'admin',
  last_modified: '2024-01-01T00:00:00.000Z',
  description: 'valid detail payload',
  spl_code: 'index=main',
  relationships: {
    incoming: [],
    outgoing: [],
    upstream_count: 0,
    downstream_count: 0,
  },
};

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

describe('useNodeDetailsQuery', () => {
  it('returns validated node details when import succeeds', async () => {
    vi.mock('/data/nodes/details/node-success.json', () => ({ default: validDetail }), {
      virtual: true,
    });

    const { result } = renderHook(() => useNodeDetailsQuery('node-success'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(validDetail);
  });

  it('returns DiagramValidationError when schema is invalid', async () => {
    vi.mock(
      '/data/nodes/details/node-invalid.json',
      () => ({ default: { id: 'node-invalid', name: 'Missing fields' } }),
      { virtual: true },
    );

    const { result } = renderHook(() => useNodeDetailsQuery('node-invalid'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 3000 });
    expect(result.current.error).toBeInstanceOf(DiagramValidationError);
  });

  it('propagates import failures as generic errors', async () => {
    vi.mock(
      '/data/nodes/details/node-missing.json',
      () => {
        throw new Error('boom');
      },
      { virtual: true },
    );

    const { result } = renderHook(() => useNodeDetailsQuery('node-missing'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 3000 });
    expect(result.current.error?.message).toMatch(/Failed to load details for node node-missing/);
  });
});
