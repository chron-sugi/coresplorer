import { describe, it, expect } from 'vitest';
import { extractSplSnippet } from './extractSplSnippet';

describe('extractSplSnippet', () => {
  it('returns null for empty SPL code', () => {
    expect(extractSplSnippet('', 'test')).toBeNull();
  });

  it('returns null for empty search term', () => {
    expect(extractSplSnippet('index=main | stats count', '')).toBeNull();
  });

  it('returns null when search term is not found', () => {
    expect(extractSplSnippet('index=main | stats count', 'nonexistent')).toBeNull();
  });

  it('extracts snippet with match in the middle', () => {
    const spl = 'index=main sourcetype=syslog host=server01 | stats count by host | sort -count | head 10';
    const result = extractSplSnippet(spl, 'stats');
    expect(result).toContain('stats');
    expect(result).toContain('...');
  });

  it('does not add leading ellipsis when match is near the start', () => {
    const spl = 'stats count by host';
    const result = extractSplSnippet(spl, 'stats');
    expect(result).not.toMatch(/^\.\.\./);
    expect(result).toContain('stats');
  });

  it('does not add trailing ellipsis when match is near the end', () => {
    const spl = 'index=main | head 10';
    const result = extractSplSnippet(spl, 'head 10');
    expect(result).not.toMatch(/\.\.\.$/);
    expect(result).toContain('head 10');
  });

  it('collapses multi-line SPL whitespace', () => {
    const spl = 'index=main\n  | stats count\n  | sort -count';
    const result = extractSplSnippet(spl, 'stats');
    expect(result).toContain('stats');
    expect(result).not.toContain('\n');
  });

  it('matches case-insensitively', () => {
    const spl = 'index=MAIN | STATS count by host';
    const result = extractSplSnippet(spl, 'stats');
    expect(result).toContain('STATS');
  });

  it('returns short SPL in full without ellipsis', () => {
    const spl = 'index=main | stats count';
    const result = extractSplSnippet(spl, 'stats');
    expect(result).toBe('index=main | stats count');
  });

  it('enforces max length on very long SPL', () => {
    const spl = 'a'.repeat(50) + 'MATCH' + 'b'.repeat(200);
    const result = extractSplSnippet(spl, 'MATCH');
    expect(result).not.toBeNull();
    expect(result!.length).toBeLessThanOrEqual(120);
  });
});
