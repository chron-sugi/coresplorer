/**
 * Editor Store
 *
 * Manages SPL editor state including the current search text,
 * parse results, and cursor position.
 *
 * @module entities/spl/store/editor-store
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { ParseResult } from '@/entities/spl/lib/parser';

// =============================================================================
// TYPES
// =============================================================================

interface EditorState {
  // Content
  splText: string;

  // Parse state
  parseResult: ParseResult | null;
  isParsing: boolean;
  parseError: string | null;

  // Cursor/selection
  cursorLine: number;
  cursorColumn: number;

  // Actions
  setSplText: (text: string) => void;
  setParseResult: (result: ParseResult) => void;
  setParseError: (error: string | null) => void;
  setIsParsing: (isParsing: boolean) => void;
  setCursor: (line: number, column: number) => void;
  reset: () => void;
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState = {
  splText: '',
  parseResult: null,
  isParsing: false,
  parseError: null,
  cursorLine: 1,
  cursorColumn: 1,
};

// =============================================================================
// STORE
// =============================================================================

export const useEditorStore = create<EditorState>()(
  subscribeWithSelector((set) => ({
    ...initialState,

    setSplText: (text) => set({ splText: text }),

    setParseResult: (result) =>
      set({
        parseResult: result,
        parseError: result.success ? null : 'Parse errors occurred',
      }),

    setParseError: (error) => set({ parseError: error }),

    setIsParsing: (isParsing) => set({ isParsing }),

    setCursor: (line, column) => set({ cursorLine: line, cursorColumn: column }),

    reset: () => set(initialState),
  })),
);

// =============================================================================
// SELECTORS
// =============================================================================

export const selectSplText = (state: EditorState) => state.splText;
export const selectParseResult = (state: EditorState) => state.parseResult;
export const selectAST = (state: EditorState) => state.parseResult?.ast ?? null;
export const selectIsParsing = (state: EditorState) => state.isParsing;
export const selectParseError = (state: EditorState) => state.parseError;
export const selectCursor = (state: EditorState) => ({
  line: state.cursorLine,
  column: state.cursorColumn,
});
