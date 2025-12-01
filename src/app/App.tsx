/**
 * App Component
 *
 * Root component that composes providers with the router.
 * This is the main application shell.
 *
 * @module app/App
 */
import { AppProviders } from './providers';
import { AppRouter } from './router';
import { ErrorBoundary } from './error-boundary';

function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </ErrorBoundary>
  );
}

export default App;
