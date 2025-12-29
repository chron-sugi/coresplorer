/**
 * Diagram store (Zustand)
 *
 * Centralized UI state for the diagram feature. Exposes a small API
 * for updating core node, selection, visibility filters and panel tab.
 */
import { create } from 'zustand';

/**
 * Available tabs for the diagram context panel
 */
export type PanelTab = 'details' | 'spl' | 'impact';

interface DiagramState {
    coreId: string;
    hiddenTypes: Set<string>;
    selectedNodeId: string | null;
    activeTab: PanelTab;
    autoImpactMode: boolean;
    // Clustering state
    clusteredTypes: Set<string>;      // KO types that are clustered
    hubsClusterThreshold: number | null; // If set, nodes with >= this many connections are clustered
}

interface DiagramActions {
    setCoreId: (id: string) => void;
    toggleHiddenType: (type: string) => void;
    setSelectedNodeId: (id: string | null) => void;
    setActiveTab: (tab: PanelTab) => void;
    setAutoImpactMode: (enabled: boolean) => void;
    // Clustering actions
    toggleClusterType: (type: string) => void;
    setHubsClusterThreshold: (threshold: number | null) => void;
    clearAllClusters: () => void;
    reset: () => void;
}

type DiagramStore = DiagramState & DiagramActions;

const initialState: DiagramState = {
    coreId: '',  // Empty - must be set from URL or user action
    hiddenTypes: new Set(),
    selectedNodeId: null,
    activeTab: 'details',
    autoImpactMode: true,
    // Clustering
    clusteredTypes: new Set(),
    hubsClusterThreshold: null,
};

/**
 * Zustand store for diagram UI state
 * 
 * Manages core node selection, type visibility filters, selected node,
 * active panel tab, and auto-impact mode toggle. Provides centralized
 * state for all diagram interactions and visual configurations.
 * 
 * @returns Diagram store instance with state and actions
 */
export const useDiagramStore = create<DiagramStore>((set) => ({
    ...initialState,

    setCoreId: (id) => set((state) => ({
        coreId: id,
        selectedNodeId: state.coreId !== id ? null : state.selectedNodeId,
    })),
    
    toggleHiddenType: (type) => set((state) => {
        const next = new Set(state.hiddenTypes);
        if (next.has(type)) {
            next.delete(type);
        } else {
            next.add(type);
        }
        return { hiddenTypes: next };
    }),

    setSelectedNodeId: (id) => set({ selectedNodeId: id }),
    
    setActiveTab: (tab) => set({ activeTab: tab }),
    
    setAutoImpactMode: (enabled) => set({ autoImpactMode: enabled }),

    // Clustering actions
    toggleClusterType: (type) => set((state) => {
        const next = new Set(state.clusteredTypes);
        if (next.has(type)) {
            next.delete(type);
        } else {
            next.add(type);
        }
        return { clusteredTypes: next };
    }),

    setHubsClusterThreshold: (threshold) => set({ hubsClusterThreshold: threshold }),

    clearAllClusters: () => set({
        clusteredTypes: new Set(),
        hubsClusterThreshold: null,
    }),

    reset: () => set(initialState),
}));
