import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';

interface RouterWrapperProps {
  children: ReactNode;
  initialEntries?: string[];
}

/**
 * Test wrapper component that provides React Router context using MemoryRouter.
 * Use this for testing components that use routing hooks like useParams, useLocation, etc.
 *
 * @example
 * ```typescript
 * render(
 *   <RouterWrapper initialEntries={['/diagram/node-123']}>
 *     <DiagramPage />
 *   </RouterWrapper>
 * );
 * ```
 */
export function RouterWrapper({
  children,
  initialEntries = ['/'],
}: RouterWrapperProps) {
  return <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;
}

/**
 * Creates a wrapper function for use with renderHook or render's wrapper option.
 *
 * @example
 * ```typescript
 * const { result } = renderHook(() => useParams(), {
 *   wrapper: createRouterWrapper(['/diagram/node-123']),
 * });
 * ```
 */
export function createRouterWrapper(initialEntries: string[] = ['/']) {
  return ({ children }: { children: ReactNode }) => (
    <RouterWrapper initialEntries={initialEntries}>{children}</RouterWrapper>
  );
}
