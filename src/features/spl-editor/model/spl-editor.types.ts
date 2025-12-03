/**
 * SPL Editor Types
 *
 * Feature-local types for the SPL editor component and hooks.
 *
 * @module features/spl-editor/model/spl-editor.types
 */

import type { RefObject } from 'react';

// =============================================================================
// EDITOR TYPES
// =============================================================================

export interface SPLEditorProps {
  /** Initial SPL text */
  initialValue?: string;
  /** Controlled value */
  value?: string;
  /** Called when SPL changes */
  onChange?: (spl: string) => void;
  /** Called on field hover */
  onFieldHover?: (fieldName: string, line: number) => void;
  /** Called on field click */
  onFieldClick?: (fieldName: string, line: number) => void;
  /** Disable editing */
  readOnly?: boolean;
  /** Lines to highlight */
  highlightedLines?: number[];
  /** CSS class name */
  className?: string;
}

// =============================================================================
// HOVER INFO TYPES
// =============================================================================

export interface HoveredField {
  fieldName: string;
  line: number;
  column: number;
  x: number;
  y: number;
}

export interface UseHoverInfoOptions<T extends HTMLElement = HTMLElement> {
  containerRef: RefObject<T | null>;
  onHover?: (fieldName: string, line: number) => void;
  debounceMs?: number;
}

export interface UseHoverInfoReturn {
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseLeave: () => void;
}

// =============================================================================
// LINEAGE HIGHLIGHT TYPES
// =============================================================================

export interface SelectedField {
  fieldName: string;
  locked: boolean;
}

export interface UseLineageHighlightOptions<T extends HTMLElement = HTMLElement> {
  containerRef: RefObject<T | null>;
  onClick?: (fieldName: string, line: number) => void;
}

export interface UseLineageHighlightReturn {
  handleClick: (e: React.MouseEvent) => void;
  handleDoubleClick: (e: React.MouseEvent) => void;
  clearHighlight: () => void;
  selectedField: SelectedField | null;
}
