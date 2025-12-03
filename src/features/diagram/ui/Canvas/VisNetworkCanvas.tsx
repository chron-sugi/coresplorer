/**
 * vis-network Canvas Component
 *
 * Renders the diagram using vis-network library for force-directed layout.
 * Handles initialization, data binding, and user interactions.
 *
 * @module features/diagram/ui/Canvas/VisNetworkCanvas
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Network, DataSet } from 'vis-network/standalone';
import type { Data, Options } from 'vis-network';
import { Network as NetworkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useDiagramStore } from '../../model/store/diagram.store';
import { useDiagramData } from '../../model/hooks/useDiagramData';
import { VIS_NETWORK_OPTIONS } from '../../model/constants/vis-network.constants';
import {
  transformDiagramData,
  applyNodeHighlight,
  applyEdgeHighlight,
  type VisNetworkNode,
  type VisNetworkEdge,
} from '../../lib/vis-network-transform';
import { useGraphHighlighting } from '../../model/hooks/useGraphHighlighting';
import { DiagramToolbar } from './Toolbar';
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
  const [isStabilizing, setIsStabilizing] = useState(true);

  // Highlighting - create edge array for highlighting hook
  const edgesForHighlighting = useRef<Array<{ id: string; source: string; target: string }>>([]);

  const {
    focusNodeId,
    setFocusNodeId,
    impactMode,
    setImpactMode,
    highlightedNodes,
    highlightedEdges,
    clearHighlighting,
  } = useGraphHighlighting(edgesForHighlighting.current);

  // Initialize vis-network when container is ready
  useEffect(() => {
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
    networkRef.current = network;

    // Event handlers
    network.on('stabilizationProgress', (params) => {
      const progress = Math.round((params.iterations / params.total) * 100);
      console.log(`Stabilization: ${progress}%`);
    });

    network.on('stabilizationIterationsDone', () => {
      setIsStabilizing(false);
      network.fit({
        animation: {
          duration: 500,
          easingFunction: 'easeInOutQuad',
        },
      });
    });

    network.on('click', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0] as string;
        handleNodeClick(nodeId);
      } else {
        // Click on empty space - clear selection
        setSelectedNodeId(null);
        clearHighlighting();
      }
    });

    network.on('doubleClick', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0] as string;
        handleNodeDoubleClick(nodeId);
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

  // Update data when nodes/edges from useDiagramData changes
  useEffect(() => {
    if (!nodesDataSetRef.current || !edgesDataSetRef.current) return;
    if (nodes.length === 0) return;

    // Transform data to vis-network format
    const { nodes: visNodes, edges: visEdges } = transformDiagramData(nodes, edges, coreId);

    // Store edges for highlighting hook
    edgesForHighlighting.current = visEdges.map((e) => ({
      id: e.id as string,
      source: e.from as string,
      target: e.to as string,
    }));

    // Update DataSets (this triggers network redraw)
    nodesDataSetRef.current.clear();
    nodesDataSetRef.current.add(visNodes);

    edgesDataSetRef.current.clear();
    edgesDataSetRef.current.add(visEdges);

    // Restart stabilization
    setIsStabilizing(true);
    if (networkRef.current) {
      networkRef.current.stabilize(1000);
    }
  }, [nodes, edges, coreId]);

  // Apply highlighting when highlight state changes
  useEffect(() => {
    if (!nodesDataSetRef.current || !edgesDataSetRef.current) return;
    if (impactMode === 'off' && !focusNodeId) return;

    const nodeUpdates: VisNetworkNode[] = [];
    const edgeUpdates: VisNetworkEdge[] = [];

    // Update node styles
    nodesDataSetRef.current.forEach((node) => {
      const isHighlighted = highlightedNodes.has(node.id as string);
      const isDimmed = impactMode !== 'off' && !isHighlighted;
      const isFocused = node.id === focusNodeId;

      const styleUpdate = applyNodeHighlight(node, { isFocused, isHighlighted, isDimmed });
      nodeUpdates.push({ id: node.id, ...styleUpdate } as VisNetworkNode);
    });

    // Update edge styles
    edgesDataSetRef.current.forEach((edge) => {
      const isHighlighted = highlightedEdges.has(edge.id as string);
      const isDimmed = impactMode !== 'off' && !isHighlighted;

      const styleUpdate = applyEdgeHighlight(isHighlighted, isDimmed);
      edgeUpdates.push({ id: edge.id, ...styleUpdate } as VisNetworkEdge);
    });

    nodesDataSetRef.current.update(nodeUpdates);
    edgesDataSetRef.current.update(edgeUpdates);
  }, [focusNodeId, impactMode, highlightedNodes, highlightedEdges]);

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
              duration: 500,
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
                duration: 500,
                easingFunction: 'easeInOutQuad',
              },
            });
          }
        }}
      />
    </div>
  );
}
