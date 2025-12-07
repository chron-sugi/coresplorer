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

/**
 * Base props shared by all Badge variants
 */
type BadgeBaseProps = VariantProps<typeof badgeVariants> & {
  /** Optional icon to display before the badge text */
  icon?: React.ReactNode;
  /** Badge content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
};

/**
 * Props when Badge is interactive (renders as button)
 */
type BadgeAsButton = BadgeBaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BadgeBaseProps> & {
    interactive: true;
  };

/**
 * Props when Badge is non-interactive (renders as span)
 */
type BadgeAsSpan = BadgeBaseProps &
  Omit<React.HTMLAttributes<HTMLSpanElement>, keyof BadgeBaseProps> & {
    interactive?: false | null;
  };

/**
 * Discriminated union type for Badge props
 */
export type BadgeProps = BadgeAsButton | BadgeAsSpan;

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
export function Badge(props: BadgeProps): React.JSX.Element {
  const { className, variant, size, interactive, icon, children, ...restProps } = props;
  const badgeClassName = cn(badgeVariants({ variant, size, interactive }), className);
  const iconElement = icon ? <span className="mr-1 inline-flex">{icon}</span> : null;

  if (interactive) {
    // Narrow to button props
    const buttonProps = restProps as Omit<BadgeAsButton, keyof BadgeBaseProps | 'interactive'>;
    return (
      <button
        type="button"
        className={badgeClassName}
        {...buttonProps}
      >
        {iconElement}
        {children}
      </button>
    );
  }

  // Narrow to span props
  const spanProps = restProps as Omit<BadgeAsSpan, keyof BadgeBaseProps | 'interactive'>;
  return (
    <span className={badgeClassName} {...spanProps}>
      {iconElement}
      {children}
    </span>
  );
}
