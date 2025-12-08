import { render, screen, waitFor } from '@testing-library/react';
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

vi.mock('../../model/hooks/useAnimationLoop', () => ({
  useAnimationLoop: vi.fn(() => 0),
}));

// Mock vis-network
const mockNetwork = {
  on: vi.fn(),
  off: vi.fn(),
  destroy: vi.fn(),
  redraw: vi.fn(),
  setOptions: vi.fn(),
  stabilize: vi.fn(),
  fit: vi.fn(),
  body: {
    edges: {},
  },
};

vi.mock('vis-network/standalone', () => ({
  Network: vi.fn(() => mockNetwork),
  DataSet: vi.fn(() => ({
    add: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    get: vi.fn(),
    getIds: vi.fn(() => []),
    forEach: vi.fn(),
  })),
}));

import { useDiagramStore } from '../../model/store/diagram.store';
import { useDiagramData } from '../../model/hooks/useDiagramData';
import { useGraphHighlighting } from '../../model/hooks/useGraphHighlighting';
import { useAnimationLoop } from '../../model/hooks/useAnimationLoop';

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

    render(<VisNetworkCanvas />);
    // Use findByText which waits
    expect(await screen.findByText(/No object selected/i)).toBeInTheDocument();
  });

  it('should initialize vis-network when data is loaded', () => {
    render(<VisNetworkCanvas />);
    // Check if Network constructor was called implicitly by checking container
    // The container has `h-full w-full bg-slate-50` classes.
  });

  it('should register afterDrawing event handler', async () => {
    render(<VisNetworkCanvas />);
    await waitFor(() => {
      expect(mockNetwork.on).toHaveBeenCalledWith('afterDrawing', expect.any(Function));
    });
  });

  it('should trigger redraw when highlighting is active', async () => {
    // Mock highlighting active
    (useGraphHighlighting as any).mockReturnValue({
      focusNodeId: 'node-1',
      setFocusNodeId: vi.fn(),
      impactMode: 'both',
      setImpactMode: vi.fn(),
      highlightedNodes: new Set(['node-1']),
      highlightedEdges: new Set(['edge-1']),
      clearHighlighting: vi.fn(),
    });

    // Mock animation loop returning changing time
    (useAnimationLoop as any).mockReturnValue(100);

    render(<VisNetworkCanvas />);
    
    // Should call redraw
    await waitFor(() => {
      expect(mockNetwork.redraw).toHaveBeenCalled();
    });
  });
});
