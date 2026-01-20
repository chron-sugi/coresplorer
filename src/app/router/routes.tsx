/**
 * Route Definitions
 *
 * Centralized route configuration for the application.
 * All routes are defined here for easy maintenance.
 *
 * @module app/router/routes
 */
import { HomePage, DiagramPage, SPLinterPage, NotFoundPage, ReleaseNotesPage, LoginPage } from '@/pages';
import type { RouteObject } from 'react-router-dom';
import type { ReactElement } from 'react';
import { ProtectedRoute } from './ProtectedRoute';

const protect = (element: ReactElement) => (
  <ProtectedRoute>{element}</ProtectedRoute>
);

/**
 * Application route definitions
 */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: protect(<HomePage />),
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/release-notes',
    element: protect(<ReleaseNotesPage />),
  },
  {
    path: '/splinter',
    element: protect(<SPLinterPage />),
  },
  {
    path: '/diagram/:nodeId',
    element: protect(<DiagramPage />),
  },
  {
    path: '/diagram',
    element: protect(<DiagramPage />),
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];
