/**
 * Position Mapping Utilities
 *
 * Utilities for mapping between character offsets and line/column positions.
 * Used to connect PrismJS token positions to Chevrotain token positions.
 *
 * @module features/spl-editor/lib/position-mapping
 */

// =============================================================================
// TYPES
// =============================================================================

export interface Position {
  line: number;
  column: number;
}

export interface Range {
  start: Position;
  end: Position;
}

/**
 * Index mapping line numbers to their starting character offsets.
 * Line numbers are 1-indexed.
 */
export type LineOffsetIndex = number[];

// =============================================================================
// LINE OFFSET INDEX
// =============================================================================

/**
 * Build an index of line starting offsets for fast position lookups.
 * 
 * @param text - The source text
 * @returns Array where index i is the starting offset of line i+1
 * 
 * @example
 * const text = "hello\nworld";
 * const index = buildLineOffsetIndex(text);
 * // index = [0, 6]
 * // Line 1 starts at offset 0
 * // Line 2 starts at offset 6
 */
export function buildLineOffsetIndex(text: string): LineOffsetIndex {
  const offsets: number[] = [0]; // Line 1 starts at offset 0
  
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '\n') {
      offsets.push(i + 1); // Next line starts after the newline
    }
  }
  
  return offsets;
}

// =============================================================================
// OFFSET TO POSITION
// =============================================================================

/**
 * Convert a character offset to line/column position.
 * 
 * @param offset - Character offset (0-indexed)
 * @param lineOffsets - Line offset index from buildLineOffsetIndex
 * @returns Position with 1-indexed line and column
 */
export function offsetToPosition(
  offset: number,
  lineOffsets: LineOffsetIndex
): Position {
  // Binary search for the line
  let low = 0;
  let high = lineOffsets.length - 1;
  
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (lineOffsets[mid] <= offset) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }
  
  const line = low + 1; // Convert to 1-indexed
  const column = offset - lineOffsets[low] + 1; // Convert to 1-indexed
  
  return { line, column };
}

/**
 * Convert a character range to start/end positions.
 */
export function offsetRangeToPositions(
  startOffset: number,
  endOffset: number,
  lineOffsets: LineOffsetIndex
): Range {
  return {
    start: offsetToPosition(startOffset, lineOffsets),
    end: offsetToPosition(endOffset, lineOffsets),
  };
}

// =============================================================================
// POSITION TO OFFSET
// =============================================================================

/**
 * Convert a line/column position to character offset.
 * 
 * @param line - Line number (1-indexed)
 * @param column - Column number (1-indexed)
 * @param lineOffsets - Line offset index from buildLineOffsetIndex
 * @returns Character offset (0-indexed)
 */
export function positionToOffset(
  line: number,
  column: number,
  lineOffsets: LineOffsetIndex
): number {
  if (line < 1 || line > lineOffsets.length) {
    return -1;
  }
  
  const lineStartOffset = lineOffsets[line - 1];
  return lineStartOffset + column - 1;
}

// =============================================================================
// TOKEN POSITION HELPERS
// =============================================================================

/**
 * Check if an offset falls within a given range.
 */
export function isOffsetInRange(
  offset: number,
  startOffset: number,
  endOffset: number
): boolean {
  return offset >= startOffset && offset < endOffset;
}

/**
 * Check if a position falls on a given line.
 */
export function isPositionOnLine(position: Position, line: number): boolean {
  return position.line === line;
}

/**
 * Check if two ranges overlap.
 */
export function rangesOverlap(
  range1Start: number,
  range1End: number,
  range2Start: number,
  range2End: number
): boolean {
  return range1Start < range2End && range2Start < range1End;
}

// =============================================================================
// LINE UTILITIES
// =============================================================================

/**
 * Get the text content of a specific line.
 * 
 * @param text - Source text
 * @param line - Line number (1-indexed)
 * @param lineOffsets - Line offset index
 * @returns Line text (without newline) or null if line doesn't exist
 */
export function getLineText(
  text: string,
  line: number,
  lineOffsets: LineOffsetIndex
): string | null {
  if (line < 1 || line > lineOffsets.length) {
    return null;
  }
  
  const startOffset = lineOffsets[line - 1];
  const endOffset = line < lineOffsets.length
    ? lineOffsets[line] - 1  // Exclude newline
    : text.length;
  
  return text.slice(startOffset, endOffset);
}

/**
 * Count total lines in text.
 */
export function countLines(text: string): number {
  let count = 1;
  for (const char of text) {
    if (char === '\n') count++;
  }
  return count;
}
