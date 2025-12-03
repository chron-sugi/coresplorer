/**
 * dedup Command Tests
 *
 * Tests for dedup command pattern and grammar
 */

import { describe, it, expect } from 'vitest';
import { getCommandPattern } from '../registry';
import { parseSPL } from '../../index';

describe('dedup command', () => {
  it('has pattern defined', () => {
    const pattern = getCommandPattern('dedup');
    expect(pattern).toBeDefined();
    expect(pattern?.command).toBe('dedup');
  });

  it('parses dedup with count and field', () => {
    const result = parseSPL(`index=main | dedup 3 source`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });

  it('parses dedup with single field', () => {
    const result = parseSPL(`index=main | dedup host`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });

  it('parses dedup with multiple fields', () => {
    const result = parseSPL(`index=main | dedup host, source`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });
});
