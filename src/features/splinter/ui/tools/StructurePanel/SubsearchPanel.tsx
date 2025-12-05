import React, { useMemo } from 'react';
import { useInspectorStore } from '../../../model/store/splinter.store';
import { findFoldableRanges, type FoldRange } from '../../../lib/folding/folding';
import { ChevronRight, Box, Layers } from 'lucide-react';
import { useEditorStore, selectSplText } from '@/entities/spl';
import { panelHeaderVariants } from '../../splinter.variants';

/**
 * Subsearch panel for visualizing SPL query structure.
 *
 * Displays a navigable map of foldable code regions (subsearches, macros, etc.)
 * found in the current SPL query. Clicking a region highlights all lines
 * within that range in the editor.
 *
 * @returns The rendered structure panel with foldable regions list, or empty state message
 */
export const SubsearchPanel = (): React.JSX.Element => {
    const code = useEditorStore(selectSplText);
    const { setHighlightedLines } = useInspectorStore();

    const ranges = useMemo(() => findFoldableRanges(code), [code]);

    /**
     * Handles clicking on a foldable range to highlight it in the editor.
     * Generates an array of all line numbers within the range and updates
     * the highlighted lines in the inspector store.
     *
     * @param range - The fold range containing start and end line numbers
     */
    const handleRangeClick = (range: FoldRange) => {
        const lines = [];
        for (let i = range.startLine; i <= range.endLine; i++) {
            lines.push(i);
        }
        setHighlightedLines(lines);
    };

    if (ranges.length === 0) {
        return (
            <div className="p-4 text-slate-500 text-sm text-center">
                No structural elements found.
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b border-slate-700 bg-slate-900/50">
                <h3 className={panelHeaderVariants()}>
                    <Layers className="w-3 h-3" />
                    Structure Map
                </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {ranges.map((range, index) => (
                    <button
                        key={index}
                        onClick={() => handleRangeClick(range)}
                        className="w-full flex items-center gap-2 p-2 text-left text-sm rounded hover:bg-slate-800 transition-colors group"
                    >
                        <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-slate-300" />
                        <Box className="w-3 h-3 text-blue-500" />
                        <span className="font-mono text-xs text-slate-300 truncate">
                            Subsearch (Lines {range.startLine}-{range.endLine})
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};
