/**
 * vis-network Initialization Hook
 *
 * Handles network initialization, event binding, and cleanup.
 * Creates DataSets and Network instance, binds all interaction events.
 *
 * @module features/diagram/model/hooks/useVisNetworkInit
 */
import { useEffect, useRef, useState, type RefObject } from 'react';
import { Network, DataSet } from 'vis-network/standalone';
import type { Data, Options } from 'vis-network';

import { useDiagramStore } from '../store/diagram.store';
import { VIS_NETWORK_OPTIONS, VIS_EDGE_OPTIONS } from '../constants/vis-network.constants';
import { UI_TIMING } from '../constants/diagram.ui.constants';
import type { VisNetworkNode, VisNetworkEdge } from '../../lib/vis-network-transform';

export interface UseVisNetworkInitOptions {
  containerRef: RefObject<HTMLDivElement | null>;
  onNodeClick: (nodeId: string) => void;
  onNodeDoubleClick: (nodeId: string) => void;
  onClusterDoubleClick: (clusterId: string) => void;
  onEmptyClick: () => void;
  onZoom: (nodeId: string | null) => void;
  onDragEnd: (nodeId: string | null) => void;
  setIsStabilizing: (value: boolean) => void;
}

export interface UseVisNetworkInitResult {
  networkRef: RefObject<Network | null>;
  nodesDataSetRef: RefObject<DataSet<VisNetworkNode> | null>;
  edgesDataSetRef: RefObject<DataSet<VisNetworkEdge> | null>;
  networkInstance: Network | null;
}

/**
 * Hook for initializing and managing vis-network instance
 */
export function useVisNetworkInit({
  containerRef,
  onNodeClick,
  onNodeDoubleClick,
  onClusterDoubleClick,
  onEmptyClick,
  onZoom,
  onDragEnd,
  setIsStabilizing,
}: UseVisNetworkInitOptions): UseVisNetworkInitResult {
  const networkRef = useRef<Network | null>(null);
  const nodesDataSetRef = useRef<DataSet<VisNetworkNode> | null>(null);
  const edgesDataSetRef = useRef<DataSet<VisNetworkEdge> | null>(null);
  const [networkInstance, setNetworkInstance] = useState<Network | null>(null);

  // Refs for event handlers to avoid stale closures
  const handleNodeClickRef = useRef(onNodeClick);
  const handleNodeDoubleClickRef = useRef(onNodeDoubleClick);
  const handleClusterDoubleClickRef = useRef(onClusterDoubleClick);
  const handleEmptyClickRef = useRef(onEmptyClick);
  const handleZoomRef = useRef(onZoom);
  const handleDragEndRef = useRef(onDragEnd);
  const selectedNodeIdRef = useRef<string | null>(null);

  // Update refs when callbacks change
  useEffect(() => {
    handleNodeClickRef.current = onNodeClick;
    handleNodeDoubleClickRef.current = onNodeDoubleClick;
    handleClusterDoubleClickRef.current = onClusterDoubleClick;
    handleEmptyClickRef.current = onEmptyClick;
    handleZoomRef.current = onZoom;
    handleDragEndRef.current = onDragEnd;
  }, [onNodeClick, onNodeDoubleClick, onClusterDoubleClick, onEmptyClick, onZoom, onDragEnd]);

  // Initialize vis-network when container is ready
  useEffect(() => {
    console.log('[vis-network] Init effect running, hasContainer:', !!containerRef.current);
    if (!containerRef.current) return;

    const container = containerRef.current;
    let pendingFrameId: number | null = null;
    let networkInstance: Network | null = null;

    // Wait for container to have valid dimensions before creating network
    // This prevents issues when navigating to diagram before layout is complete
    const initNetwork = () => {
      const { offsetWidth, offsetHeight } = container;
      console.log('[vis-network] initNetwork called, container dimensions:', { offsetWidth, offsetHeight });
      if (offsetWidth === 0 || offsetHeight === 0) {
        // Container not yet laid out, defer initialization
        console.log('[vis-network] Container has no dimensions, deferring via rAF');
        pendingFrameId = requestAnimationFrame(initNetwork);
        return;
      }
      console.log('[vis-network] Container ready, creating network');
      createNetwork();
    };

    const createNetwork = () => {
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
      const network = new Network(container, data, options);
      networkInstance = network;
      networkRef.current = network;
      setNetworkInstance(network);

      // Stabilization events
      network.on('stabilizationProgress', () => {
        // Stabilization in progress - UI indicator shown via isStabilizing state
      });

      network.on('stabilizationIterationsDone', () => {
        console.log('[vis-network] stabilizationIterationsDone fired, nodeCount:', nodesDataSet.length);
        setIsStabilizing(false);
        // Disable physics after stabilization for smoother interaction
        network.setOptions({ physics: { enabled: false } });

        // Skip view adjustments if network has no data yet (prevents race condition on first load)
        if (nodesDataSet.length === 0) {
          console.log('[vis-network] Skipping view adjustments - no nodes yet');
          return;
        }

        // Skip view adjustments during cluster expansion to keep view stationary
        const { isExpandingCluster, coreId: currentCoreId } = useDiagramStore.getState();
        console.log('[vis-network] Store state:', { isExpandingCluster, currentCoreId });
        if (isExpandingCluster) {
          console.log('[vis-network] Skipping view adjustments - cluster expanding');
          return;
        }

        // Force layout recalculation by briefly re-enabling hierarchical layout
        // This fixes initial misalignment caused by SVG images not being fully loaded
        // Include edge options to preserve curved edge settings
        network.setOptions({
          layout: { hierarchical: { enabled: true } },
          edges: VIS_EDGE_OPTIONS,
        });
        setTimeout(() => {
          // Disable both physics AND hierarchical layout to restore normal drag behavior
          network.setOptions({
            physics: { enabled: false },
            layout: { hierarchical: { enabled: false } },
          });
        }, UI_TIMING.HIERARCHICAL_LAYOUT_DELAY_MS);

        // Center on core node instead of fitting all nodes
        if (currentCoreId) {
          network.focus(currentCoreId, {
            scale: 1,
            animation: {
              duration: UI_TIMING.FIT_ANIMATION_MS,
              easingFunction: 'easeInOutQuad',
            },
          });
        } else {
          // Fallback to fit if no coreId
          network.fit({
            animation: {
              duration: UI_TIMING.FIT_ANIMATION_MS,
              easingFunction: 'easeInOutQuad',
            },
          });
        }
      });

      // Fallback: also listen to stabilized event
      network.on('stabilized', () => {
        setIsStabilizing(false);
      });

      // Click events
      network.on('click', (params) => {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0] as string;
          selectedNodeIdRef.current = nodeId;
          handleNodeClickRef.current(nodeId);
        } else {
          // Click on empty space - clear selection
          selectedNodeIdRef.current = null;
          handleEmptyClickRef.current();
        }
      });

      network.on('doubleClick', (params) => {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0] as string;
          const isCluster = network.isCluster(nodeId);

          // Check if it's a cluster - expand it instead of navigating
          if (isCluster) {
            handleClusterDoubleClickRef.current(nodeId);
            return;
          }

          // Otherwise, navigate to node's diagram (existing behavior)
          handleNodeDoubleClickRef.current(nodeId);
        }
      });

      // Hover events
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

      // Drag events
      network.on('dragStart', () => {
        // Hide toolbar during drag for performance
        selectedNodeIdRef.current = null;
      });

      network.on('dragging', () => {
        // No-op: Don't update React state during high-frequency drag events
      });

      network.on('dragEnd', () => {
        handleDragEndRef.current(selectedNodeIdRef.current);
      });

      // Zoom event - update toolbar position
      // Use requestAnimationFrame to defer state updates and avoid interfering with vis-network's zoom handling
      network.on('zoom', () => {
        const nodeId = selectedNodeIdRef.current;
        if (nodeId) {
          requestAnimationFrame(() => {
            handleZoomRef.current(nodeId);
          });
        }
      });
    };

    // Start initialization
    initNetwork();

    // Cleanup
    return () => {
      if (pendingFrameId !== null) {
        cancelAnimationFrame(pendingFrameId);
      }
      if (networkInstance) {
        networkInstance.destroy();
      }
      networkRef.current = null;
      nodesDataSetRef.current = null;
      edgesDataSetRef.current = null;
    };
    // Intentionally empty deps - one-time network initialization only.
    // All callbacks are stored in refs (updated via separate effect) to avoid stale closures.
    // Re-running this effect would destroy and recreate the network, losing state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    networkRef,
    nodesDataSetRef,
    edgesDataSetRef,
    networkInstance,
  };
}
