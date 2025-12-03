/**
 * useLineageHighlight Hook
 *
 * Manages click-to-highlight functionality for field lineage.
 *
 * @module features/spl-editor/model/useLineageHighlight
 */

import { useCallback, useState } from 'react';
import type {
  SelectedField,
  UseLineageHighlightOptions,
  UseLineageHighlightReturn,
} from './spl-editor.types';

/**
 * Hook for managing click highlighting of field lineage.
 */
export function useLineageHighlight<TElem extends HTMLElement = HTMLElement>({
  containerRef: _containerRef,
  onClick,
}: UseLineageHighlightOptions<TElem>): UseLineageHighlightReturn {
  const [selectedField, setSelectedField] = useState<SelectedField | null>(null);

  const selectField = useCallback((fieldName: string, locked: boolean) => {
    setSelectedField({ fieldName, locked });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedField(null);
  }, []);

  const toggleSelectionLock = useCallback(() => {
    setSelectedField(prev => prev ? { ...prev, locked: !prev.locked } : null);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // Find the token element
    const tokenElement = target.closest('[data-line][data-column]') as HTMLElement;
    
    if (!tokenElement) {
      // Clicked outside any token - clear selection if not locked
      if (!selectedField?.locked) {
        clearSelection();
      }
      return;
    }

    const line = parseInt(tokenElement.dataset.line || '0', 10);
    const content = tokenElement.dataset.content || tokenElement.textContent || '';

    // Check if it's a valid field token
    if (!isValidFieldName(content)) {
      if (!selectedField?.locked) {
        clearSelection();
      }
      return;
    }

    // If clicking the same field, toggle lock
    if (selectedField?.fieldName === content) {
      toggleSelectionLock();
    } else {
      // Select new field
      selectField(content, false);
    }

    onClick?.(content, line);
  }, [selectField, clearSelection, toggleSelectionLock, selectedField, onClick]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const tokenElement = target.closest('[data-line][data-column]') as HTMLElement;
    
    if (!tokenElement) return;

    const content = tokenElement.dataset.content || tokenElement.textContent || '';

    if (isValidFieldName(content)) {
      // Double-click locks the selection
      selectField(content, true);
    }
  }, [selectField]);

  const clearHighlight = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  return {
    handleClick,
    handleDoubleClick,
    clearHighlight,
    selectedField,
  };
}

/**
 * Check if a string is a valid field name.
 */
function isValidFieldName(name: string): boolean {
  // Must start with letter or underscore, followed by alphanumeric, underscore, or dot
  return /^[a-zA-Z_][a-zA-Z0-9_.]*$/.test(name);
}
