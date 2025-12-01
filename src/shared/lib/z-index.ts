/**
 * Z-Index Layering System
 *
 * Documentation for standardized z-index values used across the application.
 * This ensures consistent layering and prevents stacking context issues.
 *
 * ## Usage Guidelines
 *
 * When adding positioned elements, use these standard Tailwind z-index utilities:
 *
 * - `z-10` - Floating UI elements (buttons, toolbars, tooltips, code overlays)
 * - `z-20` - Overlays and interactive panels (inspector panels, highlighting layers)
 * - `z-50` - Top-level UI (modals, dialogs, dropdowns, sticky headers)
 *
 * ## Examples
 *
 * ```tsx
 * // Floating button
 * <button className="absolute top-4 right-4 z-10">...</button>
 *
 * // Inspector overlay
 * <div className="absolute top-4 right-4 z-20">...</div>
 *
 * // Modal dialog
 * <DialogContent className="... z-50">...</DialogContent>
 * ```
 *
 * @module shared/lib/z-index
 */

/**
 * Z-index documentation constants.
 * These are primarily for documentation and type safety.
 * In most cases, use the Tailwind utilities directly (z-10, z-20, z-50).
 */
export const Z_INDEX = {
  /** Base layer for floating UI elements (buttons, toolbars, tooltips) */
  FLOATING: 10,

  /** Mid layer for overlays and interactive panels */
  OVERLAY: 20,

  /** Top layer for modals, dialogs, dropdowns, and sticky headers */
  MODAL: 50,
} as const;

/**
 * Type for z-index layer values
 */
export type ZIndexLayer = typeof Z_INDEX[keyof typeof Z_INDEX];
