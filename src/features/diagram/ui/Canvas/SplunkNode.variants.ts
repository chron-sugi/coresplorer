/**
 * SplunkNode Variant Definitions
 *
 * CVA variants for SplunkNode component styling.
 * Extracts complex conditional logic into a type-safe variant system.
 *
 * @module features/diagram/ui/Canvas/SplunkNode.variants
 */
import { cva, type VariantProps } from "class-variance-authority";

/**
 * SplunkNode container variants
 *
 * Handles the complex state-based styling for diagram nodes:
 * - Base pill shape and styling
 * - Interaction states (hover, selected, focused)
 * - Visibility states (highlighted, dimmed)
 * - Core node differentiation
 */
export const splunkNodeVariants = cva(
  [
    // Base pill shape
    "relative flex items-center gap-2 pl-1 pr-3 py-1 rounded-full",
    // Base styling
    "bg-white border transition-all duration-150",
  ],
  {
    variants: {
      /**
       * Primary interaction state
       * Determines border, ring, and opacity
       */
      state: {
        default: "border-slate-300 hover:border-slate-400",
        selected: "border-slate-500 hover:border-slate-500",
        focused: "border-slate-300 ring-2 ring-sky-500/50 ring-offset-1 ring-offset-white",
        highlighted: "border-slate-400",
        dimmed: "border-slate-300 opacity-40 hover:border-slate-300",
      },
      /**
       * Core node flag
       * Applies special styling for core/central nodes
       */
      isCore: {
        true: "bg-slate-200 border-slate-400 pr-6",
        false: "",
      },
    },
    defaultVariants: {
      state: "default",
      isCore: false,
    },
  }
);

/**
 * SplunkNode icon container variants
 *
 * Determines icon size based on core status
 */
export const splunkNodeIconVariants = cva(
  "flex-shrink-0 rounded-full flex items-center justify-center",
  {
    variants: {
      isCore: {
        true: "w-12 h-12",
        false: "w-6 h-6",
      },
    },
    defaultVariants: {
      isCore: false,
    },
  }
);

/**
 * SplunkNode icon element variants
 *
 * Determines icon size within the container
 */
export const splunkNodeIconElementVariants = cva("text-white", {
  variants: {
    isCore: {
      true: "w-7 h-7",
      false: "w-3.5 h-3.5",
    },
  },
  defaultVariants: {
    isCore: false,
  },
});

/**
 * SplunkNode label variants
 *
 * Determines text styling based on core status
 */
export const splunkNodeLabelVariants = cva(
  "truncate text-slate-700 leading-none",
  {
    variants: {
      isCore: {
        true: "text-base font-semibold",
        false: "text-xs font-medium",
      },
    },
    defaultVariants: {
      isCore: false,
    },
  }
);

/**
 * Helper function to compute the node state from boolean flags
 *
 * Implements the state priority logic:
 * 1. Dimmed (lowest priority for interaction)
 * 2. Focused (highest visual priority)
 * 3. Selected
 * 4. Highlighted
 * 5. Default
 *
 * @param flags - Boolean state flags
 * @returns The computed state variant
 */
export function computeNodeState(flags: {
  isDimmed: boolean;
  isFocused: boolean;
  selected: boolean;
  isHighlighted: boolean;
}): "default" | "selected" | "focused" | "highlighted" | "dimmed" {
  if (flags.isDimmed) return "dimmed";
  if (flags.isFocused) return "focused";
  if (flags.selected) return "selected";
  if (flags.isHighlighted) return "highlighted";
  return "default";
}

// Export types
export type SplunkNodeVariant = VariantProps<typeof splunkNodeVariants>;
export type SplunkNodeIconVariant = VariantProps<typeof splunkNodeIconVariants>;
export type SplunkNodeIconElementVariant = VariantProps<typeof splunkNodeIconElementVariants>;
export type SplunkNodeLabelVariant = VariantProps<typeof splunkNodeLabelVariants>;
