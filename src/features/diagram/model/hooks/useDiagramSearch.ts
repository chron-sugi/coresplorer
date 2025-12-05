/**
 * Diagram search hook
 *
 * Provides search UI state and suggestion generation for the diagram's
 * quick-search component. Supports keyboard shortcut activation.
 * Uses Zod for runtime validation of suggestions.
 */
import { useState, useEffect, useCallback } from 'react';
import { DiagramSearchSuggestionSchema } from '../diagram.schemas';
import type { DiagramSearchSuggestion } from '../diagram.schemas';
import { KEYBOARD_SHORTCUTS } from '../constants/diagram.keyboard.constants';

/** Node type for search - minimal interface for diagram nodes */
type SearchableNode = {
    id: string;
    data: {
        label?: string;
        object_type?: string;
        app?: string;
    };
};

interface UseDiagramSearchProps {
    nodes: SearchableNode[];
    onSelectNode: (nodeId: string) => void;
}

interface UseDiagramSearchReturn {
    isOpen: boolean;
    query: string;
    suggestions: DiagramSearchSuggestion[];
    openSearch: () => void;
    closeSearch: () => void;
    setQuery: (query: string) => void;
    handleSelectSuggestion: (id: string) => void;
}

export function useDiagramSearch({
    nodes,
    onSelectNode
}: UseDiagramSearchProps): UseDiagramSearchReturn {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<DiagramSearchSuggestion[]>([]);

    const openSearch = useCallback(() => setIsOpen(true), []);
    
    const closeSearch = useCallback(() => {
        setIsOpen(false);
        setQuery('');
        setSuggestions([]);
    }, []);

    const handleSearch = useCallback((newQuery: string) => {
        setQuery(newQuery);
        if (!newQuery.trim()) {
            setSuggestions([]);
            return;
        }
        
        const rawSuggestions = nodes
            .filter(node => {
                const label = (node.data.label as string) || '';
                return label.toLowerCase().includes(newQuery.toLowerCase());
            })
            .map(node => ({
                id: node.id,
                label: node.data.label as string,
                type: node.data.object_type as string | undefined,
                app: node.data.app as string | undefined,
            }));
        
        // Validate suggestions with Zod
        const validated: DiagramSearchSuggestion[] = [];
        for (const suggestion of rawSuggestions) {
            const result = DiagramSearchSuggestionSchema.safeParse(suggestion);
            if (result.success) {
                validated.push(result.data);
            }
        }
        
        setSuggestions(validated);
    }, [nodes]);

    const handleSelectSuggestion = useCallback((suggestionId: string) => {
        onSelectNode(suggestionId);
        closeSearch();
    }, [onSelectNode, closeSearch]);

    // Keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === KEYBOARD_SHORTCUTS.SEARCH.KEY) {
                e.preventDefault();
                openSearch();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [openSearch]);

    return {
        isOpen,
        query,
        suggestions,
        openSearch,
        closeSearch,
        setQuery: handleSearch,
        handleSelectSuggestion
    };
}
