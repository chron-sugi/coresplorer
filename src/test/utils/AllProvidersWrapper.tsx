import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';

interface AllProvidersProps {
  children: ReactNode;
  initialEntries?: string[];
  queryClient?: QueryClient;
}

/**
 * Test wrapper that provides all necessary providers for testing pages:
 * - React Query (QueryClientProvider)
 * - React Router (MemoryRouter)
 *
 * Use this for testing page components that need both routing and data fetching.
 *
 * @example
 * ```typescript
 * render(
 *   <AllProvidersWrapper initialEntries={['/diagram']}>
 *     <DiagramPage />
 *   </AllProvidersWrapper>
 * );
 * ```
 */
export function AllProvidersWrapper({
  children,
  initialEntries = ['/'],
  queryClient,
}: AllProvidersProps) {
  // Create a default query client if not provided
  const client =
    queryClient ||
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Disable retries in tests for faster failures
          gcTime: 0, // Disable cache to ensure fresh data per test
        },
      },
    });

  return (
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

/**
 * Creates a wrapper function for use with renderHook or render's wrapper option.
 * Provides React Query and React Router context.
 *
 * @example
 * ```typescript
 * render(<HomePage />, {
 *   wrapper: createAllProvidersWrapper(['/home']),
 * });
 * ```
 */
export function createAllProvidersWrapper(initialEntries: string[] = ['/']) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <AllProvidersWrapper
      initialEntries={initialEntries}
      queryClient={queryClient}
    >
      {children}
    </AllProvidersWrapper>
  );
}
