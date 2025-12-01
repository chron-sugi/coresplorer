/**
 * SPL Editor Component
 * 
 * Main editor for SPL searches with syntax highlighting
 * and field lineage interactions.
 * 
 * @module features/spl-editor/ui/SPLEditor
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Prism from 'prismjs';
import { useEditorStore, useSPLParser } from '@/entities/spl';
import { useLineageStore } from '@/entities/field';
import { useHoverInfo } from '../hooks/useHoverInfo';
import { useLineageHighlight } from '../hooks/useLineageHighlight';
import { wrapTokensWithPositions } from '../utils/token-wrapper';
import '../styles/editor.css';

// =============================================================================
// TYPES
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
// COMPONENT
// =============================================================================

export function SPLEditor({
  initialValue = '',
  value,
  onChange,
  onFieldHover,
  onFieldClick,
  readOnly = false,
  highlightedLines = [],
  className = '',
}: SPLEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  
  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = useState(initialValue);
  const splText = value ?? internalValue;
  
  // Store integration
  const { setSplText } = useEditorStore();
  const { highlightedLines: storeHighlightedLines } = useLineageStore();
  
  // Parser hook
  const { parse } = useSPLParser();
  
  // Interaction hooks
  const { handleMouseMove, handleMouseLeave } = useHoverInfo<HTMLPreElement>({
    containerRef: highlightRef,
    onHover: onFieldHover,
  });
  
  const { handleClick } = useLineageHighlight<HTMLPreElement>({
    containerRef: highlightRef,
    onClick: onFieldClick,
  });

  // Sync with store
  useEffect(() => {
    setSplText(splText);
  }, [splText, setSplText]);

  // Parse on change
  useEffect(() => {
    parse(splText);
  }, [splText, parse]);

  // Handle text change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange?.(newValue);
  }, [onChange]);

  // Sync scroll between textarea and highlight layer
  const handleScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  // Generate highlighted HTML
  const highlightedHtml = React.useMemo(() => {
    // First, let Prism highlight it
    const highlighted = Prism.highlight(
      splText,
      Prism.languages.splunk || Prism.languages.clike,
      'splunk'
    );
    
    // Then wrap tokens with position data
    return wrapTokensWithPositions(highlighted, splText);
  }, [splText]);

  // Combine highlight sources
  const allHighlightedLines = [
    ...highlightedLines,
    ...storeHighlightedLines,
  ];

  return (
    <div 
      ref={editorRef}
      className={`spl-editor ${className}`}
    >
      {/* Hidden textarea for actual input */}
      <textarea
        ref={textareaRef}
        className="spl-editor__textarea"
        value={splText}
        onChange={handleChange}
        onScroll={handleScroll}
        readOnly={readOnly}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        aria-label="SPL Editor"
      />
      
      {/* Highlight layer */}
      <pre
        ref={highlightRef}
        className="spl-editor__highlight"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        aria-hidden="true"
      >
        <code 
          className="language-splunk"
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      </pre>
      
      {/* Line highlights overlay */}
      {allHighlightedLines.length > 0 && (
        <div className="spl-editor__line-highlights">
          {allHighlightedLines.map(line => (
            <div
              key={line}
              className="spl-editor__line-highlight"
              style={{ top: `${(line - 1) * 1.5}em` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
