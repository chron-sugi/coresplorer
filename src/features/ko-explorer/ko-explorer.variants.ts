/**
 * KO Explorer variant definitions
 *
 * @module features/ko-explorer/ko-explorer.variants
 */
import { cva, type VariantProps } from "class-variance-authority";

// Deprecated exports - kept for backward compatibility
export { getKoBadgeClasses, type SplunkKoType as KOTypeBadgeVariant } from '@/entities/knowledge-object';

/**
 * @deprecated Use getKoBadgeClasses(type) from @/entities/knowledge-object instead
 */
export { getKoBadgeClasses as koTypeBadgeVariants } from '@/entities/knowledge-object';

/**
 * Dropdown trigger button variants
 * Used in: AppDropdown, OwnerDropdown
 */
export const dropdownTriggerVariants = cva(
  "inline-flex items-center gap-1.5 h-8 px-3 text-sm rounded-md border transition-colors",
  {
    variants: {
      state: {
        active: "border-sky-500 bg-sky-600/20 text-sky-300",
        inactive: "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
      }
    },
    defaultVariants: {
      state: "inactive"
    }
  }
);

// Export types for use in components
export type DropdownTriggerVariant = VariantProps<typeof dropdownTriggerVariants>;
