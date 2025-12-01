import { Maximize2, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { UI_TIMING, UI_DIMENSIONS } from '../../model/constants/diagram.ui.constants';

/**
 * Component for displaying SPL (Search Processing Language) code with syntax highlighting support.
 * Provides copy-to-clipboard functionality and an optional expand button.
 */
interface SplCodeBlockProps {
    code: string;
    onExpand?: () => void;
    className?: string;
}

/**
 * Renders a code block for SPL queries with copy and expand capabilities.
 * 
 * @param props - The component props
 * @param props.code - The SPL code string to display
 * @param props.onExpand - Optional callback function when the expand button is clicked
 * @param props.className - Optional CSS class names to apply to the container
 * @returns The rendered code block component
 */
export function SplCodeBlock({ code, onExpand, className }: SplCodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), UI_TIMING.COPY_FEEDBACK_MS);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <div className={cn("relative group flex flex-col h-full", className)} style={{ minHeight: UI_DIMENSIONS.CODE_BLOCK.MIN_HEIGHT_PX }}>
            {/* Toolbar */}
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                    onClick={handleCopy}
                    className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-md transition-colors backdrop-blur-sm"
                    title="Copy to clipboard"
                >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                
                {onExpand && (
                    <button
                        onClick={onExpand}
                        className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-md transition-colors backdrop-blur-sm"
                        title="Expand view"
                    >
                        <Maximize2 className="h-3.5 w-3.5" />
                        <span>Expand</span>
                    </button>
                )}
            </div>

            {/* Code Area */}
            <pre className="flex-1 p-4 bg-slate-950 text-slate-300 font-mono text-xs overflow-auto rounded-lg border border-slate-800 whitespace-pre-wrap break-all leading-relaxed">
                <code>{code}</code>
            </pre>
        </div>
    );
}
