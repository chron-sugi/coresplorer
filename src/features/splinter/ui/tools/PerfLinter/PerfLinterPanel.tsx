import { useMemo } from 'react';
import { useInspectorStore } from '../../../model/store/splinter.store';
import { lintSpl, useEditorStore, selectSplText, type LinterSeverity } from '@/entities/spl';
import { AlertTriangle, AlertOctagon, Info } from 'lucide-react';
import { linterWarningButtonVariants, panelHeaderVariants } from '../../../splinter.variants';

/**
 * Icon component for severity levels.
 * - high: red octagon (stop sign)
 * - medium: yellow triangle (warning)
 * - low: blue info circle (informational)
 */
const SeverityIcon = ({ severity }: { severity: LinterSeverity }): React.JSX.Element => {
    const iconClass = "w-4 h-4 mt-0.5 shrink-0";
    switch (severity) {
        case 'high':
            return <AlertOctagon className={`${iconClass} text-red-500`} />;
        case 'medium':
            return <AlertTriangle className={`${iconClass} text-yellow-500`} />;
        case 'low':
            return <Info className={`${iconClass} text-sky-500`} />;
    }
};

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
                {warnings.map((warning, index) => (
                    <button
                        key={index}
                        onClick={() => handleWarningClick(warning.line)}
                        className={linterWarningButtonVariants({ severity: warning.severity })}
                    >
                        <div className="flex items-start gap-2">
                            <SeverityIcon severity={warning.severity} />
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
                ))}
            </div>
        </div>
    );
};
