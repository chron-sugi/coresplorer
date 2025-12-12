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

vi.mock('@/entities/snapshot', () => ({
    useDiagramGraphQuery: vi.fn(() => ({ data: mockGraphData }))
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
    });
});
