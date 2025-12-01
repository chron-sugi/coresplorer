import React, { useRef, useEffect, useCallback } from 'react';
import { SplHighlighter } from './SplHighlighter';
import { editorLayout } from '../config/editor-layout.config';
import '../config/editor-theme.css';

interface SplStaticEditorProps {
    code: string;
    onChange?: (code: string) => void;
    highlightedLines?: number[];
    highlightToken?: string | null;
    underlinedRanges?: { line: number; startCol: number; endCol: number; type: 'definition' | 'usage' | 'dropped' }[];
    onSelectionChange?: (text: string | null) => void;
    onTokenHover?: (token: string | null, position: { x: number; y: number }, line: number, column: number) => void;
    onTokenClick?: (token: string, line: number, column: number) => void;
}

/**
 * Extract the token at a given position in the code.
 */
function getTokenAtPosition(code: string, line: number, column: number): string | null {
    const lines = code.split('\n');
    if (line < 1 || line > lines.length) return null;

    const lineText = lines[line - 1];
    if (column < 0 || column >= lineText.length) return null;

    let start = column;
    let end = column;

    while (start > 0 && /[\w]/.test(lineText[start - 1])) {
        start--;
    }

    while (end < lineText.length && /[\w]/.test(lineText[end])) {
        end++;
    }

    if (start === end) return null;

    return lineText.slice(start, end);
}

/**
 * SplStaticEditor
 * 
 * A self-contained widget for editing SPL code with static analysis features.
 * Enforces strict layout alignment between the input textarea and the syntax highlighter.
 */
export const SplStaticEditor = ({
    code,
    onChange,
    highlightedLines = [],
    highlightToken,
    underlinedRanges = [],
    onSelectionChange,
    onTokenHover,
    onTokenClick,
}: SplStaticEditorProps): React.JSX.Element => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const preRef = useRef<HTMLPreElement>(null);
    const lastHoveredToken = useRef<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange?.(e.target.value);
    };

    /**
     * Calculate line and column from mouse position in textarea.
     */
    const getLineColumnFromMouse = useCallback((e: React.MouseEvent<HTMLTextAreaElement>): { line: number; column: number } => {
        const textarea = textareaRef.current;
        if (!textarea) return { line: 1, column: 0 };

        const rect = textarea.getBoundingClientRect();
        
        const leftPadding = editorLayout.TOTAL_LEFT_PADDING_PX;
        const topPadding = editorLayout.PADDING_Y_PX;
        const charWidth = editorLayout.CHAR_WIDTH_PX;

        const x = e.clientX - rect.left - leftPadding;
        const y = e.clientY - rect.top - topPadding + textarea.scrollTop;

        const lineHeight = editorLayout.LINE_HEIGHT_PX;

        const line = Math.max(1, Math.floor(y / lineHeight) + 1);
        const column = Math.max(0, Math.floor(x / charWidth));

        return { line, column };
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLTextAreaElement>) => {
        if (!onTokenHover) return;

        const { line, column } = getLineColumnFromMouse(e);
        const token = getTokenAtPosition(code, line, column);

        if (token !== lastHoveredToken.current) {
            lastHoveredToken.current = token;
            onTokenHover(token, { x: e.clientX, y: e.clientY }, line, column);
        }
    }, [code, onTokenHover, getLineColumnFromMouse]);

    const handleMouseLeave = useCallback(() => {
        if (onTokenHover && lastHoveredToken.current !== null) {
            lastHoveredToken.current = null;
            onTokenHover(null, { x: 0, y: 0 }, 0, 0);
        }
    }, [onTokenHover]);

    const handleClick = useCallback((e: React.MouseEvent<HTMLTextAreaElement>) => {
        if (!onTokenClick) return;

        const { line, column } = getLineColumnFromMouse(e);
        const token = getTokenAtPosition(code, line, column);

        if (token) {
            e.stopPropagation();
            onTokenClick(token, line, column);
        }
    }, [code, onTokenClick, getLineColumnFromMouse]);

    const handleScroll = () => {
        if (textareaRef.current && preRef.current) {
            preRef.current.scrollTop = textareaRef.current.scrollTop;
            preRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    };

    // Ensure wheel scrolling always drives the textarea (and highlighter) scroll position
    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        if (!textareaRef.current) return;
        textareaRef.current.scrollTop += e.deltaY;
        textareaRef.current.scrollLeft += e.deltaX;
        handleScroll();
    };

    useEffect(() => {
        handleScroll();
    }, [code]);

    // Scroll to first highlighted line
    useEffect(() => {
        if (highlightedLines.length > 0 && textareaRef.current) {
            const firstLine = highlightedLines[0];
            const lineHeight = editorLayout.LINE_HEIGHT_PX;
            const padding = editorLayout.PADDING_Y_PX;
            const lineTop = (firstLine - 1) * lineHeight + padding;
            const containerHeight = textareaRef.current.clientHeight;
            
            const scrollTop = Math.max(0, lineTop - containerHeight / 2 + lineHeight / 2);
            
            setTimeout(() => {
                textareaRef.current?.scrollTo({
                    top: scrollTop,
                    behavior: 'smooth'
                });
            }, 50);
        }
    }, [highlightedLines]);

    useEffect(() => {
        // noop - retained for future mount side effects if needed
    }, []);

    return (
        <div 
            className="relative h-full rounded-md overflow-hidden"
            style={{ backgroundColor: '#2d2d2d' }} // Keep theme background
            onWheel={handleWheel}
        >
            {/* The textarea for input */}
            <textarea
                ref={textareaRef}
                data-testid="spl-editor"
                aria-label="SPL Analysis Editor"
                value={code}
                onChange={handleChange}
                onScroll={handleScroll}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
                onSelect={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    const text = target.value.substring(target.selectionStart, target.selectionEnd);
                    onSelectionChange?.(text || null);
                }}
                className="spl-static-editor-layer absolute inset-0 w-full h-full resize-none bg-transparent text-transparent caret-white z-20 outline-none whitespace-pre selection:bg-blue-500/30 selection:text-transparent overflow-auto"
                spellCheck={false}
            />
            
            {/* The syntax highlighted display */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <SplHighlighter 
                    code={code} 
                    highlightedLines={highlightedLines}
                    highlightToken={highlightToken}
                    underlinedRanges={underlinedRanges}
                    className="h-full !bg-transparent !rounded-none"
                    preRef={preRef}
                    onTokenHover={onTokenHover}
                    onTokenClick={onTokenClick}
                />
            </div>
        </div>
    );
};
