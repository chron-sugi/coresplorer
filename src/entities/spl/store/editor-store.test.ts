/**
 * Editor Store Tests
 *
 * Tests for the Zustand store managing SPL editor state.
 *
 * @module entities/spl/store/editor-store.test
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import {
  useEditorStore,
  selectSplText,
  selectParseResult,
  selectAST,
  selectIsParsing,
  selectParseError,
  selectCursor,
} from './editor-store';
import type { ParseResult } from '@/entities/spl/lib/parser';

// Mock parse results
const createSuccessfulParseResult = (): ParseResult => ({
  success: true,
  ast: {
    type: 'Pipeline',
    commands: [
      {
        type: 'Command',
        name: 'search',
        args: [],
        location: { start: { line: 1, column: 1 }, end: { line: 1, column: 20 } },
      },
    ],
    location: { start: { line: 1, column: 1 }, end: { line: 1, column: 20 } },
  },
  errors: [],
  tokens: [],
});

const createFailedParseResult = (): ParseResult => ({
  success: false,
  ast: null,
  errors: [
    {
      message: 'Unexpected token',
      location: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
    },
  ],
  tokens: [],
});

describe('useEditorStore', () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      useEditorStore.getState().reset();
    });
  });

  describe('initial state', () => {
    it('has empty splText initially', () => {
      const state = useEditorStore.getState();
      expect(state.splText).toBe('');
    });

    it('has null parseResult initially', () => {
      const state = useEditorStore.getState();
      expect(state.parseResult).toBeNull();
    });

    it('has isParsing false initially', () => {
      const state = useEditorStore.getState();
      expect(state.isParsing).toBe(false);
    });

    it('has null parseError initially', () => {
      const state = useEditorStore.getState();
      expect(state.parseError).toBeNull();
    });

    it('has cursorLine 1 initially', () => {
      const state = useEditorStore.getState();
      expect(state.cursorLine).toBe(1);
    });

    it('has cursorColumn 1 initially', () => {
      const state = useEditorStore.getState();
      expect(state.cursorColumn).toBe(1);
    });
  });

  describe('setSplText', () => {
    it('sets the SPL text', () => {
      act(() => {
        useEditorStore.getState().setSplText('index=main | stats count');
      });

      expect(useEditorStore.getState().splText).toBe('index=main | stats count');
    });

    it('replaces existing text', () => {
      act(() => {
        useEditorStore.getState().setSplText('first query');
        useEditorStore.getState().setSplText('second query');
      });

      expect(useEditorStore.getState().splText).toBe('second query');
    });

    it('can set empty text', () => {
      act(() => {
        useEditorStore.getState().setSplText('some text');
        useEditorStore.getState().setSplText('');
      });

      expect(useEditorStore.getState().splText).toBe('');
    });

    it('handles multiline text', () => {
      const multilineQuery = `index=main
| stats count by host
| sort -count`;

      act(() => {
        useEditorStore.getState().setSplText(multilineQuery);
      });

      expect(useEditorStore.getState().splText).toBe(multilineQuery);
    });
  });

  describe('setParseResult', () => {
    it('sets successful parse result and clears error', () => {
      const result = createSuccessfulParseResult();

      act(() => {
        useEditorStore.getState().setParseResult(result);
      });

      const state = useEditorStore.getState();
      expect(state.parseResult).toBe(result);
      expect(state.parseError).toBeNull();
    });

    it('sets failed parse result with error message', () => {
      const result = createFailedParseResult();

      act(() => {
        useEditorStore.getState().setParseResult(result);
      });

      const state = useEditorStore.getState();
      expect(state.parseResult).toBe(result);
      expect(state.parseError).toBe('Parse errors occurred');
    });

    it('clears error when switching from failed to successful', () => {
      const failedResult = createFailedParseResult();
      const successResult = createSuccessfulParseResult();

      act(() => {
        useEditorStore.getState().setParseResult(failedResult);
        useEditorStore.getState().setParseResult(successResult);
      });

      const state = useEditorStore.getState();
      expect(state.parseError).toBeNull();
    });
  });

  describe('setParseError', () => {
    it('sets parse error message', () => {
      act(() => {
        useEditorStore.getState().setParseError('Custom error message');
      });

      expect(useEditorStore.getState().parseError).toBe('Custom error message');
    });

    it('can clear error by setting null', () => {
      act(() => {
        useEditorStore.getState().setParseError('Some error');
        useEditorStore.getState().setParseError(null);
      });

      expect(useEditorStore.getState().parseError).toBeNull();
    });
  });

  describe('setIsParsing', () => {
    it('sets isParsing to true', () => {
      act(() => {
        useEditorStore.getState().setIsParsing(true);
      });

      expect(useEditorStore.getState().isParsing).toBe(true);
    });

    it('sets isParsing to false', () => {
      act(() => {
        useEditorStore.getState().setIsParsing(true);
        useEditorStore.getState().setIsParsing(false);
      });

      expect(useEditorStore.getState().isParsing).toBe(false);
    });
  });

  describe('setCursor', () => {
    it('sets cursor position', () => {
      act(() => {
        useEditorStore.getState().setCursor(5, 10);
      });

      const state = useEditorStore.getState();
      expect(state.cursorLine).toBe(5);
      expect(state.cursorColumn).toBe(10);
    });

    it('updates cursor position', () => {
      act(() => {
        useEditorStore.getState().setCursor(1, 1);
        useEditorStore.getState().setCursor(3, 15);
      });

      const state = useEditorStore.getState();
      expect(state.cursorLine).toBe(3);
      expect(state.cursorColumn).toBe(15);
    });

    it('handles large line numbers', () => {
      act(() => {
        useEditorStore.getState().setCursor(1000, 500);
      });

      const state = useEditorStore.getState();
      expect(state.cursorLine).toBe(1000);
      expect(state.cursorColumn).toBe(500);
    });
  });

  describe('reset', () => {
    it('resets all state to initial values', () => {
      const result = createSuccessfulParseResult();

      act(() => {
        useEditorStore.getState().setSplText('index=main');
        useEditorStore.getState().setParseResult(result);
        useEditorStore.getState().setIsParsing(true);
        useEditorStore.getState().setCursor(10, 20);
        useEditorStore.getState().reset();
      });

      const state = useEditorStore.getState();
      expect(state.splText).toBe('');
      expect(state.parseResult).toBeNull();
      expect(state.isParsing).toBe(false);
      expect(state.parseError).toBeNull();
      expect(state.cursorLine).toBe(1);
      expect(state.cursorColumn).toBe(1);
    });
  });
});

describe('selectors', () => {
  beforeEach(() => {
    act(() => {
      useEditorStore.getState().reset();
    });
  });

  describe('selectSplText', () => {
    it('returns SPL text from state', () => {
      act(() => {
        useEditorStore.getState().setSplText('index=main');
      });

      const state = useEditorStore.getState();
      expect(selectSplText(state)).toBe('index=main');
    });

    it('returns empty string when no text set', () => {
      const state = useEditorStore.getState();
      expect(selectSplText(state)).toBe('');
    });
  });

  describe('selectParseResult', () => {
    it('returns parse result from state', () => {
      const result = createSuccessfulParseResult();
      act(() => {
        useEditorStore.getState().setParseResult(result);
      });

      const state = useEditorStore.getState();
      expect(selectParseResult(state)).toBe(result);
    });

    it('returns null when no parse result', () => {
      const state = useEditorStore.getState();
      expect(selectParseResult(state)).toBeNull();
    });
  });

  describe('selectAST', () => {
    it('returns AST from successful parse result', () => {
      const result = createSuccessfulParseResult();
      act(() => {
        useEditorStore.getState().setParseResult(result);
      });

      const state = useEditorStore.getState();
      const ast = selectAST(state);
      expect(ast).not.toBeNull();
      expect(ast?.type).toBe('Pipeline');
    });

    it('returns null when parse result is null', () => {
      const state = useEditorStore.getState();
      expect(selectAST(state)).toBeNull();
    });

    it('returns null when parse result has null AST', () => {
      const result = createFailedParseResult();
      act(() => {
        useEditorStore.getState().setParseResult(result);
      });

      const state = useEditorStore.getState();
      expect(selectAST(state)).toBeNull();
    });
  });

  describe('selectIsParsing', () => {
    it('returns isParsing from state', () => {
      act(() => {
        useEditorStore.getState().setIsParsing(true);
      });

      const state = useEditorStore.getState();
      expect(selectIsParsing(state)).toBe(true);
    });

    it('returns false initially', () => {
      const state = useEditorStore.getState();
      expect(selectIsParsing(state)).toBe(false);
    });
  });

  describe('selectParseError', () => {
    it('returns parse error from state', () => {
      act(() => {
        useEditorStore.getState().setParseError('Syntax error');
      });

      const state = useEditorStore.getState();
      expect(selectParseError(state)).toBe('Syntax error');
    });

    it('returns null when no error', () => {
      const state = useEditorStore.getState();
      expect(selectParseError(state)).toBeNull();
    });
  });

  describe('selectCursor', () => {
    it('returns cursor position object', () => {
      act(() => {
        useEditorStore.getState().setCursor(5, 10);
      });

      const state = useEditorStore.getState();
      const cursor = selectCursor(state);
      expect(cursor).toEqual({ line: 5, column: 10 });
    });

    it('returns initial cursor position', () => {
      const state = useEditorStore.getState();
      const cursor = selectCursor(state);
      expect(cursor).toEqual({ line: 1, column: 1 });
    });
  });
});

describe('store integration', () => {
  beforeEach(() => {
    act(() => {
      useEditorStore.getState().reset();
    });
  });

  it('handles full edit cycle', () => {
    const result = createSuccessfulParseResult();

    // Simulate typing and parsing
    act(() => {
      useEditorStore.getState().setSplText('index=main');
      useEditorStore.getState().setIsParsing(true);
    });

    expect(useEditorStore.getState().isParsing).toBe(true);

    act(() => {
      useEditorStore.getState().setParseResult(result);
      useEditorStore.getState().setIsParsing(false);
    });

    const state = useEditorStore.getState();
    expect(state.isParsing).toBe(false);
    expect(state.parseResult).toBe(result);
    expect(state.parseError).toBeNull();
  });

  it('handles parse error cycle', () => {
    const result = createFailedParseResult();

    act(() => {
      useEditorStore.getState().setSplText('invalid query |||');
      useEditorStore.getState().setIsParsing(true);
      useEditorStore.getState().setParseResult(result);
      useEditorStore.getState().setIsParsing(false);
    });

    const state = useEditorStore.getState();
    expect(state.isParsing).toBe(false);
    expect(state.parseError).toBe('Parse errors occurred');
  });

  it('handles cursor movement with text', () => {
    act(() => {
      useEditorStore.getState().setSplText('line1\nline2\nline3');
      useEditorStore.getState().setCursor(2, 3);
    });

    const state = useEditorStore.getState();
    expect(state.cursorLine).toBe(2);
    expect(state.cursorColumn).toBe(3);
  });
});
