import React, { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/plugins/line-numbers/prism-line-numbers';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';
import '@/shared/ui/code-block/prism-spl'; // Register SPL language
import { cn } from '@/shared/lib/utils';
import { escapeRegex, sanitizeElement } from '@/shared/lib';
import { editorLayout } from '../config/editor-layout.config';
import '../config/editor-theme.css';

interface SplHighlighterProps {
    code: string;
    highlightedLines?: number[];
    highlightToken?: string | null;
    underlinedRanges?: { line: number; startCol: number; endCol: number; type: 'definition' | 'usage' | 'dropped' }[];
    className?: string;
    preRef?: React.RefObject<HTMLPreElement | null>;
    onTokenHover?: (token: string | null, position: { x: number; y: number }, line: number, column: number) => void;
    onTokenClick?: (token: string, line: number, column: number) => void;
}

/**
 * SplHighlighter
 * 
 * A specialized version of CodeBlock dedicated to the SplStaticEditor.
 * It strictly enforces the geometry defined in editor-layout.config.ts
 * to ensure perfect alignment with the overlay textarea.
 */
export const SplHighlighter = ({ 
    code, 
    highlightedLines = [],
    highlightToken = null,
    underlinedRanges = [],
    className = '',
    preRef,
    onTokenHover,
    onTokenClick,
}: SplHighlighterProps): React.JSX.Element => {
    const codeRef = useRef<HTMLElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastHoveredToken = useRef<string | null | undefined>(undefined);
    const safeCode = typeof code === 'string' ? code : '';

    /**
     * Calculate line and column from mouse position within code element
     */
    const getLineColumn = (e: React.MouseEvent): { line: number; column: number } => {
        const codeEl = codeRef.current;
        if (!codeEl) return { line: 1, column: 0 };
        
        const rect = codeEl.getBoundingClientRect();
        
        // Use centralized layout config
        const leftPadding = editorLayout.TOTAL_LEFT_PADDING_PX;
        const topPadding = editorLayout.PADDING_Y_PX;

        const y = e.clientY - rect.top - topPadding;
        const x = e.clientX - rect.left - leftPadding;
        
        const lineHeight = editorLayout.LINE_HEIGHT_PX;
        const charWidth = editorLayout.CHAR_WIDTH_PX;
        
        const line = Math.max(1, Math.floor(y / lineHeight) + 1);
        const column = Math.max(0, Math.floor(x / charWidth));
        
        return { line, column };
    };

    /**
     * Extract token text from a Prism token element
     */
    const getTokenFromElement = (el: HTMLElement | null): string | null => {
        if (!el) return null;
        
        // Check if element is a Prism token or our highlight mark
        const isToken = el.classList.contains('token') || el.tagName === 'MARK';
        if (!isToken) {
            // Check parent
            const parent = el.parentElement;
            if (parent && (parent.classList.contains('token') || parent.tagName === 'MARK')) {
                return parent.textContent?.trim() ?? null;
            }
            return null;
        }
        
        return el.textContent?.trim() ?? null;
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLElement>): void => {
        if (!onTokenHover) return;
        
        const target = e.target as HTMLElement;
        const token = getTokenFromElement(target);
        
        // Only fire callback if token changed
        if (token !== lastHoveredToken.current) {
            lastHoveredToken.current = token;
            const { line, column } = getLineColumn(e);
            onTokenHover(token, { x: e.clientX, y: e.clientY }, line, column);
        }
    };

    const handleMouseLeave = (): void => {
        if (onTokenHover && lastHoveredToken.current !== undefined) {
            lastHoveredToken.current = null;
            onTokenHover(null, { x: 0, y: 0 }, 0, 0);
        }
    };

    const handleClick = (e: React.MouseEvent<HTMLElement>): void => {
        if (!onTokenClick) return;

        const target = e.target as HTMLElement;
        const token = getTokenFromElement(target);

        if (token) {
            const { line, column } = getLineColumn(e);
            onTokenClick(token, line, column);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>): void => {
        // Allow keyboard navigation - Enter/Space triggers click on focused token
        if (e.key === 'Enter' || e.key === ' ') {
            if (!onTokenClick) return;
            const target = e.target as HTMLElement;
            const token = getTokenFromElement(target);
            if (token) {
                e.preventDefault();
                onTokenClick(token, 1, 0);
            }
        }
    };

    useEffect(() => {
        if (codeRef.current) {
            // Ensure code ends with a single newline for proper line numbering
            const normalizedCode = safeCode.endsWith('\n') ? safeCode : safeCode + '\n';
            codeRef.current.textContent = normalizedCode;
            Prism.highlightElement(codeRef.current);
        }
    }, [safeCode]);

    // Handle token highlighting
    useEffect(() => {
        if (!codeRef.current) return;

        const codeElement = codeRef.current;
        
        // Always restore original Prism highlighting first
        const normalizedCode = safeCode.endsWith('\n') ? safeCode : safeCode + '\n';
        codeElement.textContent = normalizedCode;
        Prism.highlightElement(codeElement);
        // Sanitize: remove scripts, event handlers, javascript: URLs
        sanitizeElement(codeElement);
        
        // If no token to highlight, we're done
        if (!highlightToken) {
            return;
        }

        // Apply persistent highlight on top of fresh Prism highlighting
        const originalHTML = codeElement.innerHTML;
        
        // Escape regex metacharacters to prevent ReDoS attacks
        const escapedToken = escapeRegex(highlightToken);
        const regex = new RegExp(`\\b(${escapedToken})\\b`, 'gi');
        const highlightedHTML = originalHTML.replace(
            regex,
            '<mark class="token-highlight-persistent">$1</mark>'
        );
        
        codeElement.innerHTML = highlightedHTML;
        // Re-sanitize after innerHTML assignment
        sanitizeElement(codeElement);
    }, [highlightToken, safeCode]);

    return (
        <div ref={containerRef} className={cn("rounded-md overflow-hidden h-full", className)}>
            <style>{`
                .token-highlight-persistent {
                    background: rgba(255, 255, 0, 0.3); /* Default highlight, can be themed if needed */
                    color: inherit;
                    padding: 0 2px;
                    border-radius: 2px;
                }
            `}</style>
            <pre 
                ref={preRef}
                className={cn(
                    "spl-static-editor-layer", // Enforce scoped theme
                    "!m-0 !bg-transparent overflow-auto h-full max-h-full relative",
                    "line-numbers" // Force line numbers layout
                )}
            >
                {/* Line Highlights Layer */}
                <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                    {highlightedLines.map(line => (
                        <div
                            key={line}
                            className="absolute left-0 right-0 w-full line-highlight"
                            style={{
                                top: `calc((${line} - 1) * ${editorLayout.LINE_HEIGHT_PX}px + ${editorLayout.PADDING_Y_PX}px)`,
                                height: `${editorLayout.LINE_HEIGHT_PX}px`,
                                backgroundColor: 'rgba(59, 130, 246, 0.1)', // Light blue highlight
                            }}
                        />
                    ))}
                    
                    {/* Field Tracer Layer */}
                    {underlinedRanges?.map((range, i) => {
                        if (isNaN(range.line) || isNaN(range.startCol) || isNaN(range.endCol)) return null;
                        
                        let borderColor = "border-blue-400 border-dashed";
                        if (range.type === 'definition') {
                            borderColor = "border-green-500";
                        } else if (range.type === 'dropped') {
                            borderColor = "border-red-500";
                        }

                        return (
                            <div
                                key={i}
                                className={cn(
                                    "absolute border-b-2",
                                    borderColor
                                )}
                                style={{
                                    top: `calc((${range.line} - 1) * ${editorLayout.LINE_HEIGHT_PX}px + ${editorLayout.PADDING_Y_PX}px + 1.2em)`, // Bottom of line
                                    left: `calc(${range.startCol} * ${editorLayout.CHAR_WIDTH_PX}px + ${editorLayout.TOTAL_LEFT_PADDING_PX}px)`,
                                    width: `${(range.endCol - range.startCol) * editorLayout.CHAR_WIDTH_PX}px`,
                                    height: '2px'
                                }}
                            />
                        );
                    })}
                </div>

                {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                <code
                    ref={codeRef}
                    role={onTokenClick ? "button" : undefined}
                    tabIndex={onTokenClick ? 0 : undefined}
                className={cn(
                    `language-spl`,
                    "!text-sm font-mono relative z-10 cursor-default",
                    (onTokenHover || onTokenClick) && "pointer-events-auto"
                )}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onClick={handleClick}
                    onKeyDown={handleKeyDown}
                >
                    {safeCode}
                </code>
            </pre>
        </div>
    );
};
