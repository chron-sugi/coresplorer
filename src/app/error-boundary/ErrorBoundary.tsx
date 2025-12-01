/**
 * Error Boundary Component
 *
 * Catches JavaScript errors in child components and displays
 * a fallback UI instead of crashing the entire app.
 *
 * @module app/error-boundary/ErrorBoundary
 */
import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Button } from '@/shared/ui/button';

// =============================================================================
// TYPES
// =============================================================================

interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: ReactNode;
  /** Optional fallback UI to show on error */
  fallback?: ReactNode;
  /** Optional callback when error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Error Boundary that catches errors in its child component tree.
 *
 * @example
 * ```tsx
 * <ErrorBoundary fallback={<div>Something went wrong</div>}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call optional onError callback
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="space-y-3">
              <h1 className="text-6xl font-bold text-red-500">Oops!</h1>
              <h2 className="text-xl font-semibold text-slate-100">
                Something went wrong
              </h2>
              <p className="text-slate-400">
                An unexpected error occurred. Please try again or contact support if the
                problem persists.
              </p>
            </div>

            {this.state.error && (
              <details className="text-left bg-slate-900 rounded-lg p-4 text-sm">
                <summary className="text-slate-400 cursor-pointer hover:text-slate-300">
                  Error details
                </summary>
                <pre className="mt-2 text-red-400 whitespace-pre-wrap overflow-auto max-h-40">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="default" onClick={this.handleReset}>
                Try Again
              </Button>
              <Button variant="outline" onClick={() => (window.location.href = '/')}>
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
