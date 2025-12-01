/**
 * UI utility helpers
 *
 * Small, dependency-wrapping helpers used by components (for example the
 * `cn` helper that composes Tailwind class strings). Keep helpers small
 * and focused so they can be shared across the codebase.
 */
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges Tailwind CSS classes with proper precedence
 * 
 * Combines clsx for conditional class generation and tailwind-merge for
 * handling conflicting Tailwind utilities. Use this for all className
 * composition to ensure proper class merging.
 * 
 * @param inputs - Class values (strings, objects, arrays) to merge
 * @returns Merged className string
 * @example
 * cn("px-2 py-1", condition && "bg-blue-500", { "font-bold": isActive })
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
