/**
 * AppProviders Component Tests
 *
 * Tests for the AppProviders component that composes all application providers.
 *
 * @module app/providers/AppProviders.test
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppProviders } from './AppProviders';

// Mock child providers
vi.mock('./QueryProvider', () => ({
  QueryProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="query-provider">{children}</div>
  ),
}));

vi.mock('@/shared/ui/tooltip', () => ({
  TooltipProvider: ({ children, delayDuration }: { children: React.ReactNode; delayDuration: number }) => (
    <div data-testid="tooltip-provider" data-delay={delayDuration}>
      {children}
    </div>
  ),
}));

describe('AppProviders', () => {
  it('renders children correctly', () => {
    render(
      <AppProviders>
        <div data-testid="child">Child content</div>
      </AppProviders>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('renders QueryProvider', () => {
    render(
      <AppProviders>
        <div>Content</div>
      </AppProviders>
    );

    expect(screen.getByTestId('query-provider')).toBeInTheDocument();
  });

  it('renders TooltipProvider', () => {
    render(
      <AppProviders>
        <div>Content</div>
      </AppProviders>
    );

    expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument();
  });

  it('nests providers in correct order: QueryProvider > TooltipProvider', () => {
    render(
      <AppProviders>
        <div data-testid="child">Content</div>
      </AppProviders>
    );

    const queryProvider = screen.getByTestId('query-provider');
    const tooltipProvider = screen.getByTestId('tooltip-provider');
    const child = screen.getByTestId('child');

    // QueryProvider should contain TooltipProvider
    expect(queryProvider).toContainElement(tooltipProvider);
    // TooltipProvider should contain the child
    expect(tooltipProvider).toContainElement(child);
  });

  it('configures TooltipProvider with correct delay duration', () => {
    render(
      <AppProviders>
        <div>Content</div>
      </AppProviders>
    );

    const tooltipProvider = screen.getByTestId('tooltip-provider');
    expect(tooltipProvider.getAttribute('data-delay')).toBe('300');
  });

  it('handles multiple children', () => {
    render(
      <AppProviders>
        <div data-testid="child1">First</div>
        <div data-testid="child2">Second</div>
      </AppProviders>
    );

    expect(screen.getByTestId('child1')).toBeInTheDocument();
    expect(screen.getByTestId('child2')).toBeInTheDocument();
  });

  it('passes children through all provider layers', () => {
    render(
      <AppProviders>
        <div data-testid="nested-child">
          <span>Deeply nested</span>
        </div>
      </AppProviders>
    );

    expect(screen.getByTestId('nested-child')).toBeInTheDocument();
    expect(screen.getByText('Deeply nested')).toBeInTheDocument();
  });
});
