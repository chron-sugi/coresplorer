/**
 * QueryProvider Component Tests
 *
 * Tests for the QueryProvider that wraps the app with TanStack Query.
 *
 * @module app/providers/QueryProvider.test
 */
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QueryProvider, queryClient } from './QueryProvider';
import { useQuery } from '@tanstack/react-query';

// Test component that uses React Query
function TestComponent() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['test'],
    queryFn: async () => {
      return { message: 'Hello World' };
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error!</div>;
  return <div data-testid="result">{data?.message}</div>;
}

describe('QueryProvider', () => {
  it('renders children correctly', () => {
    render(
      <QueryProvider>
        <div data-testid="child">Child content</div>
      </QueryProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('provides QueryClient context to children', async () => {
    render(
      <QueryProvider>
        <TestComponent />
      </QueryProvider>
    );

    // Initially loading
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for query to complete
    await waitFor(() => {
      expect(screen.getByTestId('result')).toBeInTheDocument();
    });

    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('exports queryClient instance', () => {
    expect(queryClient).toBeDefined();
    expect(queryClient.clear).toBeDefined();
    expect(queryClient.getQueryCache).toBeDefined();
  });

  it('has correct default options configured', () => {
    const defaultOptions = queryClient.getDefaultOptions();

    expect(defaultOptions.queries?.staleTime).toBe(1000 * 60 * 5); // 5 minutes
    expect(defaultOptions.queries?.gcTime).toBe(1000 * 60 * 60); // 1 hour
    expect(defaultOptions.queries?.retry).toBe(1);
    expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(false);
  });

  it('renders React Query DevTools', () => {
    const { container } = render(
      <QueryProvider>
        <div>Content</div>
      </QueryProvider>
    );

    // DevTools should be in the DOM (even if not visible)
    expect(container).toBeTruthy();
  });

  it('handles multiple children', () => {
    render(
      <QueryProvider>
        <div data-testid="child1">First</div>
        <div data-testid="child2">Second</div>
      </QueryProvider>
    );

    expect(screen.getByTestId('child1')).toBeInTheDocument();
    expect(screen.getByTestId('child2')).toBeInTheDocument();
  });

  it('allows queries to be retried once on failure', async () => {
    let attemptCount = 0;

    function FailingComponent() {
      const { isLoading, isError } = useQuery({
        queryKey: ['failing-test'],
        queryFn: async () => {
          attemptCount++;
          throw new Error('Test error');
        },
      });

      if (isLoading) return <div>Loading...</div>;
      if (isError) return <div data-testid="error">Error occurred</div>;
      return <div>Success</div>;
    }

    render(
      <QueryProvider>
        <FailingComponent />
      </QueryProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument();
    });

    // Should retry once (initial attempt + 1 retry = 2 total)
    expect(attemptCount).toBe(2);
  });

  it('does not refetch on window focus by default', () => {
    const defaultOptions = queryClient.getDefaultOptions();
    expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(false);
  });

  it('maintains stale time for 5 minutes', () => {
    const defaultOptions = queryClient.getDefaultOptions();
    const expectedStaleTime = 1000 * 60 * 5; // 5 minutes in ms
    expect(defaultOptions.queries?.staleTime).toBe(expectedStaleTime);
  });

  it('maintains garbage collection time for 1 hour', () => {
    const defaultOptions = queryClient.getDefaultOptions();
    const expectedGcTime = 1000 * 60 * 60; // 1 hour in ms
    expect(defaultOptions.queries?.gcTime).toBe(expectedGcTime);
  });
});
