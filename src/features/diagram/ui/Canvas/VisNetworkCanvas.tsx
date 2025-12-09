/**
 * vis-network Canvas Component
 *
 * Renders the diagram using vis-network library for force-directed layout.
 * Handles initialization, data binding, and user interactions.
 *
 * @module features/diagram/ui/Canvas/VisNetworkCanvas
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Network, DataSet } from 'vis-network/standalone';
import type { Data, Options } from 'vis-network';
import { Network as NetworkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useDiagramStore } from '../../model/store/diagram.store';
import { useDiagramData } from '../../model/hooks/useDiagramData';
import { useAnimationLoop } from '../../model/hooks/useAnimationLoop';
import { VIS_NETWORK_OPTIONS } from '../../model/constants/vis-network.constants';
import { UI_TIMING, UI_DIMENSIONS, VIS_NETWORK_SETTINGS } from '../../model/constants/diagram.ui.constants';
import {
  transformDiagramData,
  applyNodeHighlight,
  applyEdgeHighlight,
  type VisNetworkNode,
  type VisNetworkEdge,
} from '../../lib/vis-network-transform';
import { useGraphHighlighting } from '../../model/hooks/useGraphHighlighting';
import { useDiagramSearch } from '../../model/hooks/useDiagramSearch';
import { DiagramToolbar } from './Toolbar';
import { NodeActionToolbar } from './NodeActionToolbar';
import { DiagramSearch } from '../DiagramSearch/DiagramSearch';
import { encodeUrlParam } from '@/shared/lib';

/**
 * VisNetworkCanvas
 *
 * Main diagram canvas using vis-network for rendering.
 * Supports force-directed layout optimized for dense graphs.
 */
export function VisNetworkCanvas(): React.JSX.Element {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const [networkInstance, setNetworkInstance] = useState<Network | null>(null);
  const nodesDataSetRef = useRef<DataSet<VisNetworkNode> | null>(null);
  const edgesDataSetRef = useRef<DataSet<VisNetworkEdge> | null>(null);

  // Store state
  const coreId = useDiagramStore((state) => state.coreId);
  const hiddenTypes = useDiagramStore((state) => state.hiddenTypes);
  const setSelectedNodeId = useDiagramStore((state) => state.setSelectedNodeId);
  const setActiveTab = useDiagramStore((state) => state.setActiveTab);
  const autoImpactMode = useDiagramStore((state) => state.autoImpactMode);

  // Data - useDiagramData handles filtering by coreId and hiddenTypes
  const { nodes, edges, loading: isLoading, error } = useDiagramData(coreId ?? undefined, hiddenTypes);

  // Local state
  const [isStabilizing, setIsStabilizing] = useState(false);
  const [selectedNodeToolbar, setSelectedNodeToolbar] = useState<{
    nodeId: string;
    label: string;
    objectType: string;
    app?: string;
    owner?: string;
    position: { x: number; y: number };
  } | null>(null);
  const selectedNodeIdRef = useRef<string | null>(null);
  
  // Refs for event handlers to avoid stale closures
  const handleNodeClickRef = useRef<(nodeId: string) => void>(() => {});
  const handleNodeDoubleClickRef = useRef<(nodeId: string) => void>(() => {});

  // Helper to update toolbar position for a node

  // Helper to update toolbar position for a node
  const updateToolbarPosition = useCallback((nodeId: string) => {
    if (!networkRef.current || !nodesDataSetRef.current) return;
    
    const nodePosition = networkRef.current.getPositions([nodeId])[nodeId];
    if (!nodePosition) return;
    
    const canvasPosition = networkRef.current.canvasToDOM(nodePosition);
    const nodeData = nodesDataSetRef.current.get(nodeId);
    
    if (nodeData) {
      setSelectedNodeToolbar((prev) => {
        if (!prev || prev.nodeId !== nodeId) return prev;
        return {
          ...prev,
          position: { x: canvasPosition.x, y: canvasPosition.y - UI_DIMENSIONS.NODE_TOOLBAR_OFFSET_Y },
        };
      });
    }
  }, []);

  // Highlighting - compute edges for highlighting hook from diagram edges
  const edgesForHighlighting = useMemo(
    () => edges.map((e) => ({ id: `e-${e.source}-${e.target}`, source: e.source, target: e.target })),
    [edges]
  );

  const {
    focusNodeId,
    setFocusNodeId,
    impactMode,
    setImpactMode,
    highlightedNodes,
    highlightedEdges,
    clearHighlighting,
  } = useGraphHighlighting(edgesForHighlighting);

  // Search - prepare searchable nodes and handle search interactions
  const searchableNodes = useMemo(
    () => nodes.map((node) => ({
      id: node.id,
      data: {
        label: node.data.label,
        object_type: node.data.object_type,
        app: node.data.app,
      },
    })),
    [nodes]
  );

  const handleSearchSelectNode = useCallback(
    (nodeId: string) => {
      // Use the same selection behavior as manual node clicks
      setSelectedNodeId(nodeId);
      setActiveTab('details');
      selectedNodeIdRef.current = nodeId;

      // Get node position and data for toolbar
      if (networkRef.current && nodesDataSetRef.current) {
        const nodePosition = networkRef.current.getPositions([nodeId])[nodeId];
        const canvasPosition = networkRef.current.canvasToDOM(nodePosition);
        const nodeData = nodesDataSetRef.current.get(nodeId);

        if (nodeData) {
          setSelectedNodeToolbar({
            nodeId,
            label: nodeData.label as string,
            objectType: nodeData.objectType || 'unknown',
            app: nodeData.app,
            owner: nodeData.owner,
            position: { x: canvasPosition.x, y: canvasPosition.y - UI_DIMENSIONS.NODE_TOOLBAR_OFFSET_Y },
          });
        }
      }

      // Enable auto-impact highlighting if enabled
      if (autoImpactMode) {
        setFocusNodeId(nodeId);
        setImpactMode('both');
      }
    },
    [setSelectedNodeId, setActiveTab, autoImpactMode, setFocusNodeId, setImpactMode]
  );

  const {
    isOpen: isSearchOpen,
    query: searchQuery,
    suggestions: searchSuggestions,
    openSearch,
    closeSearch,
    setQuery: setSearchQuery,
    handleSelectSuggestion,
  } = useDiagramSearch({
    nodes: searchableNodes,
    onSelectNode: handleSearchSelectNode,
  });

  // Initialize vis-network when container is ready
  useEffect(() => {
    console.log('VisNetworkCanvas: Init effect running', { container: !!containerRef.current });
    if (!containerRef.current) return;

    // Create empty DataSets
    const nodesDataSet = new DataSet<VisNetworkNode>([]);
    const edgesDataSet = new DataSet<VisNetworkEdge>([]);
    nodesDataSetRef.current = nodesDataSet;
    edgesDataSetRef.current = edgesDataSet;

    const data: Data = {
      nodes: nodesDataSet,
      edges: edgesDataSet,
    };

    const options: Options = {
      ...VIS_NETWORK_OPTIONS,
    };

    // Create network instance
    const network = new Network(containerRef.current, data, options);
    console.log('VisNetworkCanvas: Network created');
    networkRef.current = network;
    setNetworkInstance(network);

    // Event handlers
    network.on('stabilizationProgress', () => {
      // Stabilization in progress - UI indicator shown via isStabilizing state
    });

    network.on('stabilizationIterationsDone', () => {
      setIsStabilizing(false);
      // Disable physics after stabilization for smoother interaction
      network.setOptions({ physics: { enabled: false } });
      network.fit({
        animation: {
          duration: UI_TIMING.FIT_ANIMATION_MS,
          easingFunction: 'easeInOutQuad',
        },
      });
    });

    // Fallback: also listen to stabilized event
    network.on('stabilized', () => {
      setIsStabilizing(false);
    });

    network.on('click', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0] as string;
        handleNodeClickRef.current(nodeId);
      } else {
        // Click on empty space - clear selection
        setSelectedNodeId(null);
        setSelectedNodeToolbar(null);
        selectedNodeIdRef.current = null;
        clearHighlighting();
      }
    });

    network.on('doubleClick', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0] as string;
        handleNodeDoubleClickRef.current(nodeId);
      }
    });

    network.on('hoverNode', () => {
      if (containerRef.current) {
        containerRef.current.style.cursor = 'pointer';
      }
    });

    network.on('blurNode', () => {
      if (containerRef.current) {
        containerRef.current.style.cursor = 'default';
      }
    });

    // Update toolbar position when dragging nodes
    network.on('dragStart', () => {
      // Hide toolbar during drag for performance
      setSelectedNodeToolbar(null);
    });

    network.on('dragging', () => {
      // No-op: Don't update React state during high-frequency drag events
    });

    // Update toolbar position when zooming or panning
    network.on('zoom', () => {
      if (selectedNodeIdRef.current) {
        updateToolbarPosition(selectedNodeIdRef.current);
      }
    });

    network.on('dragEnd', () => {
      if (selectedNodeIdRef.current) {
        updateToolbarPosition(selectedNodeIdRef.current);
      }
    });

    // Cleanup
    return () => {
      network.destroy();
      networkRef.current = null;
      nodesDataSetRef.current = null;
      edgesDataSetRef.current = null;
    };
  }, []);

  // Handle node click - select and show in context panel
  const handleNodeClick = useCallback(
    (nodeId: string) => {
      setSelectedNodeId(nodeId);
      setActiveTab('details');
      selectedNodeIdRef.current = nodeId;

      // Get node position and data for toolbar
      if (networkRef.current && nodesDataSetRef.current) {
        const nodePosition = networkRef.current.getPositions([nodeId])[nodeId];
        const canvasPosition = networkRef.current.canvasToDOM(nodePosition);
        const nodeData = nodesDataSetRef.current.get(nodeId);

        if (nodeData) {
          setSelectedNodeToolbar({
            nodeId,
            label: nodeData.label as string,
            objectType: nodeData.objectType || 'unknown',
            app: nodeData.app,
            owner: nodeData.owner,
            position: { x: canvasPosition.x, y: canvasPosition.y - UI_DIMENSIONS.NODE_TOOLBAR_OFFSET_Y },
          });
        }
      }

      // Enable auto-impact highlighting if enabled
      if (autoImpactMode) {
        setFocusNodeId(nodeId);
        setImpactMode('both');
      }
    },
    [setSelectedNodeId, setActiveTab, autoImpactMode, setFocusNodeId, setImpactMode]
  );

  // Handle node double-click - navigate to that node's diagram
  const handleNodeDoubleClick = useCallback(
    (nodeId: string) => {
      navigate(`/diagram/${encodeUrlParam(nodeId)}`);
    },
    [navigate]
  );

  // Update refs
  useEffect(() => {
    handleNodeClickRef.current = handleNodeClick;
    handleNodeDoubleClickRef.current = handleNodeDoubleClick;
  }, [handleNodeClick, handleNodeDoubleClick]);

  // Update data when nodes/edges from useDiagramData changes
  useEffect(() => {
    if (!nodesDataSetRef.current || !edgesDataSetRef.current) return;
    if (!coreId) return; // Don't load data without a coreId
    if (nodes.length === 0) return;

    // Transform data to vis-network format
    const { nodes: visNodes, edges: visEdges } = transformDiagramData(nodes, edges, coreId);

    // If coreId changed, we should probably reset the view (clear and add)
    // Otherwise, we can just update the existing data (smoother)
    // For now, we'll use update for everything to prevent full resets
    
    nodesDataSetRef.current.update(visNodes);
    edgesDataSetRef.current.update(visEdges);

    // Remove nodes/edges that are no longer present
    const existingNodeIds = nodesDataSetRef.current.getIds();
    const newNodeIds = new Set(visNodes.map(n => n.id));
    const nodesToRemove = existingNodeIds.filter(id => !newNodeIds.has(id));
    if (nodesToRemove.length > 0) {
      nodesDataSetRef.current.remove(nodesToRemove);
    }

    const existingEdgeIds = edgesDataSetRef.current.getIds();
    const newEdgeIds = new Set(visEdges.map(e => e.id));
    const edgesToRemove = existingEdgeIds.filter(id => !newEdgeIds.has(id));
    if (edgesToRemove.length > 0) {
      edgesDataSetRef.current.remove(edgesToRemove);
    }

    // Always re-stabilize when data changes
    if (networkRef.current && nodes.length > 0) {
      setIsStabilizing(true);
      networkRef.current.setOptions({ physics: { enabled: true } });
      networkRef.current.stabilize(VIS_NETWORK_SETTINGS.STABILIZATION_ITERATIONS);
    }
  }, [nodes, edges, coreId]);

  // Apply highlighting when highlight state changes
  useEffect(() => {
    if (!nodesDataSetRef.current || !edgesDataSetRef.current) return;

    const nodeUpdates: VisNetworkNode[] = [];
    const edgeUpdates: VisNetworkEdge[] = [];
    const isHighlightingActive = impactMode !== 'off' || focusNodeId !== null;

    // Update node styles
    nodesDataSetRef.current.forEach((node) => {
      const isHighlighted = highlightedNodes.has(node.id as string);
      const isDimmed = isHighlightingActive && !isHighlighted;
      const isFocused = node.id === focusNodeId;

      const styleUpdate = applyNodeHighlight(node, { isFocused, isHighlighted, isDimmed });
      nodeUpdates.push({ id: node.id, ...styleUpdate } as VisNetworkNode);
    });

    // Update edge styles
    edgesDataSetRef.current.forEach((edge) => {
      const isHighlighted = highlightedEdges.has(edge.id as string);
      const isDimmed = isHighlightingActive && !isHighlighted;

      const styleUpdate = applyEdgeHighlight(isHighlighted, isDimmed);
      edgeUpdates.push({ id: edge.id, ...styleUpdate } as VisNetworkEdge);
    });

    nodesDataSetRef.current.update(nodeUpdates);
    edgesDataSetRef.current.update(edgeUpdates);
  }, [focusNodeId, impactMode, highlightedNodes, highlightedEdges]);

  // Animation Loop for Marching Ants
  const isHighlighting = highlightedEdges.size > 0;
  const time = useAnimationLoop(isHighlighting);
  const timeRef = useRef(0);
  timeRef.current = time;

  // Trigger redraw on animation frame
  useEffect(() => {
    if (isHighlighting && networkInstance) {
      networkInstance.redraw();
    }
  }, [time, isHighlighting, networkInstance]);

  // Custom drawing for animated edges
  useEffect(() => {
    if (!networkInstance) return;

    const afterDrawing = (ctx: CanvasRenderingContext2D) => {
      if (highlightedEdges.size === 0) return;

      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.lineDashOffset = -timeRef.current / 60; // Slowed down by 50% (was /30)
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#2563eb'; // blue-600

      highlightedEdges.forEach((edgeId) => {
        // @ts-expect-error - accessing internal vis-network properties
        const edge = networkInstance.body.edges[edgeId];
        if (!edge) return;

        // Draw the edge path
        let startX = edge.from.x;
        let startY = edge.from.y;
        let endX = edge.to.x;
        let endY = edge.to.y;
        let angle = 0;

        if (edge.edgeType?.via) {
            const viaX = edge.edgeType.via.x;
            const viaY = edge.edgeType.via.y;
            ctx.moveTo(startX, startY);
            ctx.lineTo(viaX, viaY);
            ctx.lineTo(endX, endY);
            // Calculate angle from via point to end point
            angle = Math.atan2(endY - viaY, endX - viaX);
        } else {
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            // Calculate angle from start to end
            angle = Math.atan2(endY - startY, endX - startX);
        }
        
        ctx.stroke();

        // Draw Arrowhead
        const arrowLength = 10; // Size of the arrow
        const arrowWidth = 6;
        
        // Back up from the end point slightly so the arrow tip touches the node border?
        // Vis-network usually handles this intersection. 
        // Since we are drawing over, we might overlap the node if we go to center.
        // Vis-network edges stop at the node boundary. `edge.to` might be the center.
        // However, `edge.to` in `network.body.edges` usually refers to the node object which has x,y.
        // The edge object might have `toPoint` or similar if it's calculated.
        // Let's check if we can get the intersection point.
        // `edge.edgeType.to` might be the point?
        // If not, we'll just draw at `endX, endY` which is likely the center, so it might be behind the node.
        // But `vis-network` draws edges to the border.
        // The `edge` object in `body.edges` has `fromPoint` and `toPoint`?
        // Let's try to use `edge.toPoint` if available, otherwise `edge.to`.
        
        const targetPoint = (edge as any).toPoint || edge.to;
        endX = targetPoint.x;
        endY = targetPoint.y;
        
        // Recalculate angle if we used a different point? 
        // If we used `edge.to` (center) for line, but `toPoint` (border) for arrow, the line might go too far.
        // We should probably use `fromPoint` and `toPoint` for the line too if available.
        
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([]); // Solid arrow
        ctx.fillStyle = '#2563eb';
        
        ctx.translate(endX, endY);
        ctx.rotate(angle);
        
        ctx.moveTo(-arrowLength, -arrowWidth);
        ctx.lineTo(0, 0);
        ctx.lineTo(-arrowLength, arrowWidth);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      ctx.restore(); // Restore from line styling
    };

    networkInstance.on('afterDrawing', afterDrawing);

    return () => {
      networkInstance.off('afterDrawing', afterDrawing);
    };
  }, [highlightedEdges, networkInstance]); // Re-bind when highlighted edges change



  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-500">
        Loading graph data...
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-50 text-red-500">
        Error loading graph: {error}
      </div>
    );
  }

  // Empty state
  if (!coreId) {
    return (
      <div className="h-full w-full relative">
        <div
          ref={containerRef}
          className="h-full w-full bg-slate-50"
        />
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 text-center max-w-md px-6">
            <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
              <NetworkIcon className="w-8 h-8 text-slate-500" />
            </div>
            <h2 className="text-lg font-semibold text-slate-700">
              No object selected
            </h2>
            <p className="text-sm text-slate-500">
              Select a knowledge object to view its dependency diagram.
            </p>
            <p className="text-sm text-slate-500">
              Press{' '}
              <kbd className="px-2 py-1 bg-slate-200 rounded text-slate-700 font-mono text-xs">
                ⌘K
              </kbd>{' '}
              or{' '}
              <kbd className="px-2 py-1 bg-slate-200 rounded text-slate-700 font-mono text-xs">
                Ctrl+K
              </kbd>{' '}
              to open search
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative group">
      {/* Stabilization indicator */}
      {isStabilizing && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-white/90 rounded-md shadow-sm border border-slate-200 text-sm text-slate-600">
          Stabilizing layout...
        </div>
      )}

      {/* vis-network container */}
      <div
        ref={containerRef}
        className="h-full w-full bg-slate-50"
      />

      {/* Toolbar */}
      <DiagramToolbar
        autoImpactMode={autoImpactMode}
        onToggleAutoImpact={() => {
          useDiagramStore.getState().setAutoImpactMode(!autoImpactMode);
        }}
        onFitView={() => {
          networkRef.current?.fit({
            animation: {
              duration: UI_TIMING.FIT_ANIMATION_MS,
              easingFunction: 'easeInOutQuad',
            },
          });
        }}
        onZoomIn={() => {
          const scale = networkRef.current?.getScale() || 1;
          networkRef.current?.moveTo({ scale: scale * 1.2 });
        }}
        onZoomOut={() => {
          const scale = networkRef.current?.getScale() || 1;
          networkRef.current?.moveTo({ scale: scale / 1.2 });
        }}
        onCenterOnCore={() => {
          if (coreId && networkRef.current) {
            networkRef.current.focus(coreId, {
              scale: 1,
              animation: {
                duration: UI_TIMING.FIT_ANIMATION_MS,
                easingFunction: 'easeInOutQuad',
              },
            });
          }
        }}
      />

      {/* Node Action Toolbar - appears above selected node */}
      {selectedNodeToolbar && (
        <NodeActionToolbar
          nodeId={selectedNodeToolbar.nodeId}
          nodeLabel={selectedNodeToolbar.label}
          nodeType={selectedNodeToolbar.objectType}
          nodeApp={selectedNodeToolbar.app}
          nodeOwner={selectedNodeToolbar.owner}
          position={selectedNodeToolbar.position}
        />
      )}

      {/* Search - floating search button/input in top right */}
      <DiagramSearch
        isOpen={isSearchOpen}
        query={searchQuery}
        suggestions={searchSuggestions}
        onChangeQuery={setSearchQuery}
        onOpen={openSearch}
        onClose={closeSearch}
        onSelectSuggestion={handleSelectSuggestion}
      />
    </div>
  );
}
