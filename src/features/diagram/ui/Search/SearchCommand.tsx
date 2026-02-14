/**
 * Search command wrapper
 *
 * Small wrapper used to render the command/search UI inside the diagram
 * (re-uses global command primitives).
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
import { useDiagramStore } from "../../model/store/diagram.store";
import { useDiagramGraphQuery } from "@/entities/snapshot";
import { useSplIndexQuery } from "@/entities/knowledge-object";
import { KEYBOARD_SHORTCUTS } from '../../model/constants/diagram.keyboard.constants';
import { kbdVariants } from '@/shared/ui/kbd.variants';

export function SearchCommand() {
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const setCoreId = useDiagramStore(state => state.setCoreId);
    const { data } = useDiagramGraphQuery();
    const { data: splIndex } = useSplIndexQuery();
    const navigate = useNavigate();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === KEYBOARD_SHORTCUTS.COMMAND_PALETTE.KEY && (e.metaKey || e.ctrlKey)) {
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
        navigate(`/diagram/${encodeURIComponent(id)}`);
    };

    const search = searchValue.toLowerCase().trim();

    return (
        <>
            <Button
                variant="outline"
                className="w-full justify-start text-muted-foreground bg-muted/50 border-border hover:bg-accent hover:text-foreground sm:w-[300px] lg:w-[400px]"
                onClick={() => setOpen(true)}
            >
                <Search className="mr-2 h-4 w-4" />
                <span>Search objects...</span>
                <kbd className={kbdVariants()}>
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput
                    placeholder="Search by name or SPL..."
                    value={searchValue}
                    onValueChange={setSearchValue}
                />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Knowledge Objects">
                        {data && data.nodes && data.nodes.map((node) => {
                            const splCode = splIndex?.[node.id];
                            const matchesLabel = search && node.label.toLowerCase().includes(search);
                            const matchesType = search && node.type.toLowerCase().includes(search);
                            const matchesSpl = search && splCode ? splCode.toLowerCase().includes(search) : false;
                            const showSplBadge = matchesSpl && !matchesLabel && !matchesType;

                            return (
                                <CommandItem
                                    key={node.id}
                                    value={`${node.label} ${node.type} ${splCode ?? ''}`}
                                    onSelect={() => handleSelect(node.id)}
                                >
                                    <Search className="mr-2 h-4 w-4" />
                                    <span>{node.label}</span>
                                    <span className="ml-2 text-xs text-muted-foreground">({node.type})</span>
                                    {showSplBadge && (
                                        <span className="ml-2 text-xs text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0">
                                            SPL match
                                        </span>
                                    )}
                                </CommandItem>
                            );
                        })}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}

