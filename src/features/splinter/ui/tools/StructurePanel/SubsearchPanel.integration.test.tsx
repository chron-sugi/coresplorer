import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SubsearchPanel } from './SubsearchPanel';
import { useInspectorStore } from '../../../model/store/splinter.store';
import { RouterWrapper } from '@/test/utils/RouterWrapper';

describe('SubsearchPanel Integration', () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });

    beforeEach(() => {
        useInspectorStore.setState({
            highlightedLines: [],
            activeCommand: null,
            activeField: null,
            selectedText: null,
            selectedKnowledgeObjectId: null
        });
    });

    it('shows search bar when no KO is selected', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <RouterWrapper>
                    <SubsearchPanel />
                </RouterWrapper>
            </QueryClientProvider>
        );

        expect(screen.getByText(/No knowledge objects found in the current query/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Search knowledge objects...')).toBeInTheDocument();
    });
});
