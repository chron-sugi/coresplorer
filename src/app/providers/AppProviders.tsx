/**
 * App Providers
 *
 * Composes all application providers in the correct order.
 * This is the single place where provider nesting is managed.
 *
 * @module app/providers/AppProviders
 */
import { TooltipProvider } from '@/shared/ui/tooltip';
import { QueryProvider } from './QueryProvider';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <TooltipProvider delayDuration={300}>
        {children}
      </TooltipProvider>
    </QueryProvider>
  );
}
