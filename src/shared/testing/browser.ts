/**
 * MSW Browser Worker Setup
 *
 * Configures Mock Service Worker for browser-based API mocking during development.
 *
 * @module shared/testing/browser
 */
import { setupWorker } from 'msw/browser';

// Create empty worker - handlers can be added via worker.use()
export const worker = setupWorker();
