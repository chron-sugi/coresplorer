/**
 * Application bootstrap
 *
 * Entrypoint that mounts the React application and conditionally
 * starts development helpers such as MSW (Mock Service Worker).
 *
 * @module app/main
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'prismjs/themes/prism-tomorrow.css';
import './app/styles/index.css';
import App from './app/App';
import { preloadLookupSchemas } from '@/entities/lookup';

// Conditionally start MSW for browser mocking (development only)
async function enableMocking() {
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true') {
    const { worker } = await import('@/shared/testing/browser');
    return worker.start({
      onUnhandledRequest: 'bypass', // Don't warn for unhandled requests
    });
  }
}

enableMocking().then(() => {
  // Pre-load lookup schemas in background (non-blocking)
  // This populates the schema cache for inputlookup field lineage
  preloadLookupSchemas().catch((err) => {
    console.warn('Failed to pre-load lookup schemas:', err);
  });

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
