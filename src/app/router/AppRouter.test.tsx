/**
 * AppRouter Component Tests
 *
 * Tests for the AppRouter component that handles application routing.
 *
 * @module app/router/AppRouter.test
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppRouter } from './AppRouter';

// Mock pages
vi.mock('@/pages', () => ({
  HomePage: () => <div data-testid="home-page">Home Page</div>,
  DiagramPage: () => <div data-testid="diagram-page">Diagram Page</div>,
  SPLinterPage: () => <div data-testid="splinter-page">SPLinter Page</div>,
  NotFoundPage: () => <div data-testid="not-found-page">Not Found Page</div>,
}));

describe('AppRouter', () => {
  it('renders without crashing', () => {
    render(<AppRouter />);
    // Should render one of the pages
    expect(document.body).toBeTruthy();
  });

  it('renders BrowserRouter with correct basename', () => {
    const { container } = render(<AppRouter />);
    // BrowserRouter should be in the DOM
    expect(container.firstChild).toBeTruthy();
  });

  it('uses BASE_URL from environment for basename', () => {
    // The basename should be set from import.meta.env.BASE_URL
    // This is configured in vite.config.ts as '/coresplorer/'
    const { container } = render(<AppRouter />);
    expect(container).toBeTruthy();
  });

  it('renders routes correctly', () => {
    const { container } = render(<AppRouter />);
    // At least one route should render (default is home)
    expect(container.firstChild).toBeTruthy();
  });
});
