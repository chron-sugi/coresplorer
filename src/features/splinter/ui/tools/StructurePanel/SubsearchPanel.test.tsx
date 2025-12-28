import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SubsearchPanel } from './SubsearchPanel';
import { useInspectorStore } from '../../../model/store/splinter.store';
import { findFoldableRanges } from '../../../lib/folding/folding';
import { useEditorStore } from '@/entities/spl';

vi.mock('../../../lib/folding/folding');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate
}));

// Mock snapshot entity
const mockGraphData = {
    nodes: [
        { id: 'node1', label: 'Node 1', type: 'saved_search', edges: [{ source: 'node1', target: 'node2' }] },
        { id: 'node2', label: 'Node 2', type: 'index', edges: [] },
        { id: 'node3', label: 'Node 3', type: 'dashboard', edges: [{ source: 'node3', target: 'node1' }] }
    ]
};

const mockUseDiagramGraphQuery = vi.fn(() => ({ data: mockGraphData }));
vi.mock('@/entities/snapshot', () => ({
    useDiagramGraphQuery: () => mockUseDiagramGraphQuery()
}));

// Mock ResizeObserver for Command component
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('SubsearchPanel', () => {
    const mockSetHighlightedLines = vi.fn();
    const mockSetSelectedKnowledgeObjectId = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset graph data mock to default
        mockUseDiagramGraphQuery.mockReturnValue({ data: mockGraphData });
        useEditorStore.setState({ splText: 'mock code' });
        useInspectorStore.setState({
            highlightedLines: [],
            setHighlightedLines: mockSetHighlightedLines,
            selectedKnowledgeObjectId: null,
            setSelectedKnowledgeObjectId: mockSetSelectedKnowledgeObjectId
        });
    });

    describe('Raw SPL Mode', () => {
        it('renders search bar when no ranges found', () => {
            (findFoldableRanges as unknown as ReturnType<typeof vi.fn>).mockReturnValue([]);
            render(<SubsearchPanel />);
            
            // Should show helper text and search input
            expect(screen.getByText('No structural elements found in the current query.')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Search knowledge objects...')).toBeInTheDocument();
        });

        it('navigates when a search result is selected', async () => {
            (findFoldableRanges as unknown as ReturnType<typeof vi.fn>).mockReturnValue([]);
            render(<SubsearchPanel />);
            
            const input = screen.getByPlaceholderText('Search knowledge objects...');
            fireEvent.change(input, { target: { value: 'Node 1' } });
            
            // Command item should be visible (mock data)
            // Note: cmkd might render items asynchronously or require specific interactions in tests,
            // but assuming standard rendering behavior for now.
            // We might need to select it.
            
            // In a real browser we'd click, but with cmdk explicitly finding by text might be tricky if it's virtualized.
            // Shadcn Command usually renders valid options. 
            const option = await screen.findByText('Node 1');
            fireEvent.click(option);

            expect(mockNavigate).toHaveBeenCalledWith('/splinter', { state: { loadNodeId: 'node1' } });
        });

        it('renders ranges correctly', () => {
            (findFoldableRanges as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
                { startLine: 1, endLine: 5, type: 'subsearch' },
                { startLine: 10, endLine: 15, type: 'subsearch' }
            ]);

            render(<SubsearchPanel />);

            expect(screen.getByText('Subsearch (Lines 1-5)')).toBeInTheDocument();
            expect(screen.getByText('Subsearch (Lines 10-15)')).toBeInTheDocument();
        });

        it('highlights lines on click', () => {
            (findFoldableRanges as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
                { startLine: 2, endLine: 4, type: 'subsearch' }
            ]);

            render(<SubsearchPanel />);
            
            const button = screen.getAllByRole('button')[0]; // First button is the range
            fireEvent.click(button);

            // Should highlight lines 2, 3, 4
            expect(mockSetHighlightedLines).toHaveBeenCalledWith([2, 3, 4]);
        });
    });

    describe('Knowledge Object Mode', () => {
        beforeEach(() => {
            useInspectorStore.setState({
                selectedKnowledgeObjectId: 'node1'
            });
        });

        it('renders selected object info', () => {
            render(<SubsearchPanel />);
            expect(screen.getByText('Selected Object')).toBeInTheDocument();
            expect(screen.getByText('Node 1')).toBeInTheDocument();
        });

        it('renders dependencies (upstream)', () => {
            render(<SubsearchPanel />);
            // Node 1 -> Node 2 (Node 1 uses Node 2)
            expect(screen.getByText('Dependencies (1)')).toBeInTheDocument();
            expect(screen.getByText('Node 2')).toBeInTheDocument();
        });

        it('renders dependents (downstream)', () => {
            render(<SubsearchPanel />);
            // Node 3 -> Node 1 (Node 3 uses Node 1)
            expect(screen.getByText('Dependents (1)')).toBeInTheDocument();
            expect(screen.getByText('Node 3')).toBeInTheDocument();
        });

        it('clears selection on close button click', () => {
            render(<SubsearchPanel />);
            const clearButton = screen.getByTitle('Clear Knowledge Object Context');
            fireEvent.click(clearButton);
            expect(mockSetSelectedKnowledgeObjectId).toHaveBeenCalledWith(null);
        });

        it('handles case with no dependencies/dependents', () => {
            useInspectorStore.setState({
                selectedKnowledgeObjectId: 'node2' // Node 2 has no edges out, node1 points to it
            });

            render(<SubsearchPanel />);
            expect(screen.getByText('Node 2')).toBeInTheDocument();
            // Node 2 has 0 dependencies
            expect(screen.getByText('Dependencies (0)')).toBeInTheDocument();
            expect(screen.getByText('No dependencies found.')).toBeInTheDocument();

            // Node 1 points to Node 2, so 1 dependent
            expect(screen.getByText('Dependents (1)')).toBeInTheDocument();
            expect(screen.getByText('Node 1')).toBeInTheDocument();
        });

        it('collapses dependencies section when header clicked', () => {
            render(<SubsearchPanel />);

            // Dependencies section should be open by default
            expect(screen.getByText('Node 2')).toBeInTheDocument();

            // Click the dependencies header to collapse
            const dependenciesHeader = screen.getByText('Dependencies (1)').closest('button');
            fireEvent.click(dependenciesHeader!);

            // Node 2 should no longer be visible (collapsed)
            expect(screen.queryByText('Node 2')).not.toBeInTheDocument();
        });

        it('collapses dependents section when header clicked', () => {
            render(<SubsearchPanel />);

            // Dependents section should be open by default
            expect(screen.getByText('Node 3')).toBeInTheDocument();

            // Click the dependents header to collapse
            const dependentsHeader = screen.getByText('Dependents (1)').closest('button');
            fireEvent.click(dependentsHeader!);

            // Node 3 should no longer be visible (collapsed)
            expect(screen.queryByText('Node 3')).not.toBeInTheDocument();
        });

        it('expands collapsed section when header clicked again', () => {
            render(<SubsearchPanel />);

            const dependenciesHeader = screen.getByText('Dependencies (1)').closest('button');

            // Collapse
            fireEvent.click(dependenciesHeader!);
            expect(screen.queryByText('Node 2')).not.toBeInTheDocument();

            // Expand again
            fireEvent.click(dependenciesHeader!);
            expect(screen.getByText('Node 2')).toBeInTheDocument();
        });
    });

    describe('Edge Deduplication', () => {
        it('deduplicates dependencies when multiple edges point to same target', () => {
            // Create a node with duplicate edges to the same target
            const mockGraphDataWithDuplicates = {
                nodes: [
                    {
                        id: 'nodeA',
                        label: 'Node A',
                        type: 'saved_search',
                        app: 'search',
                        owner: 'admin',
                        last_modified: '2024-01-01T00:00:00Z',
                        edges: [
                            { source: 'nodeA', target: 'nodeB' },
                            { source: 'nodeA', target: 'nodeB' }, // Duplicate edge
                            { source: 'nodeA', target: 'nodeC' },
                            { source: 'nodeA', target: 'nodeB' }  // Another duplicate
                        ]
                    },
                    { id: 'nodeB', label: 'Node B', type: 'macro', app: 'search', owner: 'admin', last_modified: '2024-01-01T00:00:00Z', edges: [] },
                    { id: 'nodeC', label: 'Node C', type: 'data_model', app: 'search', owner: 'admin', last_modified: '2024-01-01T00:00:00Z', edges: [] }
                ]
            };

            mockUseDiagramGraphQuery.mockReturnValue({ data: mockGraphDataWithDuplicates });

            useInspectorStore.setState({
                selectedKnowledgeObjectId: 'nodeA'
            });

            render(<SubsearchPanel />);

            // Should show count of 2 unique dependencies (nodeB and nodeC), not 4
            expect(screen.getByText('Dependencies (2)')).toBeInTheDocument();

            // Node B should appear only once in the DOM, despite 3 edges pointing to it
            const nodeBElements = screen.getAllByText('Node B');
            expect(nodeBElements).toHaveLength(1);

            // Node C should also appear once
            const nodeCElements = screen.getAllByText('Node C');
            expect(nodeCElements).toHaveLength(1);
        });

        it('handles deduplicated dependencies with mixed node types', () => {
            const mockGraphDataMixed = {
                nodes: [
                    {
                        id: 'dashboard1',
                        label: 'Dashboard 1',
                        type: 'dashboard',
                        app: 'search',
                        owner: 'admin',
                        last_modified: '2024-01-01T00:00:00Z',
                        edges: [
                            { source: 'dashboard1', target: 'search1' },
                            { source: 'dashboard1', target: 'lookup1' },
                            { source: 'dashboard1', target: 'search1' }, // Duplicate
                            { source: 'dashboard1', target: 'lookup1' }  // Duplicate
                        ]
                    },
                    { id: 'search1', label: 'Search 1', type: 'saved_search', app: 'search', owner: 'admin', last_modified: '2024-01-01T00:00:00Z', edges: [] },
                    { id: 'lookup1', label: 'Lookup 1', type: 'lookup', app: 'search', owner: 'admin', last_modified: '2024-01-01T00:00:00Z', edges: [] }
                ]
            };

            mockUseDiagramGraphQuery.mockReturnValue({ data: mockGraphDataMixed });

            useInspectorStore.setState({
                selectedKnowledgeObjectId: 'dashboard1'
            });

            render(<SubsearchPanel />);

            // Should show 2 unique dependencies
            expect(screen.getByText('Dependencies (2)')).toBeInTheDocument();

            // Both dependencies should appear exactly once
            expect(screen.getAllByText('Search 1')).toHaveLength(1);
            expect(screen.getAllByText('Lookup 1')).toHaveLength(1);
        });

        it('handles node with no duplicate edges correctly', () => {
            const mockGraphDataNoDupes = {
                nodes: [
                    {
                        id: 'node1',
                        label: 'Node 1',
                        type: 'saved_search',
                        app: 'search',
                        owner: 'admin',
                        last_modified: '2024-01-01T00:00:00Z',
                        edges: [
                            { source: 'node1', target: 'node2' },
                            { source: 'node1', target: 'node3' }
                        ]
                    },
                    { id: 'node2', label: 'Node 2', type: 'macro', app: 'search', owner: 'admin', last_modified: '2024-01-01T00:00:00Z', edges: [] },
                    { id: 'node3', label: 'Node 3', type: 'alert', app: 'search', owner: 'admin', last_modified: '2024-01-01T00:00:00Z', edges: [] }
                ]
            };

            mockUseDiagramGraphQuery.mockReturnValue({ data: mockGraphDataNoDupes });

            useInspectorStore.setState({
                selectedKnowledgeObjectId: 'node1'
            });

            render(<SubsearchPanel />);

            // Should show 2 dependencies
            expect(screen.getByText('Dependencies (2)')).toBeInTheDocument();

            // Each should appear once
            expect(screen.getAllByText('Node 2')).toHaveLength(1);
            expect(screen.getAllByText('Node 3')).toHaveLength(1);
        });
    });

    describe('Mode Transitions', () => {
        it('switches from Raw SPL mode to KO mode when object selected', () => {
            (findFoldableRanges as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
                { startLine: 1, endLine: 5, type: 'subsearch' }
            ]);

            const { rerender } = render(<SubsearchPanel />);

            // Initially in Raw SPL mode - shows subsearch
            expect(screen.getByText('Subsearch (Lines 1-5)')).toBeInTheDocument();
            expect(screen.queryByText('Dependencies')).not.toBeInTheDocument();

            // Select a KO
            useInspectorStore.setState({ selectedKnowledgeObjectId: 'node1' });
            rerender(<SubsearchPanel />);

            // Now in KO mode
            expect(screen.queryByText('Subsearch (Lines 1-5)')).not.toBeInTheDocument();
            expect(screen.getByText('Dependencies')).toBeInTheDocument();
            expect(screen.getByText('Node 1')).toBeInTheDocument();
        });

        it('switches from KO mode back to Raw SPL mode when cleared', () => {
            useInspectorStore.setState({ selectedKnowledgeObjectId: 'node1' });
            (findFoldableRanges as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
                { startLine: 1, endLine: 5, type: 'subsearch' }
            ]);

            const { rerender } = render(<SubsearchPanel />);

            // Initially in KO mode
            expect(screen.getByText('Dependencies')).toBeInTheDocument();

            // Clear selection
            useInspectorStore.setState({ selectedKnowledgeObjectId: null });
            rerender(<SubsearchPanel />);

            // Back to Raw SPL mode
            expect(screen.queryByText('Dependencies')).not.toBeInTheDocument();
            expect(screen.getByText('Subsearch (Lines 1-5)')).toBeInTheDocument();
        });

        it('shows search bar when no ranges and no KO selected', () => {
            (findFoldableRanges as unknown as ReturnType<typeof vi.fn>).mockReturnValue([]);
            useInspectorStore.setState({ selectedKnowledgeObjectId: null });

            render(<SubsearchPanel />);

            expect(screen.getByPlaceholderText('Search knowledge objects...')).toBeInTheDocument();
            expect(screen.getByText('No structural elements found in the current query.')).toBeInTheDocument();
        });
    });

    describe('Search Filtering', () => {
        beforeEach(() => {
            (findFoldableRanges as unknown as ReturnType<typeof vi.fn>).mockReturnValue([]);
            useInspectorStore.setState({ selectedKnowledgeObjectId: null });
        });

        it('filters search results based on input', async () => {
            render(<SubsearchPanel />);

            const input = screen.getByPlaceholderText('Search knowledge objects...');

            // Initially all filterable nodes should be available
            // (data_model, lookup, index are filtered out)
            expect(screen.getByText('Node 1')).toBeInTheDocument(); // saved_search
            expect(screen.getByText('Node 3')).toBeInTheDocument(); // dashboard

            // Type to filter
            fireEvent.change(input, { target: { value: 'Node 1' } });

            // cmdk filters client-side, Node 1 should still be visible
            expect(screen.getByText('Node 1')).toBeInTheDocument();
        });

        it('filters out data_model, lookup, and index types from search', () => {
            render(<SubsearchPanel />);

            // Node 2 is type 'index' - should not appear in search results
            // Check that saved_search and dashboard types appear
            expect(screen.getByText('Node 1')).toBeInTheDocument(); // saved_search
            expect(screen.getByText('Node 3')).toBeInTheDocument(); // dashboard

            // Node 2 (index type) should not be in the suggestions
            const suggestions = screen.getAllByText(/Node/);
            const node2InSuggestions = suggestions.some(el => el.textContent === 'Node 2');
            expect(node2InSuggestions).toBe(false);
        });

        it('hides helper text when search query is entered', () => {
            render(<SubsearchPanel />);

            // Helper text visible initially
            expect(screen.getByText('No structural elements found in the current query.')).toBeInTheDocument();

            const input = screen.getByPlaceholderText('Search knowledge objects...');
            fireEvent.change(input, { target: { value: 'test' } });

            // Helper text should be hidden
            expect(screen.queryByText('No structural elements found in the current query.')).not.toBeInTheDocument();
        });

        it('shows empty state when no results match', async () => {
            render(<SubsearchPanel />);

            const input = screen.getByPlaceholderText('Search knowledge objects...');
            fireEvent.change(input, { target: { value: 'nonexistent query xyz' } });

            // Should show empty state
            expect(screen.getByText('No objects found.')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('has accessible panel header', () => {
            (findFoldableRanges as unknown as ReturnType<typeof vi.fn>).mockReturnValue([]);
            render(<SubsearchPanel />);

            expect(screen.getByText('Knowledge Object Searches')).toBeInTheDocument();
        });

        it('has accessible clear button with title', () => {
            useInspectorStore.setState({ selectedKnowledgeObjectId: 'node1' });
            render(<SubsearchPanel />);

            const clearButton = screen.getByTitle('Clear Knowledge Object Context');
            expect(clearButton).toBeInTheDocument();
        });

        it('range buttons are keyboard accessible', () => {
            (findFoldableRanges as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
                { startLine: 1, endLine: 5, type: 'subsearch' }
            ]);

            render(<SubsearchPanel />);

            const rangeButton = screen.getByText('Subsearch (Lines 1-5)').closest('button');
            expect(rangeButton).toBeInTheDocument();
            expect(rangeButton?.tagName).toBe('BUTTON');
        });

        it('collapse/expand buttons are keyboard accessible', () => {
            useInspectorStore.setState({ selectedKnowledgeObjectId: 'node1' });
            render(<SubsearchPanel />);

            const dependenciesButton = screen.getByText('Dependencies (1)').closest('button');
            const dependentsButton = screen.getByText('Dependents (1)').closest('button');

            expect(dependenciesButton?.tagName).toBe('BUTTON');
            expect(dependentsButton?.tagName).toBe('BUTTON');
        });

        it('search input is accessible', () => {
            (findFoldableRanges as unknown as ReturnType<typeof vi.fn>).mockReturnValue([]);
            render(<SubsearchPanel />);

            const input = screen.getByPlaceholderText('Search knowledge objects...');
            expect(input).toBeInTheDocument();
            expect(input.tagName).toBe('INPUT');
        });
    });
});
