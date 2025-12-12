/**
 * Splinter Inspector Store
 * 
 * Zustand store for managing splinter feature state.
 * 
 * @module features/splinter/model/store/splinter.store
 */

import { create } from 'zustand';

interface InspectorState {
  highlightedLines: number[];
  activeCommand: string | null;
  activeField: string | null;
  selectedText: string | null;
  selectedKnowledgeObjectId: string | null;
  
  setHighlightedLines: (lines: number[]) => void;
  setActiveCommand: (command: string | null) => void;
  setActiveField: (field: string | null) => void;
  setSelectedText: (text: string | null) => void;
  setSelectedKnowledgeObjectId: (id: string | null) => void;
  clearSelection: () => void;
}

export const useInspectorStore = create<InspectorState>((set) => ({
  highlightedLines: [],
  activeCommand: null,
  activeField: null,
  selectedText: null,
  selectedKnowledgeObjectId: null,

  setHighlightedLines: (lines) => set({ highlightedLines: lines }),
  setActiveCommand: (command) => set({ activeCommand: command }),
  setActiveField: (field) => set({ activeField: field }),
  setSelectedText: (text) => set({ selectedText: text }),
  setSelectedKnowledgeObjectId: (id) => set({ selectedKnowledgeObjectId: id }),
  clearSelection: () => set({ 
    activeCommand: null, 
    activeField: null, 
    highlightedLines: [],
    selectedText: null
    // Note: selectedKnowledgeObjectId is intentionally NOT cleared here
    // as it represents the current viewing context, separate from editor selection
  }),
}));
