/**
 * Badge Component
 *
 * Reusable badge component for labels, tags, counts, and status indicators.
 * Used across multiple features for consistent badge styling.
 *
 * @module shared/ui/badge
 */
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

/**
 * Badge variants using CVA
 *
 * Provides consistent styling for badges across the application.
 * Uses semantic tokens for themeable, accessible colors.
 */
export const badgeVariants = cva(
  "inline-flex items-center rounded font-medium border transition-colors",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground border-border",
        active: "bg-sky-600 text-white border-sky-500 shadow-md",
        warning: "bg-yellow-900/20 text-yellow-300/80 border-yellow-900/30",
        error: "bg-red-900/20 text-red-300/80 border-red-900/30",
        success: "bg-green-900/20 text-green-300/80 border-green-900/30",
        info: "bg-blue-900/20 text-blue-300/80 border-blue-900/30",
        secondary: "bg-violet-900/20 text-violet-300/80 border-violet-900/30",
        outline: "bg-transparent text-slate-300 border-slate-600",
      },
      size: {
        sm: "px-1 py-0 text-2xs min-h-[24px]",
        md: "px-1.5 py-0.5 text-xs min-h-[24px]",
        lg: "px-2 py-1 text-sm min-h-[24px]",
      },
      interactive: {
        true: "cursor-pointer hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      interactive: false,
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Optional icon to display before the badge text
   */
  icon?: React.ReactNode;
  /**
   * Badge content
   */
  children: React.ReactNode;
}

/**
 * Badge Component
 *
 * @example
 * ```tsx
 * <Badge variant="active">Active</Badge>
 * <Badge variant="warning" size="sm">Warning</Badge>
 * <Badge variant="info" interactive onClick={handleClick}>
 *   <IconComponent /> Info
 * </Badge>
 * ```
 */
export function Badge({
  className,
  variant,
  size,
  interactive,
  icon,
  children,
  ...props
}: BadgeProps) {
  const Component = interactive ? "button" : "span";

  return (
    <Component
      className={cn(badgeVariants({ variant, size, interactive }), className)}
      type={interactive ? "button" : undefined}
      {...(props as any)}
    >
      {icon && <span className="mr-1 inline-flex">{icon}</span>}
      {children}
    </Component>
  );
}
