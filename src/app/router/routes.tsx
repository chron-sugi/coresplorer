/**
 * Route Definitions
 *
 * Centralized route configuration for the application.
 * All routes are defined here for easy maintenance.
 *
 * @module app/router/routes
 */
import { HomePage, DiagramPage, SPLinterPage, NotFoundPage, ReleaseNotesPage } from '@/pages';
import type { RouteObject } from 'react-router-dom';

/**
 * Application route definitions
 */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/release-notes',
    element: <ReleaseNotesPage />,
  },
  {
    path: '/splinter',
    element: <SPLinterPage />,
  },
  {
    path: '/diagram/:nodeId',
    element: <DiagramPage />,
  },
  {
    path: '/diagram',
    element: <DiagramPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];
