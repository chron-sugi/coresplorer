/**
 * Keyboard shortcut badge variant definitions
 *
 * @module shared/ui/kbd.variants
 */
import { cva, type VariantProps } from "class-variance-authority";

/**
 * Keyboard shortcut badge variants
 * Used for displaying keyboard shortcuts in button corners
 */
export const kbdVariants = cva(
  "pointer-events-none select-none items-center gap-1 rounded border font-mono text-2xs font-medium",
  {
    variants: {
      position: {
        "top-right": "absolute right-1.5 top-1.5",
        "top-left": "absolute left-1.5 top-1.5",
        inline: "inline-flex"
      },
      variant: {
        default: "border-slate-600 bg-slate-700 text-slate-400",
        primary: "border-sky-600 bg-sky-700 text-sky-300"
      },
      size: {
        sm: "h-4 px-1 text-3xs",
        md: "h-5 px-1.5",
        lg: "h-6 px-2 text-xs"
      },
      responsive: {
        true: "hidden sm:flex",
        false: "flex"
      }
    },
    defaultVariants: {
      position: "top-right",
      variant: "default",
      size: "md",
      responsive: true
    }
  }
);

export type KbdVariant = VariantProps<typeof kbdVariants>;
