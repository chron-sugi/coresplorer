/**
 * Public API for the diagram feature.
 * 
 * This barrel file exports the main component and types
 * that external features should use when interacting with the diagram.
 */

// Main component
export { Diagram } from './ui/Diagram';

// UI components for pages
export { DiagramContextPanel } from './ui/ContextPanel/ContextPanel';
export { DiagramCanvas } from './ui/Canvas/Canvas';

// Store (Zustand - no provider needed)
export { useDiagramStore } from './model/store/diagram.store';
export type { PanelTab } from './model/store/diagram.store';

// Types (for consumers who need to work with diagram data)
// View model types from types.ts
export type { DiagramData, DiagramNodeData, DiagramNodeView, DiagramEdgeView } from './model/types';
// Schema types for external data validation
export type { NodeDetails, NodeDetailsData, RawDiagramData, RawDiagramNodeData, RawDiagramEdge } from './model/diagram.schemas';

