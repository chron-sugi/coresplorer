/**
 * Global Search Command
 *
 * Command palette for searching and navigating to Knowledge Objects.
 * Rendered in the app header across all pages.
 *
 * @module widgets/header/ui/SearchCommand
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Network, Code } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/shared/ui/command";
import { useDiagramGraphQuery } from "@/entities/snapshot";
import { encodeUrlParam } from "@/shared/lib";

/**
 * Check if a node type typically has SPL code.
 * Some types (lookups, data_models, indexes) don't have SPL.
 */
const nodeHasSpl = (type: string): boolean => {
    const noSplTypes = ['data_model', 'lookup', 'index'];
    return !noSplTypes.includes(type.toLowerCase());
};

/**
 * Global search command component
 *
 * Provides a command palette (⌘K) for searching Knowledge Objects
 * and navigating to their diagram view.
 */
export function SearchCommand() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { data } = useDiagramGraphQuery();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const handleSelect = (id: string) => {
        // setCoreId(id); // Don't set store directly, let URL drive it
        setOpen(false);
        navigate(`/diagram/${encodeUrlParam(id)}`);
    };

    /**
     * Navigate to splinter page with node ID to load SPL code
     */
    const handleLoadSpl = (id: string) => {
        setOpen(false);
        navigate('/splinter', { state: { loadNodeId: id } });
    };

    return (
        <>
            <Button
                variant="outline"
                className="w-full max-w-[300px] lg:max-w-[400px] justify-start text-slate-400 bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:text-slate-300"
                onClick={() => setOpen(true)}
            >
                <Search className="mr-2 h-4 w-4" />
                <span>Search objects...</span>

            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Knowledge Objects">
                        {data && data.nodes && data.nodes.map((node) => (
                            <CommandItem
                                key={node.id}
                                value={`${node.label} ${node.type}`}
                                onSelect={() => handleSelect(node.id)}
                                className="flex items-center justify-between"
                            >
                                <div className="flex items-center flex-1 min-w-0">
                                    <Search className="mr-2 h-4 w-4 shrink-0" />
                                    <span className="truncate">{node.label}</span>
                                    <span className="ml-2 text-xs text-muted-foreground shrink-0">({node.type})</span>
                                </div>
                                <div className="flex gap-1 ml-2 shrink-0">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 hover:bg-slate-700"
                                        onClick={(e) => { e.stopPropagation(); handleSelect(node.id); }}
                                        title="View in diagram"
                                    >
                                        <Network className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                                        disabled={!nodeHasSpl(node.type)}
                                        onClick={(e) => { e.stopPropagation(); handleLoadSpl(node.id); }}
                                        title={nodeHasSpl(node.type) ? "Load SPL code" : "No SPL code available"}
                                    >
                                        <Code className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}
