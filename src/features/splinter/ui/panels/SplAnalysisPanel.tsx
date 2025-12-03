/**
 * SplAnalysisPanel
 *
 * Contains the SPL editor (viewer) and overlays such as the Object Inspector.
 * Integrates field-hover and field-highlight features for lineage visualization.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useInspectorStore } from '../../model/store/splinter.store';
import { SplStaticEditor } from '@/widgets/spl-static-editor/ui/SplStaticEditor';
import { KnowledgeObjectInspector } from '../tools/KnowledgeObjectInspector/KnowledgeObjectInspector';
import { useHover, LineageTooltip } from '@/features/field-hover';
import { useHighlight } from '@/features/field-highlight';
import { useFieldLineage } from '@/entities/field';
import { useEditorStore, useSPLParser } from '@/entities/spl';

export const SplAnalysisPanel = (): React.JSX.Element => {
    const { 
        highlightedLines: searchHighlightedLines, 
        activeField,
        selectedText,
        setSelectedText
    } = useInspectorStore();

    // SPL Parser integration to sync with global editor store
    const { splText, setSplText } = useEditorStore();
    const { parse } = useSPLParser();

    // Sync code changes to the shared editor store and trigger parsing
    const handleCodeChange = useCallback((newCode: string) => {
        setSplText(newCode);
        parse(newCode);
    }, [setSplText, parse]);

    // Initial parse on mount to ensure lineage is available for existing code
  useEffect(() => {
    if (splText) {
      parse(splText);
    }
  }, [parse, splText]); // Run once on mount

    // Field lineage hooks
    const { lineageIndex } = useFieldLineage();
    
    // Field hover feature
    const {
        hoveredField,
        position: hoverPosition,
        tooltipVisible,
        lineage: hoverLineage,
        setHover,
        clearHover,
    } = useHover();

    // Field highlight feature
    const {
        selectedField,
        highlightedLines: lineageHighlightedLines,
        clearSelection,
        selectField,
    } = useHighlight();

    // Handle token hover - check if token is a known field
    const handleTokenHover = useCallback(
        (token: string | null, position: { x: number; y: number }, line: number, column: number) => {
            if (!token || !lineageIndex) {
                clearHover();
                return;
            }
            
            // Only show tooltip for fields that have lineage data
            const lineage = lineageIndex.getFieldLineage(token);
            if (lineage) {
                setHover(token, position, line, column);
            } else {
                clearHover();
            }
        },
        [lineageIndex, setHover, clearHover]
    );

    // Handle token click - select field for highlighting
    const handleTokenClick = useCallback(
        (token: string, _line: number, _column: number) => {
            if (!lineageIndex) return;
            
            // Only highlight fields that have lineage data
            const lineage = lineageIndex.getFieldLineage(token);
            if (lineage) {
                // If clicking the same field, toggle selection
                if (selectedField === token) {
                    clearSelection();
                } else {
                    selectField(token);
                }
            }
        },
        [lineageIndex, selectedField, selectField, clearSelection]
    );

    // Combine search and lineage highlighted lines
    const highlightedLines = useMemo(() => {
        const combined = new Set([
            ...searchHighlightedLines,
            ...lineageHighlightedLines,
        ]);
        return Array.from(combined);
    }, [searchHighlightedLines, lineageHighlightedLines]);

    // Derive underlined ranges from field lineage events
    const underlinedRanges = useMemo(() => {
        const fieldToShow = selectedField ?? activeField;
        if (!fieldToShow || !lineageIndex) return [];

        const events = lineageIndex.getFieldEvents(fieldToShow);
        return events.map((event) => {
            const col = event.column ?? 1;
            let endCol;
            if (event.kind === 'dropped' && event.command) {
                // For dropped events, underline the command that caused the drop
                endCol = col + event.command.length;
            } else {
                // For other events, underline the field name
                endCol = col + fieldToShow.length;
            }

            const startCol = col;
            return {
                line: event.line || 1,
                startCol,
                endCol,
                type: (event.kind === 'created' || event.kind === 'origin'
                    ? 'definition'
                    : event.kind === 'dropped'
                        ? 'dropped'
                        : 'usage') as 'definition' | 'usage' | 'dropped',
            };
        });
    }, [selectedField, activeField, lineageIndex]);

    return (
        <div className="relative h-full overflow-auto">
            <SplStaticEditor 
                code={splText} 
                onChange={handleCodeChange}
                highlightedLines={highlightedLines}
                highlightToken={selectedField ?? activeField}
                underlinedRanges={underlinedRanges}
                onSelectionChange={setSelectedText}
                onTokenHover={handleTokenHover}
                onTokenClick={handleTokenClick}
            />
            
            {/* Field Lineage Tooltip (on hover) */}
            {hoveredField && tooltipVisible && hoverPosition && !selectedField && (
                <LineageTooltip
                    fieldName={hoveredField}
                    lineage={hoverLineage}
                    position={hoverPosition}
                    visible={true}
                />
            )}
            
            {/* Object Inspector Overlay */}
            {selectedText && (
                <div className="absolute top-4 right-4 z-20">
                    <KnowledgeObjectInspector selectedText={selectedText} />
                </div>
            )}
        </div>
    );
};
