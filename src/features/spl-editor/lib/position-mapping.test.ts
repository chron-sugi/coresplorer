/**
 * Position Mapping Utilities Tests
 *
 * Tests for position mapping utilities.
 *
 * @module features/spl-editor/utils/position-mapping.test
 */
import { describe, it, expect } from 'vitest';
import {
  buildLineOffsetIndex,
  offsetToPosition,
  positionToOffset,
  offsetRangeToPositions,
  isOffsetInRange,
  isPositionOnLine,
  rangesOverlap,
  getLineText,
  countLines,
} from './position-mapping';

describe('buildLineOffsetIndex', () => {
  it('builds index for single line', () => {
    const text = 'hello world';
    const index = buildLineOffsetIndex(text);

    expect(index).toEqual([0]);
  });

  it('builds index for multiple lines', () => {
    const text = 'line1\nline2\nline3';
    const index = buildLineOffsetIndex(text);

    expect(index).toEqual([0, 6, 12]);
  });

  it('handles empty text', () => {
    const text = '';
    const index = buildLineOffsetIndex(text);

    expect(index).toEqual([0]);
  });

  it('handles text with trailing newline', () => {
    const text = 'line1\nline2\n';
    const index = buildLineOffsetIndex(text);

    expect(index).toEqual([0, 6, 12]);
  });
});

describe('offsetToPosition', () => {
  it('converts offset to position on first line', () => {
    const text = 'hello world\nline2';
    const lineOffsets = buildLineOffsetIndex(text);
    const position = offsetToPosition(6, lineOffsets);

    expect(position).toEqual({ line: 1, column: 7 });
  });

  it('converts offset to position on second line', () => {
    const text = 'hello\nworld';
    const lineOffsets = buildLineOffsetIndex(text);
    const position = offsetToPosition(6, lineOffsets);

    expect(position).toEqual({ line: 2, column: 1 });
  });

  it('converts offset at line start', () => {
    const text = 'line1\nline2';
    const lineOffsets = buildLineOffsetIndex(text);
    const position = offsetToPosition(0, lineOffsets);

    expect(position).toEqual({ line: 1, column: 1 });
  });
});

describe('positionToOffset', () => {
  it('converts position to offset on first line', () => {
    const text = 'hello world\nline2';
    const lineOffsets = buildLineOffsetIndex(text);
    const offset = positionToOffset(1, 7, lineOffsets);

    expect(offset).toBe(6);
  });

  it('converts position to offset on second line', () => {
    const text = 'hello\nworld';
    const lineOffsets = buildLineOffsetIndex(text);
    const offset = positionToOffset(2, 1, lineOffsets);

    expect(offset).toBe(6);
  });

  it('returns -1 for invalid line', () => {
    const text = 'hello\nworld';
    const lineOffsets = buildLineOffsetIndex(text);
    const offset = positionToOffset(10, 1, lineOffsets);

    expect(offset).toBe(-1);
  });

  it('returns -1 for line 0', () => {
    const text = 'hello\nworld';
    const lineOffsets = buildLineOffsetIndex(text);
    const offset = positionToOffset(0, 1, lineOffsets);

    expect(offset).toBe(-1);
  });
});

describe('offsetRangeToPositions', () => {
  it('converts range to positions', () => {
    const text = 'hello\nworld';
    const lineOffsets = buildLineOffsetIndex(text);
    const range = offsetRangeToPositions(0, 5, lineOffsets);

    expect(range).toEqual({
      start: { line: 1, column: 1 },
      end: { line: 1, column: 6 },
    });
  });

  it('converts range spanning multiple lines', () => {
    const text = 'hello\nworld';
    const lineOffsets = buildLineOffsetIndex(text);
    const range = offsetRangeToPositions(3, 8, lineOffsets);

    expect(range).toEqual({
      start: { line: 1, column: 4 },
      end: { line: 2, column: 3 },
    });
  });
});

describe('isOffsetInRange', () => {
  it('returns true for offset in range', () => {
    expect(isOffsetInRange(5, 0, 10)).toBe(true);
  });

  it('returns true for offset at start', () => {
    expect(isOffsetInRange(0, 0, 10)).toBe(true);
  });

  it('returns false for offset at end', () => {
    expect(isOffsetInRange(10, 0, 10)).toBe(false);
  });

  it('returns false for offset before range', () => {
    expect(isOffsetInRange(5, 10, 20)).toBe(false);
  });

  it('returns false for offset after range', () => {
    expect(isOffsetInRange(25, 10, 20)).toBe(false);
  });
});

describe('isPositionOnLine', () => {
  it('returns true when position is on line', () => {
    expect(isPositionOnLine({ line: 5, column: 10 }, 5)).toBe(true);
  });

  it('returns false when position is not on line', () => {
    expect(isPositionOnLine({ line: 5, column: 10 }, 3)).toBe(false);
  });
});

describe('rangesOverlap', () => {
  it('returns true for overlapping ranges', () => {
    expect(rangesOverlap(0, 10, 5, 15)).toBe(true);
  });

  it('returns true when range2 is inside range1', () => {
    expect(rangesOverlap(0, 20, 5, 15)).toBe(true);
  });

  it('returns true when range1 is inside range2', () => {
    expect(rangesOverlap(5, 15, 0, 20)).toBe(true);
  });

  it('returns false for non-overlapping ranges', () => {
    expect(rangesOverlap(0, 10, 20, 30)).toBe(false);
  });

  it('returns false for adjacent ranges', () => {
    expect(rangesOverlap(0, 10, 10, 20)).toBe(false);
  });
});

describe('getLineText', () => {
  it('returns text for valid line', () => {
    const text = 'line1\nline2\nline3';
    const lineOffsets = buildLineOffsetIndex(text);
    const lineText = getLineText(text, 2, lineOffsets);

    expect(lineText).toBe('line2');
  });

  it('returns text for first line', () => {
    const text = 'line1\nline2';
    const lineOffsets = buildLineOffsetIndex(text);
    const lineText = getLineText(text, 1, lineOffsets);

    expect(lineText).toBe('line1');
  });

  it('returns text for last line', () => {
    const text = 'line1\nline2\nline3';
    const lineOffsets = buildLineOffsetIndex(text);
    const lineText = getLineText(text, 3, lineOffsets);

    expect(lineText).toBe('line3');
  });

  it('returns null for invalid line', () => {
    const text = 'line1\nline2';
    const lineOffsets = buildLineOffsetIndex(text);
    const lineText = getLineText(text, 10, lineOffsets);

    expect(lineText).toBeNull();
  });

  it('returns null for line 0', () => {
    const text = 'line1\nline2';
    const lineOffsets = buildLineOffsetIndex(text);
    const lineText = getLineText(text, 0, lineOffsets);

    expect(lineText).toBeNull();
  });
});

describe('countLines', () => {
  it('counts single line', () => {
    expect(countLines('hello')).toBe(1);
  });

  it('counts multiple lines', () => {
    expect(countLines('line1\nline2\nline3')).toBe(3);
  });

  it('counts lines with trailing newline', () => {
    expect(countLines('line1\nline2\n')).toBe(3);
  });

  it('counts empty text as one line', () => {
    expect(countLines('')).toBe(1);
  });
});
