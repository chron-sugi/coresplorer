import React, { useMemo } from 'react';
import { useInspectorStore } from '../../../model/store/splinter.store';
import { findFoldableRanges, type FoldRange } from '../../../lib/folding/folding';
import { ChevronRight, Box, Layers, ArrowRightLeft, ArrowUpRight, ArrowDownLeft, X } from 'lucide-react';
import { useEditorStore, selectSplText } from '@/entities/spl';
import { panelHeaderVariants } from '../../splinter.variants';
import { useDiagramGraphQuery, type GraphNode } from '@/entities/snapshot';
import { Button } from '@/shared/ui/button';

/**
 * Subsearch panel for visualizing SPL query structure OR Knowledge Object dependencies.
 *
 * Modes:
 * 1. Raw SPL Mode: Displays navigable map of foldable code regions.
 * 2. KO Mode: Displays Upstream (Dependencies) and Downstream (Dependents) objects.
 */
export const SubsearchPanel = (): React.JSX.Element => {
    const code = useEditorStore(selectSplText);
    const { setHighlightedLines, selectedKnowledgeObjectId, setSelectedKnowledgeObjectId } = useInspectorStore();
    const { data: graphData } = useDiagramGraphQuery();

    // -------------------------------------------------------------------------
    // Mode 1: Knowledge Object Structure (Dependencies)
    // -------------------------------------------------------------------------
    const dependencyInfo = useMemo(() => {
        if (!selectedKnowledgeObjectId || !graphData?.nodes) return null;

        const currentNode = graphData.nodes.find(n => n.id === selectedKnowledgeObjectId);
        if (!currentNode) return null;

        // Upstream = Targets of outgoing edges from current node (Dependencies)
        // Downstream = Sources of incoming edges to current node (Dependents)
        // Note: GraphEdge has shape { source: string, target: string }
        // "A -> B" usually means "A uses B" (Flow of dependency) OR "A flows into B" (Data flow).
        // Standard convention: Search (Source) -> Index (Target) means "Search uses Index".
        
        // Dependencies (Things I use) matches outgoing edges (Source -> Target)
        const dependencies = (currentNode.edges || []).map(edge => 
            graphData.nodes.find(n => n.id === edge.target)
        ).filter(Boolean) as GraphNode[];

        // Dependents (Things that use me) matches incoming edges (Source -> Target where Target is Me)
        // We have to search all nodes to find who points to us
        const dependents = graphData.nodes.filter(node => 
            node.edges?.some(edge => edge.target === selectedKnowledgeObjectId)
        );

        return { currentNode, dependencies, dependents };
    }, [selectedKnowledgeObjectId, graphData]);

    // -------------------------------------------------------------------------
    // Mode 2: Raw SPL Structure (Subsearches)
    // -------------------------------------------------------------------------
    const ranges = useMemo(() => findFoldableRanges(code), [code]);

    const handleRangeClick = (range: FoldRange) => {
        const lines = [];
        for (let i = range.startLine; i <= range.endLine; i++) {
            lines.push(i);
        }
        setHighlightedLines(lines);
    };

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    // Render Knowledge Object View
    if (selectedKnowledgeObjectId && dependencyInfo) {
        const { currentNode, dependencies, dependents } = dependencyInfo;
        
        return (
            <div className="flex flex-col h-full bg-slate-950">
                <div className="p-3 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
                    <h3 className={panelHeaderVariants()}>
                        <ArrowRightLeft className="w-3 h-3" />
                        Dependencies
                    </h3>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-1.5 text-slate-400 hover:text-white"
                        onClick={() => setSelectedKnowledgeObjectId(null)}
                        title="Clear Knowledge Object Context"
                    >
                        <X className="w-3.5 h-3.5" />
                    </Button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Header Info */}
                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                        <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Selected Object</div>
                        <div className="font-semibold text-slate-200 truncate" title={currentNode.label}>{currentNode.label}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{currentNode.type}</div>
                    </div>

                    {/* Dependencies (Upstream) */}
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                            <ArrowUpRight className="w-3 h-3 text-blue-400" />
                            Dependencies ({dependencies.length})
                        </div>
                        {dependencies.length > 0 ? (
                            <div className="space-y-1">
                                {dependencies.map(node => (
                                    <div key={node.id} className="p-2 bg-slate-900/30 border border-slate-800/50 rounded flex flex-col gap-0.5">
                                        <span className="text-sm text-slate-300 truncate">{node.label}</span>
                                        <span className="text-[10px] text-slate-500">{node.type}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-xs text-slate-600 italic pl-1">No dependencies found.</div>
                        )}
                    </div>

                    {/* Dependents (Downstream) */}
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                            <ArrowDownLeft className="w-3 h-3 text-emerald-400" />
                            Dependents ({dependents.length})
                        </div>
                        {dependents.length > 0 ? (
                            <div className="space-y-1">
                                {dependents.map(node => (
                                    <div key={node.id} className="p-2 bg-slate-900/30 border border-slate-800/50 rounded flex flex-col gap-0.5">
                                        <span className="text-sm text-slate-300 truncate">{node.label}</span>
                                        <span className="text-[10px] text-slate-500">{node.type}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-xs text-slate-600 italic pl-1">No dependents found.</div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Render Raw SPL View
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
