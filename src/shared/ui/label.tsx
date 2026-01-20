/**
 * Label
 *
 * Accessible label component for form controls.
 *
 * @module shared/ui/label
 */
import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export interface LabelProps extends React.ComponentPropsWithoutRef<'label'> {}

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)}
      {...props}
    />
  );
}
