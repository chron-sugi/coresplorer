import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock ResizeObserver for cmdk library
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

// Mock scrollIntoView for cmdk library
Element.prototype.scrollIntoView = vi.fn();
