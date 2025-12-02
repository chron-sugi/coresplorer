/**
 * Diagram Canvas
 *
 * This module renders the React Flow canvas for the diagram feature. It
 * wires together data fetching (`useDiagramData`), layout (`useDiagramLayout`),
 * and interaction hooks (highlighting, searching, and user interactions).
 * The exported `DiagramCanvas` component is the entry point used inside
 * the diagram page shell.
 */
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
    ReactFlow,
    MiniMap,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    type Connection,
    type ReactFlowInstance,
    type Node,
    type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '../../diagram.css';
import { Search } from 'lucide-react';

import { useDiagramData } from '../../model/hooks/useDiagramData';
import { useDiagramLayout } from '../../model/hooks/useDiagramLayout';
import type { DiagramNodeData } from '../../model/types';
import { SplunkNode } from './SplunkNode';
import { useGraphHighlighting } from '../../model/hooks/useGraphHighlighting';
import { DiagramToolbar } from './Toolbar';
import { useDiagramStore } from '../../model/store/diagram.store';
import { DiagramSearch } from '../DiagramSearch/DiagramSearch';
import { DIAGRAM_ZOOM, DIAGRAM_BACKGROUND } from '../../model/constants/diagram.constants';
import { themeConfig } from '@/shared/config';
import { UI_DIMENSIONS } from '../../model/constants/diagram.ui.constants';
import { useDiagramInteraction } from '../../model/hooks/useDiagramInteraction';
import { useDiagramSearch } from '../../model/hooks/useDiagramSearch';
import { applyDiagramStyles } from '../../lib/diagram-styling';

/**
 * Supported node types mapped to React Flow node components.
 */
const nodeTypes = {
    splunk: SplunkNode,
};

/**
 * DiagramCanvas
 *
 * Top-level React Flow canvas for the diagram feature. Responsible for:
 * - fetching and preparing nodes/edges via `useDiagramData`
 * - computing layout with `useDiagramLayout`
 * - wiring interaction, highlighting, and search hooks
 * - rendering React Flow with custom node types and controls
 *
 * This component reads persistent state from `useDiagramStore` and
 * uses `effectiveCoreId` from the data hook to center the layout on the
 * actual core node when available.
 */
/**
 * DiagramCanvas
 *
 * Main diagram canvas component. Responsible for:
 * - Requesting visible nodes/edges via `useDiagramData`
 * - Computing a layout via `useDiagramLayout`
 * - Wiring React Flow with node and edge state
 *
 * The component uses `useDiagramStore` for persisted UI state
 * (selected node, coreId, hidden types, etc.).
 */
export function DiagramCanvas(): React.JSX.Element {
    const coreId = useDiagramStore(state => state.coreId);
    const hiddenTypes = useDiagramStore(state => state.hiddenTypes);
    const setSelectedNodeId = useDiagramStore(state => state.setSelectedNodeId);
    const setActiveTab = useDiagramStore(state => state.setActiveTab);
    const autoImpactMode = useDiagramStore(state => state.autoImpactMode);

    const { nodes: initialNodes, edges: initialEdges, loading, error, fullData, effectiveCoreId } = useDiagramData(coreId, hiddenTypes);
    const { getLayoutedElements } = useDiagramLayout();

    // Graph highlighting state
    const {
        focusNodeId,
        setFocusNodeId,
        impactMode,
        setImpactMode,
        highlightedNodes,
        highlightedEdges,
        clearHighlighting
    } = useGraphHighlighting(initialEdges);

    const [rfInstance, setRfInstance] = useState<ReactFlowInstance<Node<DiagramNodeData>, Edge> | null>(null);
    const lastCenteredCoreId = useRef<string | null>(null);

    // We need to re-calculate layout whenever data changes
    const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => 
        getLayoutedElements(initialNodes, initialEdges, 'TB', effectiveCoreId || coreId),
        [getLayoutedElements, initialNodes, initialEdges, effectiveCoreId, coreId]
    );

    // Center on core node when diagram loads or coreId changes
    useEffect(() => {
        const targetId = effectiveCoreId || coreId;
        if (!rfInstance || !targetId || layoutedNodes.length === 0) return;

        // Only center if we haven't centered on this coreId yet
        if (lastCenteredCoreId.current !== targetId) {
            // Small delay to allow ReactFlow to render the new nodes
            const timer = setTimeout(() => {
                const node = rfInstance.getNode(targetId);
                if (node) {
                    rfInstance.fitView({
                        nodes: [{ id: targetId }],
                        padding: DIAGRAM_ZOOM.FIT_VIEW.PADDING,
                        duration: DIAGRAM_ZOOM.FIT_VIEW.DURATION_MS,
                        minZoom: DIAGRAM_ZOOM.FIT_VIEW.MIN,
                        maxZoom: DIAGRAM_ZOOM.FIT_VIEW.MAX,
                    });
                    lastCenteredCoreId.current = targetId;
                }
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [rfInstance, effectiveCoreId, coreId, layoutedNodes]);

    const [nodes, setNodes, onNodesChange] = useNodesState<Node<DiagramNodeData>>(layoutedNodes as Node<DiagramNodeData>[]);
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

    // Sync local state with fetched data
    useEffect(() => {
        setNodes(layoutedNodes as Node<DiagramNodeData>[]);
        setEdges(layoutedEdges);
    }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

    // Interaction Hook
    const { onNodeClick, onPaneClick, focusNode } = useDiagramInteraction({
        rfInstance: rfInstance as unknown as ReactFlowInstance,
        autoImpactMode,
        setFocusNodeId,
        setSelectedNodeId,
        setActiveTab,
        setImpactMode,
        clearHighlighting
    });

    // Search Hook
    const { 
        isOpen: isSearchOpen, 
        query: searchQuery, 
        suggestions: searchSuggestions, 
        openSearch, 
        closeSearch, 
        setQuery: handleSearch, 
        handleSelectSuggestion 
    } = useDiagramSearch({
        nodes,
        onSelectNode: focusNode
    });

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    // Apply styling (highlighting/dimming)
    const { nodes: styledNodes, edges: styledEdges } = useMemo(() => applyDiagramStyles(
        nodes, 
        edges, 
        { highlightedNodes, highlightedEdges, impactMode, focusNodeId }
    ), [nodes, edges, highlightedNodes, highlightedEdges, impactMode, focusNodeId]);

    if (loading) {
        return <div className="flex items-center justify-center h-full text-slate-600">Loading diagram data...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center h-full text-red-500">Error: {error}</div>;
    }

    return (
        <div className="h-full w-full relative group">
            <ReactFlow<Node<DiagramNodeData>, Edge>
                nodes={styledNodes as Node<DiagramNodeData>[]}
                edges={styledEdges as Edge[]}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                onInit={setRfInstance as unknown as (reactFlowInstance: ReactFlowInstance<Node<DiagramNodeData>, Edge>) => void}
                nodeTypes={nodeTypes}
                nodeOrigin={[0.5, 0.5]}
                fitView
                minZoom={DIAGRAM_ZOOM.MIN}
                attributionPosition="bottom-right"
            >
                <DiagramToolbar />
                {/* MiniMap styling handled by react-flow-overrides.css */}
                <MiniMap
                    zoomable
                    pannable
                    style={{ width: UI_DIMENSIONS.MINIMAP.WIDTH, height: UI_DIMENSIONS.MINIMAP.HEIGHT }}
                    nodeColor={(node) => {
                        const objectType = node.data?.object_type as string;
                        return themeConfig.colors.koTypes[objectType as keyof typeof themeConfig.colors.koTypes] || themeConfig.colors.semantic.node.defaultBorder;
                    }}
                    maskColor="rgba(100, 116, 139, 0.1)"
                />
                <Background
                    gap={DIAGRAM_BACKGROUND.GAP}
                    size={DIAGRAM_BACKGROUND.SIZE}
                    color={DIAGRAM_BACKGROUND.COLOR}
                    style={{ opacity: DIAGRAM_BACKGROUND.OPACITY }}
                />
            </ReactFlow>

            {/* Search Trigger Icon (Top Right) */}
            {!isSearchOpen && (
                <button
                    onClick={openSearch}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white text-slate-500 hover:text-slate-700 rounded-md shadow-sm border border-slate-200 transition-all duration-200"
                    title="Find in diagram (Ctrl+F)"
                >
                    <Search size={18} />
                </button>
            )}

            {/* Search Overlay */}
            <DiagramSearch
                isOpen={isSearchOpen}
                query={searchQuery}
                suggestions={searchSuggestions}
                onChangeQuery={handleSearch}
                onClose={closeSearch}
                onSelectSuggestion={handleSelectSuggestion}
            />

            {/* Core Node Name Display */}
            {fullData && fullData.nodes && (
                <div className="absolute top-4 left-4 z-10 pointer-events-none select-none">
                    <span className="text-[15px] font-semibold text-slate-900">
                        {fullData.nodes.find((n) => n.id === (effectiveCoreId || coreId))?.label || 'Unknown Node'}
                    </span>
                </div>
            )}

        </div>
    );
}

