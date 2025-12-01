/**
 * Routes Configuration Tests
 *
 * Tests for the route definitions and configuration.
 *
 * @module app/router/routes.test
 */
import { describe, it, expect, vi } from 'vitest';
import { routes } from './routes';

// Mock page components
vi.mock('@/pages', () => ({
  HomePage: () => <div>Home</div>,
  DiagramPage: () => <div>Diagram</div>,
  SPLinterPage: () => <div>SPLinter</div>,
  NotFoundPage: () => <div>Not Found</div>,
}));

describe('routes', () => {
  it('exports an array of route objects', () => {
    expect(Array.isArray(routes)).toBe(true);
    expect(routes.length).toBeGreaterThan(0);
  });

  it('has a home route at root path', () => {
    const homeRoute = routes.find((route) => route.path === '/');
    expect(homeRoute).toBeDefined();
    expect(homeRoute?.element).toBeDefined();
  });

  it('has a splinter route', () => {
    const splinterRoute = routes.find((route) => route.path === '/splinter');
    expect(splinterRoute).toBeDefined();
    expect(splinterRoute?.element).toBeDefined();
  });

  it('has a diagram route with nodeId parameter', () => {
    const diagramWithIdRoute = routes.find((route) => route.path === '/diagram/:nodeId');
    expect(diagramWithIdRoute).toBeDefined();
    expect(diagramWithIdRoute?.element).toBeDefined();
  });

  it('has a diagram route without nodeId parameter', () => {
    const diagramRoute = routes.find((route) => route.path === '/diagram');
    expect(diagramRoute).toBeDefined();
    expect(diagramRoute?.element).toBeDefined();
  });

  it('has a catch-all route for 404 pages', () => {
    const notFoundRoute = routes.find((route) => route.path === '*');
    expect(notFoundRoute).toBeDefined();
    expect(notFoundRoute?.element).toBeDefined();
  });

  it('defines all required routes', () => {
    const paths = routes.map((route) => route.path);

    expect(paths).toContain('/');
    expect(paths).toContain('/splinter');
    expect(paths).toContain('/diagram/:nodeId');
    expect(paths).toContain('/diagram');
    expect(paths).toContain('*');
  });

  it('has exactly 5 routes defined', () => {
    // Home, SPLinter, Diagram with ID, Diagram without ID, Not Found
    expect(routes).toHaveLength(5);
  });

  it('all routes have valid structure', () => {
    routes.forEach((route) => {
      expect(route).toHaveProperty('path');
      expect(route).toHaveProperty('element');
      expect(typeof route.path).toBe('string');
    });
  });

  it('routes are ordered correctly with catch-all last', () => {
    const lastRoute = routes[routes.length - 1];
    expect(lastRoute.path).toBe('*');
  });
});
