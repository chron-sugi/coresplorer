import React, { useMemo, useState } from 'react';
import { useInspectorStore } from '../../../model/store/splinter.store';
import { ChevronRight, Layers, ArrowRightLeft, ArrowUpRight, ArrowDownLeft, X, Search } from 'lucide-react';
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
 * Panel for searching and viewing Knowledge Object dependencies.
 *
 * Modes:
 * 1. Search Mode: Displays a search bar to find and load Knowledge Objects.
 * 2. KO Mode: When a KO is selected, displays its dependencies (upstream) and dependents (downstream).
 */
export const SubsearchPanel = (): React.JSX.Element => {
    const navigate = useNavigate();
    const { selectedKnowledgeObjectId, setSelectedKnowledgeObjectId } = useInspectorStore();
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
        // Exclude self-references
        const uniqueTargetIds = [...new Set((currentNode.edges || []).map(edge => edge.target))]
            .filter(id => id !== selectedKnowledgeObjectId);
        const dependencies = uniqueTargetIds
            .map(targetId => graphData.nodes.find(n => n.id === targetId))
            .filter(Boolean) as GraphNode[];

        // Downstream = Sources of incoming edges to current node (Dependents)
        // Exclude self-references
        const dependents = graphData.nodes.filter(node =>
            node.id !== selectedKnowledgeObjectId &&
            node.edges?.some(edge => edge.target === selectedKnowledgeObjectId)
        );

        return { currentNode, dependencies, dependents };
    }, [selectedKnowledgeObjectId, graphData]);

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
                <div className="p-3 border-b border-border bg-card/50 flex justify-between items-center">
                    <h3 className={panelHeaderVariants()}>
                        <ArrowRightLeft className="w-3 h-3" />
                        Dependencies
                    </h3>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-1.5 text-muted-foreground hover:text-white"
                        onClick={() => setSelectedKnowledgeObjectId(null)}
                        title="Clear Knowledge Object Context"
                    >
                        <X className="w-3.5 h-3.5" />
                    </Button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Header Info */}
                    <div className="bg-card/50 p-3 rounded-lg border border-border">
                        <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Selected Object</div>
                        <div className="font-semibold text-foreground truncate" title={currentNode.label}>{currentNode.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{currentNode.type}</div>
                    </div>

                    {/* Dependencies (Upstream) */}
                    <div>
                        <button 
                            onClick={() => setIsDependenciesOpen(!isDependenciesOpen)}
                            className="flex items-center gap-2 mb-2 w-full text-left group"
                        >
                            <ChevronRight className={cn("w-3 h-3 text-muted-foreground transition-transform duration-200", isDependenciesOpen && "rotate-90")} />
                            <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider group-hover:text-foreground">
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
                                                className="w-full p-2 bg-card/30 border border-border/50 rounded flex flex-col gap-0.5 text-left hover:bg-accent transition-colors cursor-pointer"
                                            >
                                                <span className="text-sm text-foreground truncate">{node.label}</span>
                                                <span className="text-[10px] text-muted-foreground">{node.type}</span>
                                            </button>
                                        ) : (
                                            <div key={node.id} className="p-2 bg-card/30 border border-border/50 rounded flex flex-col gap-0.5 opacity-50">
                                                <span className="text-sm text-foreground truncate">{node.label}</span>
                                                <span className="text-[10px] text-muted-foreground">{node.type}</span>
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : (
                                <div className="text-xs text-muted-foreground italic pl-6">No dependencies found.</div>
                            )
                        )}
                    </div>

                    {/* Dependents (Downstream) */}
                    <div>
                        <button 
                            onClick={() => setIsDependentsOpen(!isDependentsOpen)}
                            className="flex items-center gap-2 mb-2 w-full text-left group"
                        >
                            <ChevronRight className={cn("w-3 h-3 text-muted-foreground transition-transform duration-200", isDependentsOpen && "rotate-90")} />
                            <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider group-hover:text-foreground">
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
                                                className="w-full p-2 bg-card/30 border border-border/50 rounded flex flex-col gap-0.5 text-left hover:bg-accent transition-colors cursor-pointer"
                                            >
                                                <span className="text-sm text-foreground truncate">{node.label}</span>
                                                <span className="text-[10px] text-muted-foreground">{node.type}</span>
                                            </button>
                                        ) : (
                                            <div key={node.id} className="p-2 bg-card/30 border border-border/50 rounded flex flex-col gap-0.5 opacity-50">
                                                <span className="text-sm text-foreground truncate">{node.label}</span>
                                                <span className="text-[10px] text-muted-foreground">{node.type}</span>
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : (
                                <div className="text-xs text-muted-foreground italic pl-6">No dependents found.</div>
                            )
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b border-border bg-card/50">
                <h3 className={panelHeaderVariants()}>
                    <Layers className="w-3 h-3" />
                    Knowledge Object Searches
                </h3>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Search Bar Container */}
                    <div className="border-b border-border">
                        <Command className="bg-transparent">
                            <CommandInput
                                placeholder="Search knowledge objects..."
                                className="h-9"
                                value={searchQuery}
                                onValueChange={setSearchQuery}
                            />
                            <CommandList className="max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar mt-2 border-t border-border/50">
                                <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
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
                                            className="flex items-center gap-2 py-2 cursor-pointer data-[selected=true]:bg-accent"
                                        >
                                            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                            <div className="flex flex-col min-w-0">
                                                <span className="truncate text-sm text-foreground">{node.label}</span>
                                                <span className="text-[10px] text-muted-foreground truncate">{node.type}</span>
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
                            <p className="text-xs text-muted-foreground mb-2">
                                No knowledge objects found in the current query.
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                                Use the search bar above to load a Knowledge Object and view its dependencies.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
