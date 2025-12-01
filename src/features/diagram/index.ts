/**
 * Public API for the diagram feature.
 * 
 * This barrel file exports the main component and types
 * that external features should use when interacting with the diagram.
 */

// Main component
export { Diagram } from './ui/Diagram';

// Store (Zustand - no provider needed)
export { useDiagramStore } from './model/store/diagram.store';
export type { PanelTab } from './model/store/diagram.store';

// Types (for consumers who need to work with diagram data)
export type { DiagramData, DiagramNodeData, DiagramEdge, NodeDetails, NodeDetailsData } from './diagram.schemas';

