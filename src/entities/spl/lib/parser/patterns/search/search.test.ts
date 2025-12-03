/**
 * search Command Tests
 *
 * Tests for search command pattern and grammar
 */

import { describe, it, expect } from 'vitest';
import { getCommandPattern } from '../registry';
import { parseSPL } from '../../index';

describe('search command', () => {
  it('has pattern defined', () => {
    const pattern = getCommandPattern('search');
    expect(pattern).toBeDefined();
    expect(pattern?.command).toBe('search');
  });

  it('parses search with keyword and field', () => {
    const result = parseSPL(`error host="webserver1"`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });

  it('parses search with grouped OR and field comparison', () => {
    const result = parseSPL(`(code=10 OR code=29) host!="localhost"`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });

  it('parses piped search command', () => {
    const result = parseSPL(`index=main | search error OR warning`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });
});
