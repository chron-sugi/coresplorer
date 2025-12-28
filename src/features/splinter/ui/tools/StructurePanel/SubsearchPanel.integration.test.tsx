import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SubsearchPanel } from './SubsearchPanel';
import { useInspectorStore } from '../../../model/store/splinter.store';
import { useEditorStore } from '@/entities/spl';
import { RouterWrapper } from '@/test/utils/RouterWrapper';

describe('SubsearchPanel Integration', () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });

    beforeEach(() => {
        useEditorStore.setState({ splText: '' });
        useInspectorStore.setState({
            highlightedLines: [],
            activeCommand: null,
            activeField: null,
            selectedText: null
        });
    });

    it('displays foldable ranges for subsearches using real domain logic', () => {
        const splWithSubsearch = `search index=main
| join host [
    search index=network
    | stats count by host
]`;

        useEditorStore.setState({ splText: splWithSubsearch });
        render(
            <QueryClientProvider client={queryClient}>
                <RouterWrapper>
                    <SubsearchPanel />
                </RouterWrapper>
            </QueryClientProvider>
        );

        // The subsearch starts at line 2 and ends at line 5
        // We use a custom matcher to handle potential whitespace issues in JSDOM rendering
        expect(screen.getByText((content) => content.replace(/\s+/g, '').includes('Subsearch(Lines2-5)'))).toBeInTheDocument();
    });

    it('highlights the range when clicked', () => {
        const splWithSubsearch = `search index=main
| join host [
    search index=network
]`;

        useEditorStore.setState({ splText: splWithSubsearch });
        render(
            <QueryClientProvider client={queryClient}>
                <RouterWrapper>
                    <SubsearchPanel />
                </RouterWrapper>
            </QueryClientProvider>
        );

        const rangeItem = screen.getByText((content) => content.replace(/\s+/g, '').includes('Subsearch(Lines2-4)'));
        fireEvent.click(rangeItem);

        const state = useInspectorStore.getState();
        // It should highlight lines 2, 3, 4
        expect(state.highlightedLines).toEqual([2, 3, 4]);
    });

    it('shows "No foldable ranges" for flat SPL', () => {
        const flatSpl = `search index=main | stats count by host`;

        useEditorStore.setState({ splText: flatSpl });
        render(
            <QueryClientProvider client={queryClient}>
                <RouterWrapper>
                    <SubsearchPanel />
                </RouterWrapper>
            </QueryClientProvider>
        );

        expect(screen.getByText(/No knowledge objects found in the current query/i)).toBeInTheDocument();
    });
});
