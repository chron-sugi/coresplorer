/**
 * App Component Tests
 *
 * Tests for the root App component that composes the application shell.
 *
 * @module app/App.test
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

// Mock child components
vi.mock('./providers', () => ({
  AppProviders: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-providers">{children}</div>
  ),
}));

vi.mock('./router', () => ({
  AppRouter: () => <div data-testid="app-router">Router</div>,
}));

vi.mock('./error-boundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
  });

  it('renders ErrorBoundary as the outermost wrapper', () => {
    const { container } = render(<App />);
    const errorBoundary = container.querySelector('[data-testid="error-boundary"]');
    expect(errorBoundary).toBeInTheDocument();
    // ErrorBoundary should be the first child of the container
    expect(container.firstChild).toBe(errorBoundary);
  });

  it('renders AppProviders inside ErrorBoundary', () => {
    render(<App />);
    const errorBoundary = screen.getByTestId('error-boundary');
    const appProviders = screen.getByTestId('app-providers');
    expect(errorBoundary).toContainElement(appProviders);
  });

  it('renders AppRouter inside AppProviders', () => {
    render(<App />);
    const appProviders = screen.getByTestId('app-providers');
    const appRouter = screen.getByTestId('app-router');
    expect(appProviders).toContainElement(appRouter);
  });

  it('maintains correct component nesting order', () => {
    render(<App />);

    // Verify nesting: ErrorBoundary > AppProviders > AppRouter
    const errorBoundary = screen.getByTestId('error-boundary');
    const appProviders = screen.getByTestId('app-providers');
    const appRouter = screen.getByTestId('app-router');

    expect(errorBoundary).toBeInTheDocument();
    expect(errorBoundary).toContainElement(appProviders);
    expect(appProviders).toContainElement(appRouter);
  });
});
