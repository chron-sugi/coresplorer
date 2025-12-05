/**
 * Splinter feature CVA variant definitions
 *
 * Reusable class-variance-authority variants for the splinter feature.
 * 
 * @module features/splinter/splinter.variants
 */
import { cva, type VariantProps } from "class-variance-authority";

/**
 * Panel header variants
 * Used in: PerfLinterPanel, SubsearchPanel, SchemaEditor panel headers
 */
export const panelHeaderVariants = cva(
  "text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2"
);

/**
 * Section header variants
 * Used in: SplStats section headings
 */
export const sectionHeaderVariants = cva(
  "text-2xs font-semibold text-slate-400 mb-3 uppercase tracking-widest"
);

/**
 * Tab navigation variants
 * Used in: SPLinterPage, other tabbed interfaces
 */
export const tabVariants = cva(
  "flex-1 p-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors",
  {
    variants: {
      state: {
        active: "text-sky-400 bg-slate-900 border-sky-500",
        inactive: "text-slate-400 bg-slate-800/50 border-transparent hover:text-slate-200 hover:bg-slate-800"
      }
    },
    defaultVariants: {
      state: "inactive"
    }
  }
);

/**
 * Interactive badge variants (commands, fields, tags)
 * Used in: SplStats, KnowledgeObjectInspector
 */
export const badgeVariants = cva(
  "inline-flex items-center px-2 py-1 rounded text-xs font-mono border transition-colors cursor-pointer",
  {
    variants: {
      state: {
        active: "bg-sky-600 text-white border-sky-500 shadow-md",
        inactive: "bg-slate-800 text-sky-300 border-slate-700/50 hover:bg-slate-700/50 hover:shadow-sm"
      },
      variant: {
        command: "text-sky-300",
        field: "bg-slate-800/50 text-slate-300 border-slate-700/30 hover:bg-slate-700/40"
      }
    },
    defaultVariants: {
      state: "inactive",
      variant: "command"
    }
  }
);

/**
 * Warning/Alert card variants
 * Used in: SplStats, PerfLinterPanel
 */
export const warningCardVariants = cva(
  "p-3 rounded-lg border text-xs",
  {
    variants: {
      severity: {
        high: "border-rose-900/50 bg-rose-950/10",
        medium: "border-amber-900/50 bg-amber-950/10",
        low: "border-sky-900/50 bg-sky-950/10",
        default: "border-slate-700 bg-slate-800/50"
      }
    },
    defaultVariants: {
      severity: "default"
    }
  }
);

/**
 * Warning badge variants
 * Used in: SplStats, PerfLinterPanel
 */
export const warningBadgeVariants = cva(
  "px-1.5 py-0.5 rounded uppercase text-2xs font-bold tracking-wider",
  {
    variants: {
      severity: {
        high: "bg-rose-900/50 text-rose-200",
        medium: "bg-amber-900/50 text-amber-200",
        low: "bg-sky-900/50 text-sky-200",
        default: "bg-slate-700 text-slate-300"
      }
    },
    defaultVariants: {
      severity: "default"
    }
  }
);

/**
 * Warning text variants
 * Used in: SplStats, PerfLinterPanel
 */
export const warningTextVariants = cva(
  "font-medium",
  {
    variants: {
      severity: {
        high: "text-rose-200",
        medium: "text-amber-200",
        low: "text-sky-200",
        default: "text-slate-300"
      }
    },
    defaultVariants: {
      severity: "default"
    }
  }
);

/**
 * Button for linter warnings (interactive severity indicators)
 * Used in: PerfLinterPanel
 */
export const linterWarningButtonVariants = cva(
  "w-full text-left p-3 rounded border transition-colors",
  {
    variants: {
      severity: {
        high: "border-rose-900/50 bg-rose-950/10 hover:bg-rose-950/20",
        medium: "border-amber-900/50 bg-amber-950/10 hover:bg-amber-950/20",
        low: "border-sky-900/50 bg-sky-950/10 hover:bg-sky-950/20"
      }
    }
  }
);

/**
 * Editor container variants
 * Used in: SPLinterPage main content area
 */
export const editorContainerVariants = cva(
  "h-full flex flex-col rounded-lg shadow-sm border overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-slate-800 border-slate-700"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

/**
 * Search input variants
 * Used in: SPLinterPage search bar
 */
export const searchInputVariants = cva(
  "w-full pl-9 pr-8 py-2 rounded-md text-sm outline-none transition-all",
  {
    variants: {
      variant: {
        default: "bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

/**
 * Search suggestion item variants
 * Used in: SPLinterPage search dropdown items
 */
export const searchSuggestionVariants = cva(
  "w-full text-left px-3 py-2 text-xs flex items-center gap-2 group border-b border-slate-800 last:border-0",
  {
    variants: {
      variant: {
        default: "hover:bg-slate-800"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

/**
 * Dropdown container variants
 * Used in: SPLinterPage search suggestions, other dropdown menus
 */
export const dropdownVariants = cva(
  "absolute bg-slate-900 border border-slate-700 rounded-md shadow-lg overflow-y-auto z-50",
  {
    variants: {
      size: {
        default: "max-h-60",
        large: "max-h-96"
      },
      position: {
        below: "top-full left-0 right-0 mt-1",
        above: "bottom-full left-0 right-0 mb-1"
      }
    },
    defaultVariants: {
      size: "default",
      position: "below"
    }
  }
);

// Export types for use in components
export type PanelHeaderVariant = VariantProps<typeof panelHeaderVariants>;
export type SectionHeaderVariant = VariantProps<typeof sectionHeaderVariants>;
export type TabVariant = VariantProps<typeof tabVariants>;
export type BadgeVariant = VariantProps<typeof badgeVariants>;
export type WarningCardVariant = VariantProps<typeof warningCardVariants>;
export type WarningBadgeVariant = VariantProps<typeof warningBadgeVariants>;
export type WarningTextVariant = VariantProps<typeof warningTextVariants>;
export type LinterWarningButtonVariant = VariantProps<typeof linterWarningButtonVariants>;
export type EditorContainerVariant = VariantProps<typeof editorContainerVariants>;
export type SearchInputVariant = VariantProps<typeof searchInputVariants>;
export type SearchSuggestionVariant = VariantProps<typeof searchSuggestionVariants>;
export type DropdownVariant = VariantProps<typeof dropdownVariants>;
