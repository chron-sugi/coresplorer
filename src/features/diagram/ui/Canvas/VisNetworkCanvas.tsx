/**
 * vis-network Canvas Component
 *
 * Renders the diagram using vis-network library for force-directed layout.
 * Handles initialization, data binding, and user interactions.
 *
 * @module features/diagram/ui/Canvas/VisNetworkCanvas
 */
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { Network as NetworkIcon } from 'lucide-react';
import type { Network, DataSet } from 'vis-network/standalone';

import { useDiagramStore } from '../../model/store/diagram.store';
import { useDiagramData } from '../../model/hooks/useDiagramData';
import { useVisNetworkInit } from '../../model/hooks/useVisNetworkInit';
import { useVisNetworkClustering } from '../../model/hooks/useVisNetworkClustering';
import { useMarchingAntsAnimation } from '../../model/hooks/useMarchingAntsAnimation';
import { useGraphHighlighting } from '../../model/hooks/useGraphHighlighting';
import { useDiagramSearch } from '../../model/hooks/useDiagramSearch';
import { VIS_NETWORK_SETTINGS, UI_TIMING, UI_DIMENSIONS } from '../../model/constants/diagram.ui.constants';
import { transformDiagramData, applyNodeHighlight, applyEdgeHighlight, type VisNetworkNode, type VisNetworkEdge } from '../../lib/vis-network-transform';
import { DiagramToolbar } from './Toolbar';
import { NodeActionToolbar } from './NodeActionToolbar';
import { DiagramSearch } from '../DiagramSearch/DiagramSearch';
import { encodeUrlParam } from '@/shared/lib';
import { useNavigate } from 'react-router-dom';

interface SelectedNodeToolbar {
  nodeId: string;
  label: string;
  objectType: string;
  app?: string;
  owner?: string;
  position: { x: number; y: number };
  scale: number;
}

export function VisNetworkCanvas(): React.JSX.Element {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isStabilizing, setIsStabilizing] = useState(false);
  const [selectedNodeToolbar, setSelectedNodeToolbar] = useState<SelectedNodeToolbar | null>(null);
  const clusteringRef = useRef<ReturnType<typeof useVisNetworkClustering> | null>(null);

  // Store state
  const coreId = useDiagramStore((state) => state.coreId);
  const hiddenTypes = useDiagramStore((state) => state.hiddenTypes);
  const autoImpactMode = useDiagramStore((state) => state.autoImpactMode);
  const setSelectedNodeId = useDiagramStore((state) => state.setSelectedNodeId);
  const setActiveTab = useDiagramStore((state) => state.setActiveTab);

  // Data
  const { nodes, edges, loading: isLoading, error } = useDiagramData(coreId ?? undefined, hiddenTypes);

  // Highlighting
  const edgesForHighlighting = useMemo(
    () => edges.map((e) => ({ id: `e-${e.source}-${e.target}`, source: e.source, target: e.target })),
    [edges]
  );
  const { focusNodeId, setFocusNodeId, impactMode, setImpactMode, highlightedNodes, highlightedEdges, clearHighlighting } = useGraphHighlighting(edgesForHighlighting);

  // Helper to show toolbar for a node
  const showToolbarForNode = useCallback((
    nodeId: string,
    networkRef: RefObject<Network | null>,
    nodesDataSetRef: RefObject<DataSet<VisNetworkNode> | null>
  ) => {
    if (!networkRef.current || !nodesDataSetRef.current) return;
    const nodePosition = networkRef.current.getPositions([nodeId])[nodeId];
    if (!nodePosition) return;
    const canvasPosition = networkRef.current.canvasToDOM(nodePosition);
    const scale = networkRef.current.getScale();
    const nodeData = nodesDataSetRef.current.get(nodeId);
    if (nodeData) {
      setSelectedNodeToolbar({
        nodeId,
        label: nodeData.label as string,
        objectType: nodeData.objectType || 'unknown',
        app: nodeData.app,
        owner: nodeData.owner,
        position: { x: canvasPosition.x, y: canvasPosition.y - UI_DIMENSIONS.NODE_TOOLBAR_OFFSET_Y },
        scale,
      });
    }
  }, []);

  // Network initialization
  const { networkRef, nodesDataSetRef, edgesDataSetRef, networkInstance } = useVisNetworkInit({
    containerRef,
    onNodeClick: (nodeId) => {
      setSelectedNodeId(nodeId);
      setActiveTab('details');
      showToolbarForNode(nodeId, networkRef, nodesDataSetRef);
      if (autoImpactMode) { setFocusNodeId(nodeId); setImpactMode('both'); }
    },
    onNodeDoubleClick: (nodeId) => navigate(`/diagram/${encodeUrlParam(nodeId)}`),
    onClusterDoubleClick: (clusterId) => clusteringRef.current?.expandCluster(clusterId),
    onEmptyClick: () => { setSelectedNodeId(null); setSelectedNodeToolbar(null); clearHighlighting(); },
    onZoom: (nodeId) => { if (nodeId) showToolbarForNode(nodeId, networkRef, nodesDataSetRef); },
    onDragEnd: (nodeId) => { if (nodeId) showToolbarForNode(nodeId, networkRef, nodesDataSetRef); },
    setIsStabilizing,
  });

  // Clustering
  const clustering = useVisNetworkClustering({ networkRef, nodesDataSetRef, edgesDataSetRef, coreId, clearHighlighting });
  useEffect(() => { clusteringRef.current = clustering; }, [clustering]);

  // Marching ants animation
  useMarchingAntsAnimation({ networkInstance, highlightedEdges });

  // Search
  const searchableNodes = useMemo(() => nodes.map((node) => ({ id: node.id, data: { label: node.data.label, object_type: node.data.object_type, app: node.data.app } })), [nodes]);
  const handleSearchSelectNode = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    setActiveTab('details');
    if (networkRef.current) {
      networkRef.current.focus(nodeId, { scale: 1, animation: { duration: UI_TIMING.FIT_ANIMATION_MS, easingFunction: 'easeInOutQuad' } });
      setTimeout(() => showToolbarForNode(nodeId, networkRef, nodesDataSetRef), UI_TIMING.FIT_ANIMATION_MS);
    }
    if (autoImpactMode) { setFocusNodeId(nodeId); setImpactMode('both'); }
  }, [setSelectedNodeId, setActiveTab, networkRef, nodesDataSetRef, showToolbarForNode, autoImpactMode, setFocusNodeId, setImpactMode]);

  const { isOpen: isSearchOpen, query: searchQuery, suggestions: searchSuggestions, openSearch, closeSearch, setQuery: setSearchQuery, handleSelectSuggestion } = useDiagramSearch({ nodes: searchableNodes, onSelectNode: handleSearchSelectNode });

  // Data sync effect
  useEffect(() => {
    console.log('[data-sync] Effect running, state:', {
      hasNodesDataSet: !!nodesDataSetRef.current,
      hasEdgesDataSet: !!edgesDataSetRef.current,
      hasNetwork: !!networkRef.current,
      coreId,
      nodeCount: nodes.length,
    });
    if (!nodesDataSetRef.current || !edgesDataSetRef.current || !coreId || nodes.length === 0) {
      console.log('[data-sync] Early return - missing deps');
      return;
    }
    console.log('[data-sync] Syncing data to DataSets');
    const { nodes: visNodes, edges: visEdges } = transformDiagramData(nodes, edges, coreId);
    nodesDataSetRef.current.update(visNodes);
    edgesDataSetRef.current.update(visEdges);
    const existingNodeIds = nodesDataSetRef.current.getIds();
    const newNodeIds = new Set(visNodes.map(n => n.id));
    const nodesToRemove = existingNodeIds.filter(id => !newNodeIds.has(id));
    if (nodesToRemove.length > 0) nodesDataSetRef.current.remove(nodesToRemove);
    const existingEdgeIds = edgesDataSetRef.current.getIds();
    const newEdgeIds = new Set(visEdges.map(e => e.id));
    const edgesToRemove = existingEdgeIds.filter(id => !newEdgeIds.has(id));
    if (edgesToRemove.length > 0) edgesDataSetRef.current.remove(edgesToRemove);
    if (networkRef.current && nodes.length > 0) {
      console.log('[data-sync] Triggering stabilization with', nodes.length, 'nodes');
      setIsStabilizing(true);
      networkRef.current.setOptions({ physics: { enabled: true } });
      networkRef.current.stabilize(VIS_NETWORK_SETTINGS.STABILIZATION_ITERATIONS);
    } else {
      console.log('[data-sync] Cannot stabilize - network not ready or no nodes');
    }
  }, [nodes, edges, coreId, networkRef, nodesDataSetRef, edgesDataSetRef]);

  // Highlighting effect
  useEffect(() => {
    if (!nodesDataSetRef.current || !edgesDataSetRef.current) return;
    const nodeUpdates: VisNetworkNode[] = [];
    const edgeUpdates: VisNetworkEdge[] = [];
    const isHighlightingActive = impactMode !== 'off' || focusNodeId !== null;
    nodesDataSetRef.current.forEach((node) => {
      const isHighlighted = highlightedNodes.has(node.id as string);
      const styleUpdate = applyNodeHighlight(node, { isFocused: node.id === focusNodeId, isHighlighted, isDimmed: isHighlightingActive && !isHighlighted });
      nodeUpdates.push({ id: node.id, ...styleUpdate } as VisNetworkNode);
    });
    edgesDataSetRef.current.forEach((edge) => {
      const isHighlighted = highlightedEdges.has(edge.id as string);
      const styleUpdate = applyEdgeHighlight(isHighlighted, isHighlightingActive && !isHighlighted);
      edgeUpdates.push({ id: edge.id, ...styleUpdate } as VisNetworkEdge);
    });
    nodesDataSetRef.current.update(nodeUpdates);
    edgesDataSetRef.current.update(edgeUpdates);
  }, [focusNodeId, impactMode, highlightedNodes, highlightedEdges, nodesDataSetRef, edgesDataSetRef]);

  // Toolbar callbacks
  const handleFitView = useCallback(() => networkRef.current?.fit({ animation: { duration: UI_TIMING.FIT_ANIMATION_MS, easingFunction: 'easeInOutQuad' } }), [networkRef]);
  const handleZoomIn = useCallback(() => networkRef.current?.moveTo({ scale: (networkRef.current?.getScale() || 1) * 1.2 }), [networkRef]);
  const handleZoomOut = useCallback(() => networkRef.current?.moveTo({ scale: (networkRef.current?.getScale() || 1) / 1.2 }), [networkRef]);
  const handleCenterOnCore = useCallback(() => { if (coreId && networkRef.current) networkRef.current.focus(coreId, { scale: 1, animation: { duration: UI_TIMING.FIT_ANIMATION_MS, easingFunction: 'easeInOutQuad' } }); }, [coreId, networkRef]);

  console.log('[VisNetworkCanvas] Render state:', { isLoading, error, coreId, nodeCount: nodes.length, hasNetwork: !!networkInstance });

  // Always render the container div so the ref is available for useVisNetworkInit on mount.
  // Show overlays for loading/error/no-selection states instead of early returns.
  return (
    <div className="h-full w-full relative group">
      {isStabilizing && <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-white/90 rounded-md shadow-sm border border-slate-200 text-sm text-slate-600">Stabilizing layout...</div>}
      <div ref={containerRef} className="h-full w-full bg-slate-50" />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-50 text-slate-500">
          Loading graph data...
        </div>
      )}

      {/* Error overlay */}
      {error && !isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-50 text-red-500">
          Error loading graph: {error}
        </div>
      )}

      {/* No selection overlay */}
      {!coreId && !isLoading && !error && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 text-center max-w-md px-6">
            <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
              <NetworkIcon className="w-8 h-8 text-slate-500" />
            </div>
            <h2 className="text-lg font-semibold text-slate-700">No object selected</h2>
            <p className="text-sm text-slate-500">Select a knowledge object to view its dependency diagram.</p>
            <p className="text-sm text-slate-500">
              Press <kbd className="px-2 py-1 bg-slate-200 rounded text-slate-700 font-mono text-xs">⌘K</kbd> or <kbd className="px-2 py-1 bg-slate-200 rounded text-slate-700 font-mono text-xs">Ctrl+K</kbd> to open search
            </p>
          </div>
        </div>
      )}

      {/* Only show toolbar and search when we have a valid diagram */}
      {coreId && !isLoading && !error && (
        <>
          <DiagramToolbar onFitView={handleFitView} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onCenterOnCore={handleCenterOnCore} />
          {selectedNodeToolbar && <NodeActionToolbar nodeId={selectedNodeToolbar.nodeId} nodeLabel={selectedNodeToolbar.label} nodeType={selectedNodeToolbar.objectType} nodeApp={selectedNodeToolbar.app} nodeOwner={selectedNodeToolbar.owner} position={selectedNodeToolbar.position} scale={selectedNodeToolbar.scale} />}
          <DiagramSearch isOpen={isSearchOpen} query={searchQuery} suggestions={searchSuggestions} onChangeQuery={setSearchQuery} onOpen={openSearch} onClose={closeSearch} onSelectSuggestion={handleSelectSuggestion} />
        </>
      )}
    </div>
  );
}
