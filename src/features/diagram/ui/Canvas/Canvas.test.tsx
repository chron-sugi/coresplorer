import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiagramCanvas } from './Canvas';
import * as DiagramStore from '../../model/store/diagram.store';
import * as DiagramDataHook from '../../model/hooks/useDiagramData';
import * as DiagramLayoutHook from '../../model/hooks/useDiagramLayout';
import * as GraphHighlightingHook from '../../model/hooks/useGraphHighlighting';
import * as DiagramInteractionHook from '../../model/hooks/useDiagramInteraction';
import * as DiagramSearchHook from '../../model/hooks/useDiagramSearch';
import * as DiagramStylingUtils from '../../lib/diagram-styling';

// Mock dependencies
vi.mock('@xyflow/react', async () => {
    const actual = await vi.importActual('@xyflow/react');
    return {
        ...actual,
        ReactFlow: ({ children }: { children: React.ReactNode }) => <div data-testid="react-flow">{children}</div>,
        MiniMap: () => <div data-testid="minimap" />,
        Background: () => <div data-testid="background" />,
        Controls: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        ControlButton: ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
            <button onClick={onClick}>{children}</button>
        ),
        useNodesState: (initial: any) => [initial, vi.fn(), vi.fn()],
        useEdgesState: (initial: any) => [initial, vi.fn(), vi.fn()],
        useReactFlow: () => ({
            zoomIn: vi.fn(),
            zoomOut: vi.fn(),
            fitView: vi.fn(),
            getNode: vi.fn(),
            setCenter: vi.fn(),
        }),
    };
});

// Mock ResizeObserver
(globalThis as any).ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};

describe('DiagramCanvas', () => {
    const mockSetSelectedNodeId = vi.fn();
    const mockSetActiveTab = vi.fn();
    const mockSetFocusNodeId = vi.fn();
    const mockSetImpactMode = vi.fn();
    const mockClearHighlighting = vi.fn();
    const mockOpenSearch = vi.fn();
    const mockCloseSearch = vi.fn();
    const mockHandleSearch = vi.fn();
    const mockHandleSelectSuggestion = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock Store
        vi.spyOn(DiagramStore, 'useDiagramStore').mockImplementation((selector: any) => {
            const state = {
                coreId: 'core-1',
                hiddenTypes: new Set(),
                setSelectedNodeId: mockSetSelectedNodeId,
                setActiveTab: mockSetActiveTab,
                autoImpactMode: false,
                setAutoImpactMode: vi.fn(),
            };
            return selector(state);
        });

        // Mock Data Hook
        vi.spyOn(DiagramDataHook, 'useDiagramData').mockReturnValue({
            nodes: [{ id: '1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } }],
            edges: [],
            loading: false,
            error: null,
            fullData: { nodes: [{ id: 'core-1', label: 'Core Node' }] },
        } as any);

        // Mock Layout Hook
        vi.spyOn(DiagramLayoutHook, 'useDiagramLayout').mockReturnValue({
            getLayoutedElements: vi.fn().mockReturnValue({ nodes: [], edges: [] }),
        } as any);

        // Mock Highlighting Hook
        vi.spyOn(GraphHighlightingHook, 'useGraphHighlighting').mockReturnValue({
            focusNodeId: null,
            setFocusNodeId: mockSetFocusNodeId,
            impactMode: false,
            setImpactMode: mockSetImpactMode,
            highlightedNodes: new Set(),
            highlightedEdges: new Set(),
            clearHighlighting: mockClearHighlighting,
        } as any);

        // Mock Interaction Hook
        vi.spyOn(DiagramInteractionHook, 'useDiagramInteraction').mockReturnValue({
            onNodeClick: vi.fn(),
            onPaneClick: vi.fn(),
            focusNode: vi.fn(),
        } as any);

        // Mock Search Hook
        vi.spyOn(DiagramSearchHook, 'useDiagramSearch').mockReturnValue({
            isOpen: false,
            query: '',
            suggestions: [],
            openSearch: mockOpenSearch,
            closeSearch: mockCloseSearch,
            setQuery: mockHandleSearch,
            handleSelectSuggestion: mockHandleSelectSuggestion,
        } as any);

        // Mock Styling Utils
        vi.spyOn(DiagramStylingUtils, 'applyDiagramStyles').mockReturnValue({
            nodes: [],
            edges: [],
        });
    });

    it('renders loading state', () => {
        vi.spyOn(DiagramDataHook, 'useDiagramData').mockReturnValue({
            loading: true,
            nodes: [],
            edges: [],
            error: null,
            fullData: null,
        } as any);

        render(<DiagramCanvas />);
        expect(screen.getByText('Loading diagram data...')).toBeInTheDocument();
    });

    it('renders error state', () => {
        vi.spyOn(DiagramDataHook, 'useDiagramData').mockReturnValue({
            loading: false,
            error: 'Failed to fetch',
            nodes: [],
            edges: [],
            fullData: null,
        } as any);

        render(<DiagramCanvas />);
        expect(screen.getByText('Error: Failed to fetch')).toBeInTheDocument();
    });

    it('renders diagram with nodes and edges (happy path)', () => {
        render(<DiagramCanvas />);
        expect(screen.getByTestId('react-flow')).toBeInTheDocument();
        expect(screen.getByTestId('minimap')).toBeInTheDocument();
        expect(screen.getByTestId('background')).toBeInTheDocument();
    });

    it('displays core node label', () => {
        render(<DiagramCanvas />);
        expect(screen.getByText('Core Node')).toBeInTheDocument();
    });

    it('opens search overlay when search button is clicked', () => {
        render(<DiagramCanvas />);
        const searchButton = screen.getByTitle('Find in diagram (Ctrl+F)');
        fireEvent.click(searchButton);
        expect(mockOpenSearch).toHaveBeenCalled();
    });
});
