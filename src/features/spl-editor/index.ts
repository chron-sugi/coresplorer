/**
 * SPL Editor Feature
 * 
 * Provides an editor component for SPL searches with syntax highlighting
 * and field lineage interactions.
 * 
 * @module features/spl-editor
 */

// UI Components
export { SPLEditor } from './ui/SPLEditor';
export type { SPLEditorProps } from './ui/SPLEditor';

// Hooks
export { useHoverInfo } from './hooks/useHoverInfo';
export { useLineageHighlight } from './hooks/useLineageHighlight';
