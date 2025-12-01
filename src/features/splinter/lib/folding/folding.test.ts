import { describe, it, expect } from 'vitest';
import { findFoldableRanges } from './folding';

describe('findFoldableRanges', () => {
  it('finds simple subsearch', () => {
    const code = `search index=main [
      search index=audit
      | stats count
    ]`;
    const ranges = findFoldableRanges(code);
    expect(ranges).toHaveLength(1);
    expect(ranges[0]).toEqual({ startLine: 1, endLine: 4, type: 'subsearch' });
  });

  it('ignores single line brackets', () => {
    const code = `search index=main [ search index=audit ]`;
    const ranges = findFoldableRanges(code);
    expect(ranges).toHaveLength(0);
  });

  it('handles nested subsearches', () => {
    const code = `search index=main [
      search index=audit [
        search index=internal
      ]
    ]`;
    const ranges = findFoldableRanges(code);
    expect(ranges).toHaveLength(2);
    // Inner one first or last depending on implementation, here likely last closed -> first pushed?
    // My stack logic pushes start, pops on end.
    // Line 1: push(1)
    // Line 2: push(2)
    // Line 4: pop() -> 2 to 4
    // Line 5: pop() -> 1 to 5
    
    expect(ranges).toContainEqual({ startLine: 2, endLine: 4, type: 'subsearch' });
    expect(ranges).toContainEqual({ startLine: 1, endLine: 5, type: 'subsearch' });
  });
});
