import React, { useMemo, useState } from 'react';
import { useInspectorStore } from '../../../model/store/splinter.store';
import { findFoldableRanges, type FoldRange } from '../../../lib/folding/folding';
import { ChevronRight, Box, Layers, ArrowRightLeft, ArrowUpRight, ArrowDownLeft, X, Search } from 'lucide-react';
import { useEditorStore, selectSplText } from '@/entities/spl';
import { panelHeaderVariants } from '../../splinter.variants';
import { useDiagramGraphQuery, type GraphNode } from '@/entities/snapshot';
import { Button } from '@/shared/ui/button';
import { useNavigate } from 'react-router-dom';
import {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from "@/shared/ui/command";
import { cn } from "@/shared/lib/utils";

/**
 * Subsearch panel for visualizing SPL query structure OR Knowledge Object dependencies.
 *
 * Modes:
 * 1. Raw SPL Mode: Displays navigable map of foldable code regions.
 *    If no regions found, displays a search bar to load a Knowledge Object.
 * 2. KO Mode: Displays Upstream (Dependencies) and Downstream (Dependents) objects.
 */
export const SubsearchPanel = (): React.JSX.Element => {
    const navigate = useNavigate();
    const code = useEditorStore(selectSplText);
    const { setHighlightedLines, selectedKnowledgeObjectId, setSelectedKnowledgeObjectId } = useInspectorStore();
    const { data: graphData } = useDiagramGraphQuery();
    const [searchQuery, setSearchQuery] = useState('');

    // -------------------------------------------------------------------------
    // Mode 1: Knowledge Object Structure (Dependencies)
    // -------------------------------------------------------------------------
    const dependencyInfo = useMemo(() => {
        if (!selectedKnowledgeObjectId || !graphData?.nodes) return null;

        const currentNode = graphData.nodes.find(n => n.id === selectedKnowledgeObjectId);
        if (!currentNode) return null;

        // Upstream = Targets of outgoing edges from current node (Dependencies)
        // Deduplicate target IDs in case multiple edges point to the same node
        const uniqueTargetIds = [...new Set((currentNode.edges || []).map(edge => edge.target))];
        const dependencies = uniqueTargetIds
            .map(targetId => graphData.nodes.find(n => n.id === targetId))
            .filter(Boolean) as GraphNode[];

        // Downstream = Sources of incoming edges to current node (Dependents)
        const dependents = graphData.nodes.filter(node => 
            node.edges?.some(edge => edge.target === selectedKnowledgeObjectId)
        );

        return { currentNode, dependencies, dependents };
    }, [selectedKnowledgeObjectId, graphData]);

    // -------------------------------------------------------------------------
    // Mode 2: Knowledge Object Searches
    // -------------------------------------------------------------------------
    const ranges = useMemo(() => findFoldableRanges(code), [code]);

    const handleRangeClick = (range: FoldRange) => {
        const lines = [];
        for (let i = range.startLine; i <= range.endLine; i++) {
            lines.push(i);
        }
        setHighlightedLines(lines);
    };

    /**
     * Search Handler
     */
    const handleSearchSelect = (id: string) => {
        // Navigate to trigger page reload/SPL update
        // The SPLinterPage useEffect will pick up loadNodeId and call setSelectedKnowledgeObjectId
        navigate('/splinter', { state: { loadNodeId: id } });
    };

    /** Types that don't have SPL code */
    const noSplTypes = ['data_model', 'lookup', 'index'];
    const hasSplCode = (type: string) => !noSplTypes.includes(type.toLowerCase());

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    const [isDependenciesOpen, setIsDependenciesOpen] = useState(true);
    const [isDependentsOpen, setIsDependentsOpen] = useState(true);

    // Render Knowledge Object View
    if (selectedKnowledgeObjectId && dependencyInfo) {
        const { currentNode, dependencies, dependents } = dependencyInfo;
        
        return (
            <div className="flex flex-col h-full">
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
                        <button 
                            onClick={() => setIsDependenciesOpen(!isDependenciesOpen)}
                            className="flex items-center gap-2 mb-2 w-full text-left group"
                        >
                            <ChevronRight className={cn("w-3 h-3 text-slate-500 transition-transform duration-200", isDependenciesOpen && "rotate-90")} />
                            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider group-hover:text-slate-300">
                                <ArrowUpRight className="w-3 h-3 text-blue-400" />
                                Dependencies ({dependencies.length})
                            </div>
                        </button>
                        
                        {isDependenciesOpen && (
                            dependencies.length > 0 ? (
                                <div className="space-y-1 pl-5">
                                    {dependencies.map(node =>
                                        hasSplCode(node.type) ? (
                                            <button
                                                key={node.id}
                                                onClick={() => handleSearchSelect(node.id)}
                                                className="w-full p-2 bg-slate-900/30 border border-slate-800/50 rounded flex flex-col gap-0.5 text-left hover:bg-slate-800 transition-colors cursor-pointer"
                                            >
                                                <span className="text-sm text-slate-300 truncate">{node.label}</span>
                                                <span className="text-[10px] text-slate-500">{node.type}</span>
                                            </button>
                                        ) : (
                                            <div key={node.id} className="p-2 bg-slate-900/30 border border-slate-800/50 rounded flex flex-col gap-0.5 opacity-50">
                                                <span className="text-sm text-slate-300 truncate">{node.label}</span>
                                                <span className="text-[10px] text-slate-500">{node.type}</span>
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : (
                                <div className="text-xs text-slate-600 italic pl-6">No dependencies found.</div>
                            )
                        )}
                    </div>

                    {/* Dependents (Downstream) */}
                    <div>
                        <button 
                            onClick={() => setIsDependentsOpen(!isDependentsOpen)}
                            className="flex items-center gap-2 mb-2 w-full text-left group"
                        >
                            <ChevronRight className={cn("w-3 h-3 text-slate-500 transition-transform duration-200", isDependentsOpen && "rotate-90")} />
                            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider group-hover:text-slate-300">
                                <ArrowDownLeft className="w-3 h-3 text-emerald-400" />
                                Dependents ({dependents.length})
                            </div>
                        </button>

                        {isDependentsOpen && (
                            dependents.length > 0 ? (
                                <div className="space-y-1 pl-5">
                                    {dependents.map(node =>
                                        hasSplCode(node.type) ? (
                                            <button
                                                key={node.id}
                                                onClick={() => handleSearchSelect(node.id)}
                                                className="w-full p-2 bg-slate-900/30 border border-slate-800/50 rounded flex flex-col gap-0.5 text-left hover:bg-slate-800 transition-colors cursor-pointer"
                                            >
                                                <span className="text-sm text-slate-300 truncate">{node.label}</span>
                                                <span className="text-[10px] text-slate-500">{node.type}</span>
                                            </button>
                                        ) : (
                                            <div key={node.id} className="p-2 bg-slate-900/30 border border-slate-800/50 rounded flex flex-col gap-0.5 opacity-50">
                                                <span className="text-sm text-slate-300 truncate">{node.label}</span>
                                                <span className="text-[10px] text-slate-500">{node.type}</span>
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : (
                                <div className="text-xs text-slate-600 italic pl-6">No dependents found.</div>
                            )
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const hasStructure = ranges.length > 0;

    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b border-slate-700 bg-slate-900/50">
                <h3 className={panelHeaderVariants()}>
                    <Layers className="w-3 h-3" />
                    Knowledge Object Searches
                </h3>
            </div>
            
            <div className="flex-1 overflow-hidden flex flex-col">
                {hasStructure ? (
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
                ) : (
                    <div className="flex-1 flex flex-col min-h-0">
                         {/* Search Bar Container */}
                         <div className="border-b border-slate-800">
                             <Command className="bg-transparent">
                                 <CommandInput 
                                    placeholder="Search knowledge objects..." 
                                    className="h-9"
                                    value={searchQuery}
                                    onValueChange={setSearchQuery}
                                />
                                 <CommandList className="max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar mt-2 border-t border-slate-800/50">
                                     <CommandEmpty className="py-6 text-center text-sm text-slate-500">
                                         No objects found.
                                     </CommandEmpty>
                                     <CommandGroup heading="Suggestions">
                                         {graphData?.nodes?.filter(node => {
                                             const noSplTypes = ['data_model', 'lookup', 'index'];
                                             return !noSplTypes.includes(node.type.toLowerCase());
                                         }).map((node) => (
                                             <CommandItem
                                                 key={node.id}
                                                 value={`${node.label} ${node.type}`}
                                                 onSelect={() => handleSearchSelect(node.id)}
                                                 className="flex items-center gap-2 py-2 cursor-pointer data-[selected=true]:bg-slate-800"
                                             >
                                                 <Search className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                                                 <div className="flex flex-col min-w-0">
                                                     <span className="truncate text-sm text-slate-300">{node.label}</span>
                                                     <span className="text-[10px] text-slate-500 truncate">{node.type}</span>
                                                 </div>
                                             </CommandItem>
                                         ))}
                                     </CommandGroup>
                                 </CommandList>
                             </Command>
                         </div>
                         
                         {/* Helper Text */}
                         {!searchQuery && (
                             <div className="p-4 text-center">
                                 <p className="text-xs text-slate-500 mb-2">
                                     No structural elements found in the current query.
                                 </p>
                                 <p className="text-[10px] text-slate-600">
                                     Use the search bar above to load a Knowledge Object and view its dependencies.
                                 </p>
                             </div>
                         )}
                    </div>
                )}
            </div>
        </div>
    );
};
