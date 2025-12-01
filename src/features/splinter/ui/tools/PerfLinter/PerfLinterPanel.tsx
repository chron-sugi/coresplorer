import { useMemo } from 'react';
import { useInspectorStore } from '../../../model/store/splinter.store';
import { lintSpl, useEditorStore, selectSplText } from '@/entities/spl';
import { AlertTriangle, AlertOctagon } from 'lucide-react';
import { linterWarningButtonVariants, panelHeaderVariants } from '../../../splinter.variants';

/**
 * Performance linter panel for SPL queries.
 *
 * Analyzes the current SPL code for performance issues and displays
 * warnings with severity levels. Clicking a warning highlights the
 * corresponding line in the editor.
 *
 * @returns The rendered linter panel with warnings list, or empty state message
 */
export const PerfLinterPanel = (): React.JSX.Element => {
    const code = useEditorStore(selectSplText);
    const { setHighlightedLines } = useInspectorStore();

    const warnings = useMemo(() => lintSpl(code), [code]);

    /**
     * Handles clicking on a warning to highlight the affected line in the editor.
     * @param line - The line number to highlight
     */
    const handleWarningClick = (line: number) => {
        setHighlightedLines([line]);
    };

    if (warnings.length === 0) {
        return (
            <div className="p-4 text-slate-500 text-sm text-center">
                No performance issues detected.
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b border-slate-700 bg-slate-900/50">
                <h3 className={panelHeaderVariants()}>
                    <AlertTriangle className="w-3 h-3" />
                    Performance Linter
                </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {warnings.map((warning, index) => {
                    // Map severity: high -> 'high', medium/low -> 'medium'
                    const severity = warning.severity === 'high' ? 'high' : 'medium';
                    return (
                    <button
                        key={index}
                        onClick={() => handleWarningClick(warning.line)}
                        className={linterWarningButtonVariants({ severity })}
                    >
                        <div className="flex items-start gap-2">
                            {warning.severity === 'high' ? (
                                <AlertOctagon className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                            ) : (
                                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                            )}
                            <div>
                                <div className="text-xs font-semibold text-slate-200 mb-0.5">
                                    Line {warning.line}: {warning.message}
                                </div>
                                {warning.suggestion && (
                                    <div className="text-xs text-slate-400">
                                        Tip: {warning.suggestion}
                                    </div>
                                )}
                            </div>
                        </div>
                    </button>
                    );
                })}
            </div>
        </div>
    );
};
