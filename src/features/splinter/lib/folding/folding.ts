/**
 * Folding utilities
 *
 * Utilities to derive fold ranges for SPL documents used by the editor
 * panel. Kept pure and testable.
 */
import { SPL_REGEX } from '../../model/constants/splinter.constants';
import type { FoldRange } from '../../model/splinter.schemas';

export { type FoldRange };

export function findFoldableRanges(code: string): FoldRange[] {
  const lines = code.split('\n');
  const ranges: FoldRange[] = [];
  const stack: { type: 'subsearch', startLine: number }[] = [];

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();

    // Check for subsearch start '['
    // This is a naive implementation; a real parser would be better
    // but sufficient for "Smart Folding" prototype
    if (trimmed.includes(SPL_REGEX.SUBSEARCH_START)) {
      // Check if it's not inside a string or comment (simplified)
      stack.push({ type: 'subsearch', startLine: lineNum });
    }

    // Check for subsearch end ']'
    if (trimmed.includes(SPL_REGEX.SUBSEARCH_END)) {
      if (stack.length > 0) {
        const start = stack.pop();
        if (start) {
            // Only fold if it spans multiple lines
            if (lineNum > start.startLine) {
                ranges.push({
                    startLine: start.startLine,
                    endLine: lineNum,
                    type: 'subsearch'
                });
            }
        }
      }
    }
  });

  return ranges;
}
