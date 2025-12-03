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

// Hooks
export { useHoverInfo } from './model/useHoverInfo';
export { useLineageHighlight } from './model/useLineageHighlight';

// Types
export type {
  SPLEditorProps,
  HoveredField,
  SelectedField,
  UseHoverInfoOptions,
  UseHoverInfoReturn,
  UseLineageHighlightOptions,
  UseLineageHighlightReturn,
} from './model/spl-editor.types';
