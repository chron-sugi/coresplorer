/**
 * useHoverInfo Hook
 * 
 * Manages hover state for field tokens in the editor.
 * 
 * @module components/spl-editor/hooks/useHoverInfo
 */

import { useCallback, useRef } from 'react';
import type { RefObject } from 'react';

// TODO: Connect to store once implemented
// import { useLineageStore } from '@/store';

interface HoveredField {
  fieldName: string;
  line: number;
  column: number;
  x: number;
  y: number;
}

type UseHoverInfoOptions<T extends HTMLElement = HTMLElement> = {
  containerRef: RefObject<T | null>;
  onHover?: (fieldName: string, line: number) => void;
  debounceMs?: number;
};

interface UseHoverInfoReturn {
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseLeave: () => void;
}

/**
 * Hook for managing hover interactions on field tokens.
 */
export function useHoverInfo<TElem extends HTMLElement = HTMLElement>({
  containerRef: _containerRef,
  onHover,
  debounceMs = 50,
}: UseHoverInfoOptions<TElem>): UseHoverInfoReturn {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastElementRef = useRef<HTMLElement | null>(null);
  const hoveredFieldRef = useRef<HoveredField | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // Clear pending debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const target = e.target as HTMLElement;
      
      // Skip if same element
      if (target === lastElementRef.current) {
        return;
      }
      lastElementRef.current = target;

      // Check if we're on a token with position data
      const tokenElement = target.closest('[data-line][data-column]') as HTMLElement;
      
      if (!tokenElement) {
        hoveredFieldRef.current = null;
        return;
      }

      const line = parseInt(tokenElement.dataset.line || '0', 10);
      const column = parseInt(tokenElement.dataset.column || '0', 10);
      const content = tokenElement.dataset.content || tokenElement.textContent || '';
      const tokenType = tokenElement.dataset.tokenType || '';

      // Only show hover for identifiers (potential field names)
      if (!isFieldToken(tokenType, content)) {
        hoveredFieldRef.current = null;
        return;
      }

      // Get position for tooltip
      const rect = tokenElement.getBoundingClientRect();
      
      hoveredFieldRef.current = {
        fieldName: content,
        line,
        column,
        x: rect.left + rect.width / 2,
        y: rect.top,
      };

      onHover?.(content, line);
    }, debounceMs);
  }, [onHover, debounceMs]);

  const handleMouseLeave = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    lastElementRef.current = null;
    hoveredFieldRef.current = null;
  }, []);

  return {
    handleMouseMove,
    handleMouseLeave,
  };
}

/**
 * Check if a token represents a field name.
 */
function isFieldToken(tokenType: string, content: string): boolean {
  // Common token types that represent fields
  const fieldTokenTypes = ['variable', 'property', 'attr-name', 'field'];
  
  if (fieldTokenTypes.some(t => tokenType.includes(t))) {
    return true;
  }

  // Check content - identifiers that could be fields
  // Exclude keywords, operators, numbers, strings
  if (/^[a-zA-Z_][a-zA-Z0-9_.]*$/.test(content)) {
    // Check if it's not a keyword
    const keywords = [
      'eval', 'stats', 'table', 'fields', 'where', 'search', 'rename',
      'rex', 'lookup', 'by', 'as', 'and', 'or', 'not', 'true', 'false',
    ];
    return !keywords.includes(content.toLowerCase());
  }

  return false;
}
