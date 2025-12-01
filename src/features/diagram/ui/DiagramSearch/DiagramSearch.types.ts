/**
 * DiagramSearch types
 *
 * Type definitions for the diagram quick-search feature component and its props.
 * Now uses Zod-inferred types for consistency with validation schemas.
 */
import type { DiagramSearchSuggestion } from '../../diagram.schemas';

export type { DiagramSearchSuggestion };

export interface DiagramSearchProps {
  isOpen: boolean;
  query: string;
  suggestions: DiagramSearchSuggestion[];
  onChangeQuery: (value: string) => void;
  onClose: () => void;
  onSelectSuggestion: (suggestionId: string) => void;
}
