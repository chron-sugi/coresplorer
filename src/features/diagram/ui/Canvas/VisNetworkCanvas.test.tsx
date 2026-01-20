import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VisNetworkCanvas } from './VisNetworkCanvas';

vi.mock('vis-network/standalone', () => {
  class DataSet {
    private items = new Map<string, any>();
    constructor() {}
    update(items: any[] = []) {
      items.forEach((item) => {
        if (item?.id) {
          this.items.set(String(item.id), item);
        }
      });
    }
    getIds() {
      return Array.from(this.items.keys());
    }
    remove(ids: string[] = []) {
      ids.forEach((id) => this.items.delete(String(id)));
    }
    forEach(cb: (item: any) => void) {
      this.items.forEach((value) => cb(value));
    }
    get(id: string) {
      return this.items.get(String(id));
    }
  }

  class Network {
    body = { edges: {} };
    on() {}
    off() {}
    destroy() {}
    setOptions() {}
    fit() {}
    focus() {}
    moveTo() {}
    stabilize() {}
    getScale() { return 1; }
    getPositions() { return {}; }
    canvasToDOM(pos: any) { return pos || { x: 0, y: 0 }; }
    redraw() {}
  }

  return { DataSet, Network };
});

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

import { useDiagramStore } from '../../model/store/diagram.store';
import { useDiagramData } from '../../model/hooks/useDiagramData';
import { useGraphHighlighting } from '../../model/hooks/useGraphHighlighting';

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

  it('should render toolbar when coreId is set', () => {
    (useDiagramData as any).mockReturnValue({
      nodes: [{ id: 'node-1', data: { label: 'Test Node', object_type: 'saved_search' } }],
      edges: [],
      loading: false,
      error: null,
    });

    render(<VisNetworkCanvas />);

    expect(screen.getByTitle('Zoom in')).toBeInTheDocument();
    expect(screen.getByTitle('Zoom out')).toBeInTheDocument();
    expect(screen.getByTitle('Fit view')).toBeInTheDocument();
  });
  it('should not throw when highlighting is active', () => {
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

    expect(() => render(<VisNetworkCanvas />)).not.toThrow();
  });
});
