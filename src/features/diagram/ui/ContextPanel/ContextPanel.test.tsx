import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiagramContextPanel } from './ContextPanel';
import * as DiagramStore from '../../model/store/diagram.store';
import * as DiagramDataHook from '../../model/hooks/useDiagramData';
import * as NodeDetailsHook from '../../model/hooks/useNodeDetails';
import userEvent from '@testing-library/user-event';

// Mock dependencies
vi.mock('@/shared/ui/ContextPanel', () => ({
    ContextPanel: ({ children, title, emptyState, isCollapsed, collapsedContent }: any) => (
        <div data-testid="context-panel">
            {isCollapsed ? collapsedContent : (
                <>
                    {title && <div data-testid="panel-title">{title}</div>}
                    {emptyState || children}
                </>
            )}
        </div>
    ),
}));

vi.mock('./Tabs/DetailsTab', () => ({
    NodeDetailsSection: ({ nodeId }: { nodeId: string }) => <div data-testid="details-tab">Details for {nodeId}</div>,
}));

vi.mock('./Tabs/SplTab', () => ({
    SplTab: ({ code }: { code: string }) => <div data-testid="spl-tab">{code}</div>,
}));

vi.mock('./Tabs/ImpactTab', () => ({
    ImpactTab: ({ nodeId }: { nodeId: string }) => <div data-testid="impact-tab">Impact for {nodeId}</div>,
}));

vi.mock('./IconRail', () => ({
    IconRail: ({ onExpand }: { onExpand: () => void }) => (
        <button onClick={onExpand} data-testid="icon-rail">IconRail</button>
    ),
}));

describe('DiagramContextPanel', () => {
    const mockSetActiveTab = vi.fn();
    const mockFetchNodeDetails = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        vi.spyOn(DiagramStore, 'useDiagramStore').mockImplementation((selector: any) => {
            const state = {
                selectedNodeId: null,
                activeTab: 'details',
                setActiveTab: mockSetActiveTab,
                coreId: 'core-1',
                hiddenTypes: new Set(),
            };
            return selector(state);
        });

        vi.spyOn(NodeDetailsHook, 'useNodeDetails').mockReturnValue({
            nodeDetailsData: {},
            fetchNodeDetails: mockFetchNodeDetails,
        } as any);

        vi.spyOn(DiagramDataHook, 'useDiagramData').mockReturnValue({
            fullData: { nodes: [{ id: 'core-1', label: 'Core Node' }] },
        } as any);
    });

    it('renders empty state when no node is selected', () => {
        render(<DiagramContextPanel />);
        expect(screen.getByText('Select a node to view details')).toBeInTheDocument();
    });

    it('renders node details when node is selected', () => {
        vi.spyOn(DiagramStore, 'useDiagramStore').mockImplementation((selector: any) => {
            const state = {
                selectedNodeId: 'node-1',
                activeTab: 'details',
                setActiveTab: mockSetActiveTab,
                coreId: 'core-1',
                hiddenTypes: new Set(),
            };
            return selector(state);
        });

        vi.spyOn(NodeDetailsHook, 'useNodeDetails').mockReturnValue({
            nodeDetailsData: {
                'node-1': { name: 'Test Node', app: 'search', spl_code: 'search index=main' },
            },
            fetchNodeDetails: mockFetchNodeDetails,
        } as any);

        render(<DiagramContextPanel />);
        expect(screen.getByTestId('panel-title')).toHaveTextContent('Test Node');
    });

    it('fetches node details when node is selected', () => {
        vi.spyOn(DiagramStore, 'useDiagramStore').mockImplementation((selector: any) => {
            const state = {
                selectedNodeId: 'node-1',
                activeTab: 'details',
                setActiveTab: mockSetActiveTab,
                coreId: 'core-1',
                hiddenTypes: new Set(),
            };
            return selector(state);
        });

        render(<DiagramContextPanel />);
        expect(mockFetchNodeDetails).toHaveBeenCalledWith('node-1');
    });

    it('switches between tabs', async () => {
        const user = userEvent.setup();
        vi.spyOn(DiagramStore, 'useDiagramStore').mockImplementation((selector: any) => {
            const state = {
                selectedNodeId: 'node-1',
                activeTab: 'details',
                setActiveTab: mockSetActiveTab,
                coreId: 'core-1',
                hiddenTypes: new Set(),
            };
            return selector(state);
        });

        vi.spyOn(NodeDetailsHook, 'useNodeDetails').mockReturnValue({
            nodeDetailsData: {
                'node-1': { name: 'Test Node', app: 'search', spl_code: 'search index=main' },
            },
            fetchNodeDetails: mockFetchNodeDetails,
        } as any);

        render(<DiagramContextPanel />);

        const splButton = screen.getByText('SPL');
        await user.click(splButton);
        expect(mockSetActiveTab).toHaveBeenCalledWith('spl');
    });

    it('displays app badge', () => {
        vi.spyOn(DiagramStore, 'useDiagramStore').mockImplementation((selector: any) => {
            const state = {
                selectedNodeId: 'node-1',
                activeTab: 'details',
                setActiveTab: mockSetActiveTab,
                coreId: 'core-1',
                hiddenTypes: new Set(),
            };
            return selector(state);
        });

        vi.spyOn(NodeDetailsHook, 'useNodeDetails').mockReturnValue({
            nodeDetailsData: {
                'node-1': { name: 'Test Node', app: 'search', spl_code: 'search index=main' },
            },
            fetchNodeDetails: mockFetchNodeDetails,
        } as any);

        render(<DiagramContextPanel />);
        expect(screen.getByText('search')).toBeInTheDocument();
    });
});

