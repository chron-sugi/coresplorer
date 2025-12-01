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
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
