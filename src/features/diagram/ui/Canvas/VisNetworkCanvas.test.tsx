import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VisNetworkCanvas } from './VisNetworkCanvas';

// Mock dependencies
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('../../model/store/diagram.store', () => ({
  useDiagramStore: vi.fn(),
}));

vi.mock('../../model/hooks/useDiagramData', () => ({
  useDiagramData: vi.fn(() => ({
    nodes: [],
    edges: [],
    loading: false,
    error: null,
  })),
}));

vi.mock('../../model/hooks/useGraphHighlighting', () => ({
  useGraphHighlighting: vi.fn(() => ({
    focusNodeId: null,
    setFocusNodeId: vi.fn(),
    impactMode: 'off',
    setImpactMode: vi.fn(),
    highlightedNodes: new Set(),
    highlightedEdges: new Set(),
    clearHighlighting: vi.fn(),
  })),
}));

vi.mock('../../model/hooks/useDiagramSearch', () => ({
  useDiagramSearch: vi.fn(() => ({
    isOpen: false,
    query: '',
    suggestions: [],
    openSearch: vi.fn(),
    closeSearch: vi.fn(),
    setQuery: vi.fn(),
    handleSelectSuggestion: vi.fn(),
  })),
}));

// Mock the extracted hooks
const mockNetworkRef = { current: null };
const mockNodesDataSetRef = { current: null };
const mockEdgesDataSetRef = { current: null };

vi.mock('../../model/hooks/useVisNetworkInit', () => ({
  useVisNetworkInit: vi.fn(() => ({
    networkRef: mockNetworkRef,
    nodesDataSetRef: mockNodesDataSetRef,
    edgesDataSetRef: mockEdgesDataSetRef,
    networkInstance: null,
  })),
}));

vi.mock('../../model/hooks/useVisNetworkClustering', () => ({
  useVisNetworkClustering: vi.fn(() => ({
    clusterByType: vi.fn(),
    unclusterByType: vi.fn(),
    clusterHubs: vi.fn(),
    expandCluster: vi.fn(),
    expandAllClusters: vi.fn(),
    clusteredTypes: new Set(),
    hubsClusterThreshold: null,
  })),
}));

vi.mock('../../model/hooks/useMarchingAntsAnimation', () => ({
  useMarchingAntsAnimation: vi.fn(),
}));

import { useDiagramStore } from '../../model/store/diagram.store';
import { useDiagramData } from '../../model/hooks/useDiagramData';
import { useGraphHighlighting } from '../../model/hooks/useGraphHighlighting';
import { useVisNetworkInit } from '../../model/hooks/useVisNetworkInit';
import { useVisNetworkClustering } from '../../model/hooks/useVisNetworkClustering';
import { useMarchingAntsAnimation } from '../../model/hooks/useMarchingAntsAnimation';

describe('VisNetworkCanvas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default store state
    (useDiagramStore as any).mockImplementation((selector: any) => {
      const state = {
        coreId: 'core-1',
        hiddenTypes: [],
        setSelectedNodeId: vi.fn(),
        setActiveTab: vi.fn(),
        autoImpactMode: false,
      };
      return selector(state);
    });
  });

  it('should render loading state', () => {
    (useDiagramData as any).mockReturnValue({
      nodes: [],
      edges: [],
      loading: true,
      error: null,
    });

    render(<VisNetworkCanvas />);
    expect(screen.getByText(/Loading graph data/i)).toBeInTheDocument();
  });

  it('should render error state', () => {
    (useDiagramData as any).mockReturnValue({
      nodes: [],
      edges: [],
      loading: false,
      error: 'Network error',
    });

    render(<VisNetworkCanvas />);
    expect(screen.getByText(/Error loading graph/i)).toBeInTheDocument();
  });

  it('should render empty state when no coreId', async () => {
    (useDiagramStore as any).mockImplementation((selector: any) => {
      const state = {
        coreId: null, // No core selected
        hiddenTypes: [],
        setSelectedNodeId: vi.fn(),
        setActiveTab: vi.fn(),
        autoImpactMode: false,
      };
      return selector(state);
    });

    (useDiagramData as any).mockReturnValue({
      nodes: [],
      edges: [],
      loading: false,
      error: null,
    });

    render(<VisNetworkCanvas />);
    expect(await screen.findByText(/No object selected/i)).toBeInTheDocument();
  });

  it('should call useVisNetworkInit with containerRef', () => {
    render(<VisNetworkCanvas />);

    expect(useVisNetworkInit).toHaveBeenCalledWith(
      expect.objectContaining({
        containerRef: expect.any(Object),
        onNodeClick: expect.any(Function),
        onNodeDoubleClick: expect.any(Function),
        onClusterDoubleClick: expect.any(Function),
        onEmptyClick: expect.any(Function),
        onZoom: expect.any(Function),
        onDragEnd: expect.any(Function),
        setIsStabilizing: expect.any(Function),
      })
    );
  });

  it('should call useVisNetworkClustering with network refs', () => {
    render(<VisNetworkCanvas />);

    expect(useVisNetworkClustering).toHaveBeenCalledWith(
      expect.objectContaining({
        networkRef: mockNetworkRef,
        nodesDataSetRef: mockNodesDataSetRef,
        edgesDataSetRef: mockEdgesDataSetRef,
        coreId: 'core-1',
        clearHighlighting: expect.any(Function),
      })
    );
  });

  it('should call useMarchingAntsAnimation with network instance and highlighted edges', () => {
    render(<VisNetworkCanvas />);

    expect(useMarchingAntsAnimation).toHaveBeenCalledWith(
      expect.objectContaining({
        networkInstance: null,
        highlightedEdges: expect.any(Set),
      })
    );
  });

  it('should render toolbar when coreId is set', () => {
    (useDiagramData as any).mockReturnValue({
      nodes: [{ id: 'node-1', data: { label: 'Test Node', object_type: 'saved_search' } }],
      edges: [],
      loading: false,
      error: null,
    });

    render(<VisNetworkCanvas />);

    // The canvas container should be rendered
    const containers = document.querySelectorAll('.bg-slate-50');
    expect(containers.length).toBeGreaterThan(0);
  });

  it('should pass clustering methods to toolbar', () => {
    const mockClusterByType = vi.fn();
    const mockClusterHubs = vi.fn();
    const mockExpandAllClusters = vi.fn();

    (useVisNetworkClustering as any).mockReturnValue({
      clusterByType: mockClusterByType,
      unclusterByType: vi.fn(),
      clusterHubs: mockClusterHubs,
      expandCluster: vi.fn(),
      expandAllClusters: mockExpandAllClusters,
      clusteredTypes: new Set(['saved_search']),
      hubsClusterThreshold: 5,
    });

    render(<VisNetworkCanvas />);

    // Verify clustering hook was called
    expect(useVisNetworkClustering).toHaveBeenCalled();
  });

  it('should call useMarchingAntsAnimation with highlighted edges when highlighting is active', () => {
    const highlightedEdges = new Set(['edge-1', 'edge-2']);

    (useGraphHighlighting as any).mockReturnValue({
      focusNodeId: 'node-1',
      setFocusNodeId: vi.fn(),
      impactMode: 'both',
      setImpactMode: vi.fn(),
      highlightedNodes: new Set(['node-1']),
      highlightedEdges,
      clearHighlighting: vi.fn(),
    });

    render(<VisNetworkCanvas />);

    expect(useMarchingAntsAnimation).toHaveBeenCalledWith(
      expect.objectContaining({
        highlightedEdges,
      })
    );
  });
});
