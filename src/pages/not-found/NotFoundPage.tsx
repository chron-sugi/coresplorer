/**
 * Not Found Page
 *
 * 404 error page displayed when users navigate to non-existent routes.
 *
 * Route: * (catch-all)
 *
 * @module pages/not-found/NotFoundPage
 */
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { Button } from '@/shared/ui/button';

/**
 * 404 Not Found error page
 *
 * Displayed when users navigate to non-existent routes. Provides navigation
 * options to return home or view the diagram, with a friendly error message.
 *
 * @returns Rendered 404 error page
 */
export function NotFoundPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-3">
          <h1 className="text-9xl font-bold text-slate-700">404</h1>
          <h2 className="text-2xl font-semibold text-slate-100">Page Not Found</h2>
          <p className="text-slate-400">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="default" asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/diagram">
              <Search className="mr-2 h-4 w-4" />
              View Diagram
            </Link>
          </Button>
        </div>

        <div className="pt-8 border-t border-slate-800">
          <p className="text-xs text-slate-500">
            If you believe this is an error, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
