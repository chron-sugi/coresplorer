/**
 * useDiagramInteraction
 *
 * Hook that centralizes user interaction handlers for the diagram canvas.
 * It provides click handlers and a convenience `focusNode` method that
 * coordinate React Flow's view with the diagram's UI state (selected node,
 * focused node and the details panel tab). The hook is intentionally
 * small and pure so the consuming component can wire the handlers directly
 * into React Flow props.
 */
import { useCallback } from 'react';
import type { NodeMouseHandler, ReactFlowInstance } from '@xyflow/react';
import type { PanelTab } from '../store/diagram.store';
import type { ImpactMode } from '../../lib/graph-utils.types';
import { DIAGRAM_ZOOM } from '../constants/diagram.constants';

interface UseDiagramInteractionProps {
    rfInstance: ReactFlowInstance | null;
    autoImpactMode: boolean;
    setFocusNodeId: (id: string | null) => void;
    setSelectedNodeId: (id: string | null) => void;
    setActiveTab: (tab: PanelTab) => void;
    setImpactMode: (mode: ImpactMode) => void;
    clearHighlighting: () => void;
}

interface UseDiagramInteractionReturn {
    onNodeClick: NodeMouseHandler;
    onPaneClick: () => void;
    focusNode: (nodeId: string) => void;
}

/**
 * useDiagramInteraction
 *
 * @param {UseDiagramInteractionProps} props - runtime hooks and setters required
 *   by the interaction handlers.
 * @returns {UseDiagramInteractionReturn} Handlers: `onNodeClick`, `onPaneClick`, and `focusNode`.
 */
export function useDiagramInteraction({
    rfInstance,
    autoImpactMode,
    setFocusNodeId,
    setSelectedNodeId,
    setActiveTab,
    setImpactMode,
    clearHighlighting
}: UseDiagramInteractionProps): UseDiagramInteractionReturn {

    const focusNode = useCallback((nodeId: string) => {
        setFocusNodeId(nodeId);
        setSelectedNodeId(nodeId);
        setActiveTab('details');
        
        if (rfInstance) {
            rfInstance.fitView({ 
                nodes: [{ id: nodeId }], 
                duration: DIAGRAM_ZOOM.FIT_VIEW.DURATION_MS, 
                padding: DIAGRAM_ZOOM.FIT_VIEW.PADDING,
                minZoom: DIAGRAM_ZOOM.FIT_VIEW.MIN,
                maxZoom: DIAGRAM_ZOOM.FIT_VIEW.MAX
            });
        }
    }, [rfInstance, setFocusNodeId, setSelectedNodeId, setActiveTab]);

    const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
        setFocusNodeId(node.id);
        setSelectedNodeId(node.id);
        setActiveTab('details');
        
        if (autoImpactMode) {
            setImpactMode('both');
        } else {
            setImpactMode('off');
        }
    }, [setFocusNodeId, setSelectedNodeId, setActiveTab, autoImpactMode, setImpactMode]);

    const onPaneClick = useCallback(() => {
        clearHighlighting();
        setSelectedNodeId(null);
        setFocusNodeId(null);
    }, [clearHighlighting, setSelectedNodeId, setFocusNodeId]);

    return {
        onNodeClick,
        onPaneClick,
        focusNode
    };
}
