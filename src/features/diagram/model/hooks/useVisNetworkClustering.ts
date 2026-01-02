/**
 * vis-network Clustering Hook
 *
 * Manages clustering operations for the diagram canvas.
 * Supports clustering by KO type, hub nodes, and manual expansion.
 *
 * @module features/diagram/model/hooks/useVisNetworkClustering
 */
import { useCallback, useEffect, useRef, type RefObject } from 'react';
import type { Network, DataSet } from 'vis-network/standalone';

import { useDiagramStore } from '../store/diagram.store';
import { generateClusterSvgUrl } from '../../lib/node-svg-gen';
import { getKoColor, getKoLabel, type SplunkKoType } from '@/entities/knowledge-object';
import type { VisNetworkNode, VisNetworkEdge } from '../../lib/vis-network-transform';

export interface UseVisNetworkClusteringOptions {
  networkRef: RefObject<Network | null>;
  nodesDataSetRef: RefObject<DataSet<VisNetworkNode> | null>;
  edgesDataSetRef: RefObject<DataSet<VisNetworkEdge> | null>;
  coreId: string | null;
  clearHighlighting: () => void;
}

export interface UseVisNetworkClusteringResult {
  clusterByType: (koType: SplunkKoType) => void;
  unclusterByType: (koType: SplunkKoType) => void;
  clusterHubs: (threshold?: number) => void;
  expandCluster: (clusterId: string) => void;
  expandAllClusters: () => void;
  clusteredTypes: Set<string>;
  hubsClusterThreshold: number | null;
}

/**
 * Hook for managing vis-network clustering operations
 */
export function useVisNetworkClustering({
  networkRef,
  nodesDataSetRef,
  edgesDataSetRef,
  coreId,
  clearHighlighting,
}: UseVisNetworkClusteringOptions): UseVisNetworkClusteringResult {
  // Store state
  const clusteredTypes = useDiagramStore((state) => state.clusteredTypes);
  const hubsClusterThreshold = useDiagramStore((state) => state.hubsClusterThreshold);
  const toggleClusterType = useDiagramStore((state) => state.toggleClusterType);
  const setHubsClusterThreshold = useDiagramStore((state) => state.setHubsClusterThreshold);
  const setIsExpandingCluster = useDiagramStore((state) => state.setIsExpandingCluster);
  const clearAllClusters = useDiagramStore((state) => state.clearAllClusters);

  /**
   * Spread nodes apart after unclustering using brief physics simulation
   * View stays stationary - no zoom/pan changes
   * Note: Caller must set isExpandingCluster flag before calling openCluster()
   */
  const spreadNodesAfterUncluster = useCallback(() => {
    if (!networkRef.current) return;

    const network = networkRef.current;

    // Enable physics briefly to spread stacked nodes apart
    network.setOptions({ physics: { enabled: true } });
    network.stabilize(50); // Very brief - just enough to spread nodes

    // Disable physics after a short delay - no fit, keep view stationary
    setTimeout(() => {
      network.setOptions({ physics: { enabled: false } });
      setIsExpandingCluster(false);
    }, 100);
  }, [networkRef, setIsExpandingCluster]);

  /**
   * Cluster all nodes of a specific KO type, grouped by level
   * Creates separate clusters for each level to preserve hierarchy
   */
  const clusterByType = useCallback(
    (koType: SplunkKoType) => {
      if (!networkRef.current || !nodesDataSetRef.current) return;

      const network = networkRef.current;
      const color = getKoColor(koType);
      const label = getKoLabel(koType);

      // Get nodes of this type (excluding core node)
      const nodesOfType = nodesDataSetRef.current
        .get()
        .filter((n) => n.objectType === koType && n.id !== coreId);

      if (nodesOfType.length < 2) {
        // Don't cluster if only 0-1 nodes total
        return;
      }

      // Group nodes by level
      const nodesByLevel = new Map<number, VisNetworkNode[]>();
      nodesOfType.forEach((node) => {
        const level = (node.level as number) || 0;
        if (!nodesByLevel.has(level)) {
          nodesByLevel.set(level, []);
        }
        nodesByLevel.get(level)!.push(node);
      });

      // Create a cluster for each level that has 2+ nodes
      let clustersCreated = 0;
      nodesByLevel.forEach((nodesAtLevel, level) => {
        if (nodesAtLevel.length < 2) {
          // Don't cluster if only 0-1 nodes at this level
          return;
        }

        const clusterImage = generateClusterSvgUrl({
          label,
          count: nodesAtLevel.length,
          color,
          isHub: false,
        });

        const nodeIdsAtLevel = new Set(nodesAtLevel.map((n) => n.id));

        network.cluster({
          joinCondition: (nodeOptions: VisNetworkNode) => {
            return nodeIdsAtLevel.has(nodeOptions.id as string);
          },
          clusterNodeProperties: {
            id: `cluster-${koType}-level-${level}`,
            shape: 'image',
            image: clusterImage,
            size: 50, // Display size for cluster node
            label: ' ',
            font: { size: 0 },
            objectType: koType,
            isCluster: true,
            level: level, // Keep at the same level
          } as VisNetworkNode,
          clusterEdgeProperties: {
            color: { color: color, opacity: 0.6 },
            width: 2,
          },
        });

        clustersCreated++;
      });

      // Update store if any clusters were created (view stays stationary)
      if (clustersCreated > 0) {
        if (!clusteredTypes.has(koType)) {
          toggleClusterType(koType);
        }
      }
    },
    [networkRef, nodesDataSetRef, coreId, clusteredTypes, toggleClusterType]
  );

  /**
   * Expand all clusters of a specific type (across all levels)
   */
  const unclusterByType = useCallback(
    (koType: SplunkKoType) => {
      if (!networkRef.current) return;

      const network = networkRef.current;
      const clusterPrefix = `cluster-${koType}-level-`;

      // Set flag BEFORE openCluster to prevent stabilization events from refitting
      setIsExpandingCluster(true);

      // Find and expand all clusters matching this type
      // Note: Cluster nodes are NOT in the DataSet - use network.body.nodeIndices
      // @ts-expect-error - accessing internal vis-network properties
      const allNodeIds = [...(network.body.nodeIndices as string[])];
      let clustersExpanded = 0;
      allNodeIds.forEach((nodeId) => {
        if (nodeId.startsWith(clusterPrefix) && network.isCluster(nodeId)) {
          network.openCluster(nodeId);
          clustersExpanded++;
        }
      });

      // Update store
      if (clusteredTypes.has(koType)) {
        toggleClusterType(koType);
      }

      // Spread nodes apart if any clusters were expanded (will clear flag when done)
      if (clustersExpanded > 0) {
        spreadNodesAfterUncluster();
      } else {
        setIsExpandingCluster(false);
      }
    },
    [networkRef, clusteredTypes, toggleClusterType, setIsExpandingCluster, spreadNodesAfterUncluster]
  );

  /**
   * Cluster nodes with many connections (hubs) into a single cluster
   * Unlike type clustering, hubs are grouped together regardless of level
   */
  const clusterHubs = useCallback(
    (threshold: number = 5) => {
      if (!networkRef.current || !nodesDataSetRef.current || !edgesDataSetRef.current) return;

      const network = networkRef.current;
      const hubColor = '#6366f1'; // Indigo for hubs

      // Count connections for each node
      const connectionCounts = new Map<string, number>();
      edgesDataSetRef.current.forEach((edge) => {
        const from = edge.from as string;
        const to = edge.to as string;
        connectionCounts.set(from, (connectionCounts.get(from) || 0) + 1);
        connectionCounts.set(to, (connectionCounts.get(to) || 0) + 1);
      });

      // Find hub nodes (excluding core node)
      const hubNodes = nodesDataSetRef.current
        .get()
        .filter((node) => {
          const nodeId = node.id as string;
          const connections = connectionCounts.get(nodeId) || 0;
          return connections >= threshold && nodeId !== coreId;
        });

      if (hubNodes.length < 2) {
        // Don't cluster if only 0-1 hub nodes total
        return;
      }

      // Calculate median level for the hub cluster
      const levels = hubNodes.map((n) => (n.level as number) || 0).sort((a, b) => a - b);
      const medianLevel = levels[Math.floor(levels.length / 2)];

      // Create a single cluster for all hubs
      const clusterImage = generateClusterSvgUrl({
        label: 'Hub',
        count: hubNodes.length,
        color: hubColor,
        isHub: true,
      });

      const hubNodeIds = new Set(hubNodes.map((n) => n.id));

      network.cluster({
        joinCondition: (nodeOptions: VisNetworkNode) => {
          return hubNodeIds.has(nodeOptions.id as string);
        },
        clusterNodeProperties: {
          id: 'cluster-hubs',
          shape: 'image',
          image: clusterImage,
          size: 50, // Display size for cluster node
          label: ' ',
          font: { size: 0 },
          isCluster: true,
          isHubCluster: true,
          level: medianLevel,
        } as VisNetworkNode,
        clusterEdgeProperties: {
          color: { color: hubColor, opacity: 0.6 },
          width: 2,
        },
      });

      // Update store (view stays stationary)
      setHubsClusterThreshold(threshold);
    },
    [networkRef, nodesDataSetRef, edgesDataSetRef, coreId, setHubsClusterThreshold]
  );

  /**
   * Expand a specific cluster node
   * Note: This only expands the individual cluster, not all clusters of that type.
   * The store state is not updated here since there may be multiple clusters per type.
   */
  const expandCluster = useCallback(
    (clusterId: string) => {
      if (!networkRef.current) return;

      const network = networkRef.current;

      if (!network.isCluster(clusterId)) {
        return;
      }

      // Clear highlighting before expanding to prevent greyed nodes
      clearHighlighting();

      // Set flag BEFORE openCluster to prevent stabilization events from refitting
      setIsExpandingCluster(true);

      network.openCluster(clusterId);

      // Spread the stacked nodes apart (will clear flag when done)
      spreadNodesAfterUncluster();
    },
    [networkRef, clearHighlighting, setIsExpandingCluster, spreadNodesAfterUncluster]
  );

  /**
   * Expand all clusters
   */
  const expandAllClusters = useCallback(() => {
    if (!networkRef.current) return;

    const network = networkRef.current;

    // Clear highlighting before expanding to prevent greyed nodes
    clearHighlighting();

    // Set flag BEFORE openCluster to prevent stabilization events from refitting
    setIsExpandingCluster(true);

    // Find all cluster nodes and expand them
    // Note: Cluster nodes are NOT in the DataSet - they're created dynamically by vis.js
    // and exist only in network.body.nodeIndices
    let clustersExpanded = 0;
    // @ts-expect-error - accessing internal vis-network properties
    const allNodeIds = [...(network.body.nodeIndices as string[])];
    allNodeIds.forEach((nodeId) => {
      if (network.isCluster(nodeId)) {
        network.openCluster(nodeId);
        clustersExpanded++;
      }
    });

    // Clear store
    clearAllClusters();

    // Spread nodes apart if any clusters were expanded (will clear flag when done)
    if (clustersExpanded > 0) {
      spreadNodesAfterUncluster();
    } else {
      setIsExpandingCluster(false);
    }
  }, [networkRef, clearAllClusters, clearHighlighting, setIsExpandingCluster, spreadNodesAfterUncluster]);

  // Expose expandCluster via ref for event handlers
  const expandClusterRef = useRef(expandCluster);
  useEffect(() => {
    expandClusterRef.current = expandCluster;
  }, [expandCluster]);

  return {
    clusterByType,
    unclusterByType,
    clusterHubs,
    expandCluster,
    expandAllClusters,
    clusteredTypes,
    hubsClusterThreshold,
  };
}
