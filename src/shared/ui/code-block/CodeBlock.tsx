/**
 * @fileoverview CodeBlock component for syntax-highlighted code display.
 * 
 * Provides a feature-rich code viewer with Prism.js syntax highlighting, supporting:
 * - Line numbering
 * - Multi-line highlighting
 * - Token-based highlighting (persistent across re-renders)
 * - Field tracer underlines (definition vs usage)
 * - Auto-scroll to highlighted lines
 * - SPL (Splunk Processing Language) syntax support
 * 
 * @module shared/ui/code-block/CodeBlock
 */

import React, { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/plugins/line-numbers/prism-line-numbers';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';
import './prism-spl'; // Register SPL language
import { themeConfig, editorConfig } from '@/shared/config';
import { cn } from '@/shared/lib/utils';
import { escapeRegex, sanitizeElement } from '@/shared/lib';

interface CodeBlockProps {
    code: string;
    language?: string;
    className?: string;
    showLineNumbers?: boolean;
    highlightedLines?: number[];
    highlightToken?: string | null;
    underlinedRanges?: { line: number; startCol: number; endCol: number; type: 'definition' | 'usage' }[];
    onScrollComplete?: () => void;
    preRef?: React.RefObject<HTMLPreElement | null>;
    preClassName?: string;
    disableAutoScroll?: boolean;
    onTokenHover?: (token: string | null, position: { x: number; y: number }, line: number, column: number) => void;
    onTokenClick?: (token: string, line: number, column: number) => void;
}

/**
 * CodeBlock component for displaying syntax-highlighted code with advanced features.
 * 
 * @param props - Component props
 * @param props.code - The source code to display
 * @param props.language - Programming language for syntax highlighting (default: 'spl')
 * @param props.className - Additional CSS classes for the container
 * @param props.showLineNumbers - Whether to display line numbers (default: false)
 * @param props.highlightedLines - Array of line numbers to highlight with background color
 * @param props.highlightToken - Token/keyword to highlight persistently across the code
 * @param props.underlinedRanges - Array of ranges to underline (for field tracing)
 * @param props.onScrollComplete - Callback fired after auto-scroll completes
 * @param props.preRef - Optional ref to the pre element
 * @param props.preClassName - Additional CSS classes for the pre element
 * @param props.disableAutoScroll - Disable automatic scrolling to highlighted lines
 * @returns Rendered code block with syntax highlighting and visual enhancements
 */
export const CodeBlock = ({ 
    code, 
    language = 'spl',
    className = '',
    showLineNumbers = false,
    highlightedLines = [],
    highlightToken = null,
    underlinedRanges = [],
    onScrollComplete,
    preRef,
    preClassName = '',
    disableAutoScroll = false,
    onTokenHover,
    onTokenClick,
}: CodeBlockProps): React.JSX.Element => {
    const codeRef = useRef<HTMLElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastHoveredToken = useRef<string | null | undefined>(undefined);

    /**
     * Calculate line and column from mouse position within code element
     */
    const getLineColumn = (e: React.MouseEvent): { line: number; column: number } => {
        const codeEl = codeRef.current;
        if (!codeEl) return { line: 1, column: 0 };
        
        const rect = codeEl.getBoundingClientRect();
        
        // Calculate offsets based on configuration
        // If line numbers are shown, we have extra left padding (pl-16 = 64px)
        // Otherwise standard padding (p-4 = 16px)
        const leftPadding = showLineNumbers ? editorConfig.TOTAL_LEFT_PADDING : editorConfig.PADDING_X;
        const topPadding = editorConfig.PADDING_Y;

        const y = e.clientY - rect.top - topPadding;
        const x = e.clientX - rect.left - leftPadding;
        
        const lineHeight = editorConfig.LINE_HEIGHT;
        const charWidth = editorConfig.CHAR_WIDTH;
        
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
        // Do NOT trim start, as it causes misalignment with textarea if there's leading whitespace
        const normalizedCode = code.endsWith('\n') ? code : code + '\n';
        codeRef.current.textContent = normalizedCode;
        Prism.highlightElement(codeRef.current);
        }
    }, [code, language, showLineNumbers]);

    // Handle scroll to first highlighted line
    useEffect(() => {
        if (!disableAutoScroll && highlightedLines.length > 0 && containerRef.current && showLineNumbers) {
            const firstLine = highlightedLines[0];
            const lineNumbersRows = containerRef.current.querySelector('.line-numbers-rows');
            if (lineNumbersRows) {
                const lineSpan = lineNumbersRows.querySelector(`span:nth-child(${firstLine})`);
                if (lineSpan) {
                    // Scroll into view
                    lineSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    onScrollComplete?.();
                }
            }
        }
    }, [highlightedLines, showLineNumbers, onScrollComplete, disableAutoScroll]);

    // Handle token highlighting
    useEffect(() => {
        if (!codeRef.current) return;

        const codeElement = codeRef.current;
        
        // Always restore original Prism highlighting first
        const normalizedCode = code.endsWith('\n') ? code : code + '\n';
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
    }, [highlightToken, code]);

    return (
        <div ref={containerRef} className={cn("rounded-md overflow-hidden bg-[hsl(var(--code-bg))]", className)}>
            <style>{`
                .token-highlight-persistent {
                    background: ${themeConfig.colors.semantic.codeEditor.highlightStrong};
                    color: inherit;
                    padding: 0 2px;
                    border-radius: 2px;
                }
            `}</style>
            <pre 
                ref={preRef}
                className={cn(
                    "!m-0 !bg-transparent overflow-auto min-h-full relative",
                    showLineNumbers ? "line-numbers !pl-16 !p-4" : "!p-4",
                    preClassName
                )}
                style={{ lineHeight: '1.5' }}
            >
                {/* Line Highlights Layer */}
                <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                    {highlightedLines.map(line => (
                        <div
                            key={line}
                            className="absolute left-0 right-0 w-full"
                            style={{
                                top: `calc((${line} - 1) * 1.5em + 1rem)`,
                                height: '1.5em',
                                backgroundColor: themeConfig.colors.semantic.codeEditor.highlightWeak,
                            }}
                        />
                    ))}
                    
                    {/* Field Tracer Layer */}
                    {underlinedRanges?.map((range, i) => {
                        // Ensure valid numbers to prevent NaN errors in SVG/CSS
                        if (isNaN(range.line) || isNaN(range.startCol) || isNaN(range.endCol)) return null;
                        
                        return (
                            <div
                                key={i}
                                className={cn(
                                    "absolute border-b-2",
                                    range.type === 'definition' ? "border-green-500" : "border-blue-400 border-dashed"
                                )}
                                style={{
                                    top: `calc((${range.line} - 1) * 1.5em + 1rem + 1.2em)`, // Bottom of line
                                    left: `calc(${range.startCol}ch + 4rem)`, // 4rem padding-left
                                    width: `${range.endCol - range.startCol}ch`,
                                    height: '2px'
                                }}
                            />
                        );
                    })}
                </div>

                {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Interactive when onTokenClick provided, role="button" added */}
                <code
                    ref={codeRef}
                    role={onTokenClick ? "button" : undefined}
                    tabIndex={onTokenClick ? 0 : undefined}
                    className={cn(
                        `language-${language}`,
                        "!text-sm font-mono relative z-10 cursor-default",
                        // Enable pointer events even if parent has pointer-events-none
                        (onTokenHover || onTokenClick) && "pointer-events-auto"
                    )}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onClick={handleClick}
                    onKeyDown={handleKeyDown}
                >
                    {code}
                </code>
            </pre>
        </div>
    );
};
