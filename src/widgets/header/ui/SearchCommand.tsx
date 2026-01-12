/**
 * Global Search Command
 *
 * Command palette for searching and navigating to Knowledge Objects.
 * Rendered in the app header across all pages.
 *
 * @module widgets/header/ui/SearchCommand
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Network, Code, ExternalLink } from "lucide-react";
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
import { buildSplunkUrl, isSplunkWebUrlAvailable } from "@/shared/config/splunk.config";

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
const MAX_RESULTS = 50;

export function SearchCommand() {
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const navigate = useNavigate();
    const { data } = useDiagramGraphQuery();

    // Check once if Splunk Web UI is configured
    const splunkAvailable = isSplunkWebUrlAvailable();

    // Keyboard shortcut to open search
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

    // Debounce search input (200ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchValue);
        }, 200);
        return () => clearTimeout(timer);
    }, [searchValue]);

    // Filter and limit results for performance
    const filteredNodes = useMemo(() => {
        if (!data?.nodes) return [];

        const search = debouncedSearch.toLowerCase().trim();
        if (!search) {
            return data.nodes.slice(0, MAX_RESULTS);
        }

        return data.nodes
            .filter(node =>
                node.label.toLowerCase().includes(search) ||
                node.type.toLowerCase().includes(search)
            )
            .slice(0, MAX_RESULTS);
    }, [data?.nodes, debouncedSearch]);

    // Check if there are more results than displayed
    const hasMoreResults = useMemo(() => {
        if (!data?.nodes) return false;

        const search = debouncedSearch.toLowerCase().trim();
        if (!search) {
            return data.nodes.length > MAX_RESULTS;
        }

        const totalMatches = data.nodes.filter(node =>
            node.label.toLowerCase().includes(search) ||
            node.type.toLowerCase().includes(search)
        ).length;
        return totalMatches > MAX_RESULTS;
    }, [data?.nodes, debouncedSearch]);

    const handleSelect = useCallback((id: string) => {
        setOpen(false);
        navigate(`/diagram/${encodeUrlParam(id)}`);
    }, [navigate]);

    /**
     * Navigate to splinter page with node ID to load SPL code
     */
    const handleLoadSpl = useCallback((id: string) => {
        setOpen(false);
        navigate('/splinter', { state: { loadNodeId: id } });
    }, [navigate]);

    const handleOpenChange = useCallback((isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            setSearchValue('');
            setDebouncedSearch('');
        }
    }, []);

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
            <CommandDialog open={open} onOpenChange={handleOpenChange}>
                <CommandInput
                    placeholder="Search knowledge objects..."
                    value={searchValue}
                    onValueChange={setSearchValue}
                />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Knowledge Objects">
                        {filteredNodes.map((node) => (
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
                                    {splunkAvailable && (() => {
                                        const splunkUrl = buildSplunkUrl({
                                            name: node.label,
                                            type: node.type,
                                            app: node.app,
                                            owner: node.owner,
                                        });
                                        return splunkUrl ? (
                                            <a
                                                href={splunkUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center h-6 w-6 p-0 rounded-md hover:bg-slate-700 text-slate-400 hover:text-sky-400 transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                                title="View in Splunk"
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </a>
                                        ) : null;
                                    })()}
                                </div>
                            </CommandItem>
                        ))}
                        {hasMoreResults && (
                            <div className="px-2 py-1.5 text-xs text-muted-foreground text-center border-t border-slate-700">
                                Showing first {MAX_RESULTS} results. Refine your search for more.
                            </div>
                        )}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}
