/**
 * App Router
 *
 * Main router component that sets up BrowserRouter with route definitions.
 *
 * @module app/router/AppRouter
 */
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { routes } from './routes';

function AppRoutes() {
  const element = useRoutes(routes);
  return element;
}

export function AppRouter() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppRoutes />
    </BrowserRouter>
  );
}
