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
import { Search } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/shared/ui/command";
import { useDiagramStore } from "@/features/diagram";
import { useDiagramGraphQuery } from "@/entities/snapshot";
import { kbdVariants } from '@/shared/ui/kbd.variants';
import { encodeUrlParam } from "@/shared/lib";

/**
 * Global search command component
 *
 * Provides a command palette (⌘K) for searching Knowledge Objects
 * and navigating to their diagram view.
 */
export function SearchCommand() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const setCoreId = useDiagramStore(state => state.setCoreId);
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
        setCoreId(id);
        setOpen(false);
        navigate(`/diagram/${encodeUrlParam(id)}`);
    };

    return (
        <>
            <Button
                variant="outline"
                className="w-full justify-start text-slate-400 bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:text-slate-300 sm:w-[300px] lg:w-[400px]"
                onClick={() => setOpen(true)}
            >
                <Search className="mr-2 h-4 w-4" />
                <span>Search objects...</span>
                <kbd className={kbdVariants()}>
                    <span className="text-xs">⌘</span>K
                </kbd>
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
                            >
                                <Search className="mr-2 h-4 w-4" />
                                <span>{node.label}</span>
                                <span className="ml-2 text-xs text-muted-foreground">({node.type})</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}
