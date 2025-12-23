import { Maximize2, Copy, Check, AlertTriangle, Info } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { UI_TIMING, UI_DIMENSIONS } from '../../model/constants/diagram.ui.constants';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { detectRiskyCommands, removeRiskyCommands, type RiskyCommandsResult } from '@/shared/lib/spl-safety';

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
    const [showWarningDialog, setShowWarningDialog] = useState(false);
    const [riskyCommandInfo, setRiskyCommandInfo] = useState<RiskyCommandsResult | null>(null);

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), UI_TIMING.COPY_FEEDBACK_MS);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();

        // Detect risky commands
        const riskyInfo = detectRiskyCommands(code);

        if (riskyInfo.hasRiskyCommands) {
            // Show warning dialog
            setRiskyCommandInfo(riskyInfo);
            setShowWarningDialog(true);
        } else {
            // Copy directly if no risky commands
            await copyToClipboard(code);
        }
    };

    const handleKeepCommands = async () => {
        setShowWarningDialog(false);
        await copyToClipboard(code);
    };

    const handleRemoveCommands = async () => {
        if (!riskyCommandInfo) return;
        const cleaned = removeRiskyCommands(code, riskyCommandInfo.commands);
        setShowWarningDialog(false);
        await copyToClipboard(cleaned);
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

            {/* Warning Dialog */}
            <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-yellow-400">
                            <AlertTriangle className="h-5 w-5" />
                            Risky Commands Detected
                        </DialogTitle>
                        <DialogDescription>
                            This SPL contains {riskyCommandInfo?.commandNames.join(' and ')}{' '}
                            {riskyCommandInfo?.commandNames.length === 1 ? 'command' : 'commands'},
                            which write data to Splunk. Would you like to remove{' '}
                            {riskyCommandInfo?.commandNames.length === 1 ? 'it' : 'them'} before copying?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-slate-900/50 p-3 rounded-md border border-slate-700">
                        <div className="flex items-start gap-2 text-xs text-slate-300">
                            <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium mb-1">Commands found:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    {riskyCommandInfo?.commands.map((cmd, idx) => (
                                        <li key={idx}>
                                            <Badge variant="warning" className="ml-1">
                                                {cmd.commandName}
                                            </Badge>
                                            {' '}on line{cmd.startLine === cmd.endLine
                                                ? ` ${cmd.startLine}`
                                                : `s ${cmd.startLine}-${cmd.endLine}`}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={handleKeepCommands}>
                            Keep and Copy
                        </Button>
                        <Button variant="default" onClick={handleRemoveCommands}>
                            Remove and Copy
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
